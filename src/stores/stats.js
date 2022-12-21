import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import sha1 from 'sha1'

export const useStatStore = defineStore('stats', {
  state: () => ({
    _stats: [],
    _isLoading: false
  }),

  getters: {
    getStats: (state) => LocalStorage.getItem('stats') || state._stats,
    isLoading: (state) => state._isLoading
  },

  actions: {
    fetchStats() {
      const projectId = import.meta.env.VITE_STATCOUNTER_PROJECTID
      const username = import.meta.env.VITE_STATCOUNTER_USER
      const password = import.meta.env.VITE_STATCOUNTER_PASSWORD
      const timestamp = Math.floor(Date.now() / 1000)
      const SHA1 = sha1(`?vn=3&s=summary&pi=${projectId}&t=${timestamp}&u=${username}${password}`)
      const url = `https://api.statcounter.com/stats?vn=3&s=summary&pi=${projectId}&t=${timestamp}&u=${username}&sha1=${SHA1}`

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          this._stats= data
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
})
