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
    /**
     * Fetches statistics data from an API for a given collection and document ID.
     * Paginates through the data by making multiple requests until all the data is retrieved.
     * Stores the fetched data in the _stats array.
     *
     * @async
     * @param {string} collectionName - The name of the collection.
     * @param {string} documentId - The ID of the document.
     * @returns {Promise<void>} - A promise that resolves when all the data has been fetched and stored.
     */
    async fetchStats(collectionName, documentId) {
      /**
       * Fetches data from the API based on the provided page token.
       *
       * @async
       * @param {string} pageToken - The page token for pagination.
       * @returns {Promise<string>} - A promise that resolves with the next page token.
       */
      const fetchData = async (pageToken) => {
        const url = pageToken
          ? `https://api.celebrityfanalyzer.com/${collectionName}/${documentId}/stats?pageSize=100&pageToken=${pageToken}`
          : `https://api.celebrityfanalyzer.com/${collectionName}/${documentId}/stats?pageSize=100`

        const response = await fetch(url) // Using native JavaScript fetch API
        const stats = await response.json() // Parsing the JSON data
        this._stats.push(...stats.data) // Adding the data to the store
        return stats.nextPageToken
      }

      let nextPageToken = undefined

      do {
        nextPageToken = await fetchData(nextPageToken)
      } while (nextPageToken)
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
