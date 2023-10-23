import { Timestamp, addDoc, collection } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    isLoading: (state) => state._isLoading
  },

  actions: {
    async addStats(collectionName, documentId, stats) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      stats.author = userStore.getUserRef
      stats.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await addDoc(collection(db, collectionName, documentId, 'stats'), stats)
      this._isLoading = false
    }
  }
})
