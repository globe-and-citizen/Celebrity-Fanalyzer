import { Timestamp, addDoc, collection, onSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _stats: undefined
  }),

  getters: {
    getStats: (state) => state._stats
  },

  actions: {
    async fetchStats(collectionName, documentId) {
      onSnapshot(collection(db, collectionName, documentId, 'stats'), (querySnapshot) => {
        this._stats = querySnapshot.docs.map((doc) => doc.data())
      })
    },

    async addStats(collectionName, documentId, stats) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      stats.author = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      stats.created = Timestamp.fromDate(new Date())

      await addDoc(collection(db, collectionName, documentId, 'stats'), stats)
    }
  }
})
