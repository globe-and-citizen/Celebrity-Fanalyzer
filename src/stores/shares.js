import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useShareStore = defineStore('shares', {
  state: () => ({
    _shares: undefined,
    _unSubscribe: undefined,
    _isLoading: false
  }),

  persist: true,

  getters: {
    getShares: (state) => state._shares,
    isLoaded: (state) => !!state._shares,
    isLoading: (state) => state._isLoading
  },

  actions: {
    // async fetchShares(collectionName, documentId) {
    //   if (this._unSubscribe) {
    //     this._unSubscribe()
    //   }
    //   this._unSubscribe = onSnapshot(collection(db, collectionName, documentId, 'shares'), (querySnapshot) => {
    //     this._shares = querySnapshot.docs.map((doc) => doc.data())
    //   })
    // },

    async fetchShares(collectionName, documentId) {
      try {
        const sharesCollection = collection(db, collectionName, documentId, 'shares')
        const querySnapshot = await getDocs(sharesCollection)
        this._shares = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      } catch (e) {
        console.error('Error fetching shares:', e)
      }
    },

    async addShare(collectionName, documentId, socialNetwork) {
      try {
        this._isLoading = true
        const userStore = useUserStore()
        await userStore.fetchUserIp()

        const docId = socialNetwork + '-' + (userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIpHash)

        await setDoc(doc(db, collectionName, documentId, 'shares', docId), {
          author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
          createdAt: Timestamp.fromDate(new Date()),
          sharedOn: socialNetwork
        })
        await this.fetchShares(collectionName, documentId)
        this._isLoading = false
      } catch (e) {
        console.error('Error adding share:', e)
      } finally {
        this._isLoading = false
      }
    },

    async deleteAllShares(collectionName, documentId) {
      this._isLoading = true
      const sharesCollection = collection(db, collectionName, documentId, 'shares')

      const snapshot = await getDocs(sharesCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    },

    async resetShares() {
      this._shares = undefined
    }
  }
})
