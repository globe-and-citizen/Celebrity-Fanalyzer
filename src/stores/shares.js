import { collection, deleteDoc, doc, getCountFromServer, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useShareStore = defineStore('shares', {
  state: () => ({
    _shares: 0
  }),

  persist: true,

  getters: {
    getShares: (state) => state._shares
  },

  actions: {
    async countShares(collectionName, documentId) {
      const sharesCollection = collection(db, collectionName, documentId, 'shares')

      const snapshot = await getCountFromServer(sharesCollection)

      this._shares = snapshot.data().count
    },

    async addShare(collectionName, documentId, socialNetwork) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = socialNetwork + '-' + (userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp)

      await setDoc(doc(db, collectionName, documentId, 'shares', docId), {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date()),
        sharedOn: socialNetwork
      })

      this.countShares(collectionName, documentId)
    },

    async deleteAllShares(collectionName, documentId) {
      const sharesCollection = collection(db, collectionName, documentId, 'shares')

      const snapshot = await getDocs(sharesCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
    }
  }
})
