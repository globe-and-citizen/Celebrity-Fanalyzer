import { collection, doc, getCountFromServer, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const useShareStore = defineStore('shares', {
  state: () => ({
    _promptShares: 0,
    _entryShares: 0
  }),

  getters: {
    getPromptShares: (state) => state._promptShares,
    getEntryShares: (state) => state._entryShares
  },

  actions: {
    async countPromptShares(promptId) {
      const sharesCollection = collection(db, 'prompts', promptId, 'shares')

      const snapshot = await getCountFromServer(sharesCollection)

      this._promptShares = snapshot.data().count
    },

    async sharePrompt(promptId, socialNetwork) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      const docId = `${userStore.getBrowserId}-${socialNetwork}`

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

      this._entryShares = snapshot.data().count
    },

    async shareEntry(entryId, socialNetwork) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      const docId = `${userStore.getBrowserId}-${socialNetwork}`

      await setDoc(doc(db, 'entries', entryId, 'shares', docId), {
        author: userStore.getUserRef,
        createdAt: Date.now(),
        sharedOn: socialNetwork
      })

      this.countEntryShares(entryId)
    }
  }
})
