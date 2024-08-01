import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loadingStore', {
  state: () => ({
    _isLoading: false
  }),
  actions: {
    showLoading() {
      this._isLoading = true
    },
    hideLoading() {
      this._isLoading = false
    }
  },
  getters: {
    isLoading(state) {
      return state._isLoading
    }
  }
})
