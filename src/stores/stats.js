import { defineStore } from 'pinia'
import { useUserStore } from 'src/stores'
import layer8 from 'layer8_interceptor'

export const baseURL = 'https://stats-api.up.railway.app/v1'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _isLoading: false,
    _stats: [],
    _summary: [],
    _allInteractionsByCountry: [],
    _articleRating: [],
    _sentiment: ''
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    getStats: (state) => state._stats,
    getSummary: (state) => state._summary,
    getAllInteractionsByCountry: (state) => state._allInteractionsByCountry,
    getArticleRate: (state) => state._articleRating,
    getSentiment: (state) => state._sentiment
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
      const response = await fetch(`${baseURL}/stats/article?article_id=${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this._summary = await response.json() // Parsing the JSON data
      this._isLoading = false
    },

    resetStats() {
      this._stats = []
      this._allInteractionsByCountry = []
      this._articleRating = []
    },

    // /**
    //  * Fetches statistics data from an API for a given collection and document ID.
    //  * Paginates through the data by making multiple requests until all the data is retrieved.
    //  * Stores the fetched data in the _stats array.
    //  *
    //  * @async
    //  * @param {string} documentId - The ID of the document.
    //  * @returns {Promise<void>} - A promise that resolves when all the data has been fetched and stored.
    //  */
    async fetchStats(id) {
      const statsResponse = await layer8.fetch(`${baseURL}/stats/article`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
      const stats = await statsResponse.json()
      this._stats.push(...stats)
    },

    /**
     * Adds statistics to a collection for a specific document.
     *
     * @async
     * @param {string} documentId - The ID of the document.
     * @param {object} stats - The statistics to be added.
     * @param {string} type - Post type statistics are added to.
     * @returns {Promise<void>} - A promise that resolves when the statistics are successfully added.
     */
    async addStats(documentId, stats, type) {
      const userStore = useUserStore()
      const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash
      const id = documentId

      await layer8.fetch(`${baseURL}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...stats, user_id, id, type })
      })
    },

    async addTopic(topic_id, user_id, title, content, categories) {
      await layer8.fetch(`${baseURL}/topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, topic_id, title, content, categories })
      })
    },

    async addArticle(article_id, topic_id, user_id, title, content) {
      await layer8.fetch(`${baseURL}/article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, article_id, topic_id, title, content })
      })
    },

    async addAdvertisement(ad_id, user_id, title, content, budget, duration) {
      await layer8.fetch(`${baseURL}/advertisement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, ad_id, title, content, budget, duration })
      })
    },

    async addUser(user_id, location) {
      try {
        const response = await layer8.fetch(`${baseURL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id, location })
        })
        if (!response.ok) {
          const errorText = await response.text()
          console.log('Error:', errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
      } catch (error) {
        console.log('Request failed', error)
      }
    },

    async getArticleMetrics(id) {
      try {
        const res = await layer8.fetch(`${baseURL}/stats/metrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        })
        const data = await res.json()
        this._allInteractionsByCountry = data
        return data
      } catch (err) {
        console.log(err)
        return null
      }
    },

    async getArticleRating(id) {
      try {
        const res = await layer8.fetch(`${baseURL}/post-rating`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        })
        const data = await res.json()
        this._articleRating = data
        return data
      } catch (err) {
        console.log(err)
        return null
      }
    },

    async getCommentsAnalysis(id, comments) {
      this._isLoading = true
      try {
        const res = await layer8.fetch(`${baseURL}/comments/analyze`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id, comments })
        })
        const sentiment = await res.json()
        this._sentiment = sentiment.response
        this._isLoading = false
        return sentiment
      } catch (err) {
        console.log(err)
        return null
      }
    }
  }
})
