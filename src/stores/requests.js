import { collection, doc, getDoc, getDocs, onSnapshot, runTransaction, setDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useRequestStore = defineStore('request', {
  state: () => ({
    _isLoading: false,
    _requests: []
  }),

  persist: true,

  getters: {
    getRequests: (state) => state._requests,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async readRequests() {
      const userStore = useUserStore()

      this._isLoading = true
      onSnapshot(collection(db, 'requests'), async (querySnapshot) => {
        const requests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((request) => request.status === 'pending')

        for (const request of requests) {
          request.user = userStore.getUserById(request.id) || (await userStore.fetchUser(request.id))
        }

        this.$patch({ _requests: requests })
      })
      this._isLoading = false
    },

    async becomeWriter(message) {
      const userStore = useUserStore()

      const payload = {
        createdAt: new Date(),
        message: message,
        status: 'pending',
        request: 'writer',
        requester: userStore.getUserRef
      }

      this._isLoading = true
      await setDoc(doc(db, 'requests', userStore.getUser.uid), payload)

      runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', userStore.getUser.uid), { askedToBeWriter: true })
      }).finally(() => (this._isLoading = false))
    },

    async acceptWriter(userId) {
      this._isLoading = true
      updateDoc(doc(db, 'requests', userId), { status: 'accepted' })

      runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', userId), { acceptedAsWriter: true, role: 'Writer' })
      }).finally(() => (this._isLoading = false))
    },

    async denyWriter(userId) {
      this._isLoading = true
      updateDoc(doc(db, 'requests', userId), { status: 'denied' })

      runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', userId), { acceptedAsWriter: false, role: 'User' })
      }).finally(() => (this._isLoading = false))
    }
  }
})
