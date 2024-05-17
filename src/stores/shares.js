import { collection, deleteDoc, doc, getCountFromServer, getDocs, setDoc, Timestamp } from 'firebase/firestore'
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
    isLoaded: (state) => !!state._shares || state._shares === 0,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchShares(collectionName, documentId) {
      try {
        const totalCountFunc = await getCountFromServer(collection(db, collectionName, documentId, 'shares'))
        this._shares = totalCountFunc.data().count
        this._isLoading = false
      } catch (e) {
        console.error('Failed fetching shares count', e)
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
