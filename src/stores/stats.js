import { Timestamp, addDoc, collection, onSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _isLoading: false,
    _stats: undefined
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    getStats: (state) => state._stats
  },

  actions: {
    async fetchStats(collectionName, documentId) {
      this._isLoading = true
      onSnapshot(collection(db, collectionName, documentId, 'stats'), (querySnapshot) => {
        this._stats = querySnapshot.docs.map((doc) => doc.data())
      })
    },

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
