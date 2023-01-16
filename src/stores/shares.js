import { collection, doc, getCountFromServer, setDoc } from 'firebase/firestore'
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
      console.log(promptId, socialNetwork)
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      const docId = `${userStore.getBrowserId}-${socialNetwork}`

      await setDoc(doc(db, 'prompts', promptId, 'shares', docId), {
        author: userStore.getUserRef,
        createdAt: Date.now(),
        sharedOn: socialNetwork
      })

      this.countPromptShares(promptId)
    }
  }
})
