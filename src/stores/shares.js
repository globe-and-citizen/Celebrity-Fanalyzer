import { collection, deleteDoc, doc, getCountFromServer, getDocs, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const useShareStore = defineStore('shares', {
  state: () => ({
    _shares: 0
  }),

  getters: {
    getShares: (state) => state._shares
  },

  actions: {
    async countPromptShares(promptId) {
      const sharesCollection = collection(db, 'prompts', promptId, 'shares')

      const snapshot = await getCountFromServer(sharesCollection)

      this._shares = snapshot.data().count
    },

    async sharePrompt(promptId, socialNetwork) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = `${userStore.getUserIp}-${socialNetwork}`

      await setDoc(doc(db, 'prompts', promptId, 'shares', docId), {
        author: userStore.getUserRef,
        createdAt: Date.now(),
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

      const docId = `${userStore.getUserIp}-${socialNetwork}`

      await setDoc(doc(db, 'entries', entryId, 'shares', docId), {
        author: userStore.getUserRef,
        createdAt: Date.now(),
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
