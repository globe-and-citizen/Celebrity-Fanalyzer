import { defineStore } from 'pinia'
import { useClicksStore, useCommentStore, useImpressionsStore, useLikeStore, useShareStore } from 'src/stores'
import { mock_layer8_interceptor } from 'mock_layer8_module'

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

    async fetchStats(id) {
      try {
        const statsResponse = await mock_layer8_interceptor.fetch(`${baseURL}/stats/post?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
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
        await mock_layer8_interceptor.fetch(`${baseURL}/stats`, {
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
        await mock_layer8_interceptor.fetch(`${baseURL}/topic`, {
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
      await mock_layer8_interceptor.fetch(`${baseURL}/article`, {
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
      await mock_layer8_interceptor.fetch(`${baseURL}/advertisement`, {
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
        const response = await mock_layer8_interceptor.fetch(`${baseURL}/users`, {
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
        const res = await mock_layer8_interceptor.fetch(`${baseURL}/stats/metrics?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
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
        const res = await mock_layer8_interceptor.fetch(`${baseURL}/post-rating?post_id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()
        if (data && data.postRating !== undefined) {
          this._articleRating = data.postRating
          return data.postRating
        } else {
          return null
        }
      } catch (err) {
        console.log(err)
        return null
      }
    },

    async getUserRating(user_id) {
      try {
        const res = await mock_layer8_interceptor.fetch(`${baseURL}/user-rating?user_id=${user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()
        if (data && data.userRating !== undefined) {
          this._userRating = data.userRating
          return data.userRating
        } else {
          return null
        }
      } catch (err) {
        console.log(err)
        return null
      }
    },

    async getCommentsAnalysis(id, comments) {
      this._isLoading = true
      try {
        const res = await mock_layer8_interceptor.fetch(`${baseURL}/comments/analyze`, {
          method: 'POST',
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
