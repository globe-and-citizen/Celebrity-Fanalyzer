import { doc, runTransaction, setDoc } from 'firebase/firestore'
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
    async becomeWriter(message) {
      const userStore = useUserStore()

      const payload = {
        createdAt: new Date(),
        message: message,
        status: 'pending',
        request: 'writer'
      }

      this._isLoading = true
      await setDoc(doc(db, 'requests', userStore.getUser.uid), payload)

      runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', userStore.getUser.uid), { askedToBeWriter: true })
      }).finally(() => (this._isLoading = false))
    }
  }
})
