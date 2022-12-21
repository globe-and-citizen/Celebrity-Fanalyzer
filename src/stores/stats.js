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
      const projectId = '12785650'
      const timestamp = Math.floor(Date.now() / 1000)
      const SHA1 = sha1(`?vn=3&s=summary&pi=${projectId}&t=${timestamp}&u=arnonrdp4L!Ljtn48^+_Q1ML`)
      const url = `https://api.statcounter.com/stats?vn=3&s=summary&pi=${projectId}&t=${timestamp}&u=arnonrdp&sha1=${SHA1}`

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          this._stats= data
          console.info('Success:', data)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
})
