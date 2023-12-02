import { defineStore } from 'pinia'
import { useUserStore } from 'src/stores'

const baseURL = 'https://stats-api.up.railway.app/v1'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _isLoading: false,
    _stats: [],
    _summary: []
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    getStats: (state) => state._stats,
    getSummary: (state) => state._summary
  },

  actions: {
    /**
     * Fetches summary data from an API for a given collection and document ID.
     *
     * @async
     * @param {string} documentId - The ID of the document.
     * @returns {Promise<void>} - A promise that resolves when all the data has been fetched and stored.
     */
    async fetchSummary(documentId) {
      this._isLoading = true
      const response = await fetch(`${baseURL}/summary?prompt_id=${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this._summary = await response.json() // Parsing the JSON data
      this._isLoading = false
    },

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
      const response = await fetch(`${baseURL}/stats?post_id=${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const stats = await response.json() // Parsing the JSON data
      this._stats.push(...stats)
    },

    /**
     * Adds statistics to a collection for a specific document.
     *
     * @async
     * @param {string} documentId - The ID of the document.
     * @param {object} stats - The statistics to be added.
     * @returns {Promise<void>} - A promise that resolves when the statistics are successfully added.
     */
    async addStats(documentId, stats) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      stats.user_id = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIpHash
      stats.post_id = documentId

      await fetch(`${baseURL}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stats)
      })
    }
  }
})
