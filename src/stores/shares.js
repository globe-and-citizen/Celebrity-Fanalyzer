import { collection, getCountFromServer } from 'firebase/firestore'
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
    }
  }
})
