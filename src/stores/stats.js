import { defineStore } from 'pinia'
import { useClicksStore, useCommentStore, useImpressionsStore, useLikeStore, useShareStore } from 'src/stores'
import layer8 from 'layer8_interceptor'

export const baseURL = import.meta.env.VITE_STATS_API_URL
export const useStatStore = defineStore('stats', {
  state: () => ({
    _isLoading: false,
    _stats: [],
    _summary: [],
    _allInteractionsByCountry: [],
    _articleRating: undefined,
    _userRating: undefined,
    _sentiment: '',
    _isInitialized: false
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    getStats: (state) => state._stats,
    getSummary: (state) => state._summary,
    getAllInteractionsByCountry: (state) => state._allInteractionsByCountry,
    getArticleRate: (state) => state._articleRating,
    getUserRate: (state) => state._userRating,
    getSentiment: (state) => state._sentiment,
    getInitializedState: (state) => state._isInitialized
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
      // Parsing the JSON data
      this._summary = await response.json()
      this._isLoading = false
    },

    setInitialized(v) {
      this._isInitialized = v
    },

    resetStats() {
      this._stats = []
      this._allInteractionsByCountry = []
      this._articleRating = undefined
    },

    resetUserRating() {
      this._userRating = undefined
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
      try {
        const statsResponse = await layer8.fetch(`${baseURL}/stats/post`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        })
        const stats = await statsResponse.json()
        this._stats.push(...stats)
      } catch (e) {
        console.error(e)
      }
    },

    /**
     * Adds statistics to a collection for a specific document.
     *
     * @async
     * @param {string} documentId - The ID of the document.
     * @param {user_id} user_id - The ID of user.
     * @param {object} stats - The statistics to be added.
     * @param {string} type - Post type statistics are added to.
     * @returns {Promise<void>} - A promise that resolves when the statistics are successfully added.
     */
    async addStats(documentId, user_id, stats, type) {
      try {
        await layer8.fetch(`${baseURL}/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...stats, user_id, id: documentId, type })
        })
      } catch (error) {
        console.error('Failed to add stats:', error)
      }
    },

    async addTopic(topic_id, user_id, title, content, categories) {
      try {
        await layer8.fetch(`${baseURL}/topic`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id, topic_id, title, content, categories })
        })
      } catch (e) {
        console.error('Failed to add topic:', e)
      }
    },

    async removeTopic(id) {
      try {
        await fetch(`${baseURL}/topic?topic_id=${id}`, {
          method: 'DELETE'
        })
      } catch (e) {
        console.error('Failed to remove topic:', e)
      }
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

    async removeArticle(id) {
      try {
        await fetch(`${baseURL}/article?article_id=${id}`, {
          method: 'DELETE'
        })
      } catch (e) {
        console.error('Failed to remove article:', e)
      }
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

    async removeAd(id) {
      try {
        await fetch(`${baseURL}/advertisement?ad_id=${id}`, {
          method: 'DELETE'
        })
      } catch (e) {
        console.error('Failed to remove article:', e)
      }
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

    async getUserRating(user_id) {
      try {
        const res = await layer8.fetch(`${baseURL}/user-rating`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id })
        })
        const data = await res.json()
        this._userRating = data
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
    },

    // Reset comments, likes, shares, impressions, clicks for the posts
    resetPostImpressions() {
      const commentsStore = useCommentStore()
      const likesStore = useLikeStore()
      const sharesStore = useShareStore()
      const impressionsStore = useImpressionsStore()
      const clicksStore = useClicksStore()

      commentsStore._comments = undefined
      likesStore._likes = undefined
      likesStore._dislikes = undefined
      sharesStore._sharesCount = undefined
      impressionsStore._likes = undefined
      impressionsStore._dislikes = undefined
      clicksStore._clicks = undefined
      this._stats = []
      this._allInteractionsByCountry = []
      this._articleRating = undefined
    }
  }
})
