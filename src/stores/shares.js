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

    async countPromptShares(promptId) {
      const sharesCollection = collection(db, 'prompts', promptId, 'shares')

      const snapshot = await getCountFromServer(sharesCollection)

      this._shares = snapshot.data().count
    },

    async sharePrompt(promptId, socialNetwork) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = socialNetwork + '-' + (userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp)

      await setDoc(doc(db, 'prompts', promptId, 'shares', docId), {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date()),
        sharedOn: socialNetwork
      })

      this.countPromptShares(promptId)
    },

    async countEntryShares(entryId) {
      const sharesCollection = collection(db, 'entries', entryId, 'shares')

      const snapshot = await getCountFromServer(sharesCollection)

      this._shares = snapshot.data().count
    },

    async shareEntry(entryId, socialNetwork) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = socialNetwork + '-' + (userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp)

      await setDoc(doc(db, 'entries', entryId, 'shares', docId), {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date()),
        sharedOn: socialNetwork
      })

      this.countEntryShares(entryId)
    },

    async deleteAllPromptShares(promptId) {
      const sharesCollection = collection(db, 'prompts', promptId, 'shares')

      const snapshot = await getDocs(sharesCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
    },

    async deleteAllEntryShares(entryId) {
      const sharesCollection = collection(db, 'entries', entryId, 'shares')

      const snapshot = await getDocs(sharesCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
    }
  }
})
