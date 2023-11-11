import { Timestamp, addDoc, collection, onSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _stats: []
  }),

  getters: {
    getStats: (state) => state._stats
  },

  actions: {
    async fetchStats(collectionName, documentId) {
      const fetchData = async (pageToken) => {
        const url = pageToken
          ? `https://api.celebrityfanalyzer.com/${collectionName}/${documentId}/stats?pageToken=${pageToken}`
          : `https://api.celebrityfanalyzer.com/${collectionName}/${documentId}/stats`

        const response = await fetch(url)
        const stats = await response.json()
        this._stats.push(...stats.data)
        return stats.nextPageToken
      }

      let nextPageToken = await fetchData()

      while (nextPageToken) {
        nextPageToken = await fetchData(nextPageToken)
      }
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
