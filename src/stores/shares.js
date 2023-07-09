import {collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, Timestamp} from 'firebase/firestore'
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
    async fetchShares(collectionName, documentId) {
      if (this._unSubscribe) {
        this._unSubscribe()
      }
      this._unSubscribe = onSnapshot(collection(db, collectionName, documentId, 'shares'), (querySnapshot) => {
        this._shares = querySnapshot.docs.map((doc) => doc.data())
      })
    },

    async addShare(collectionName, documentId, socialNetwork) {
      this._isLoading = true
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = socialNetwork + '-' + (userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIpHash)

      await setDoc(doc(db, collectionName, documentId, 'shares', docId), {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date()),
        sharedOn: socialNetwork
      })

      this._isLoading = false
    },

    async deleteAllShares(collectionName, documentId) {
      this._isLoading = true
      const sharesCollection = collection(db, collectionName, documentId, 'shares')

      const snapshot = await getDocs(sharesCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    }
  }
})
