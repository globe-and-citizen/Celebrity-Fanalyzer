import { Timestamp, addDoc, collection, onSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

const baseURL = 'https://stats-api.up.railway.app/v1/stats'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _stats: []
  }),

  getters: {
    getStats: (state) => state._stats
  },

  actions: {
    /**
     * Fetches statistics data from an API for a given collection and document ID.
     * Paginates through the data by making multiple requests until all the data is retrieved.
     * Stores the fetched data in the _stats array.
     *
     * @async
     * @param {string} documentId - The ID of the document.
     * @returns {Promise<void>} - A promise that resolves when all the data has been fetched and stored.
     */
    async fetchStats(documentId) {
      const response = await fetch(baseURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_id: documentId
        })
      })

      const stats = await response.json() // Parsing the JSON data
      this._stats.push(...stats)
      console.log(this._stats)
    },

    async addStats(documentId, stats) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      stats.user_id = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIpHash
      stats.post_id = documentId

      await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stats)
      })
    }
  }
})
