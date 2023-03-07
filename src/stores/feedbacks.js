import { collection, getDocs } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'

export const useFeedbackStore = defineStore('feedbacks', {
  state: () => ({
    _feedbacks: [],
    _isLoading: false
  }),

  getters: {
    getErrors: (state) => state._feedbacks,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchFeedbacks() {
      this._isLoading = true
      await getDocs(collection(db, 'feedbacks'))
        .then((querySnapshot) => {
          const feedbacks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          this.$patch({ _feedbacks: feedbacks })
        })
        .finally(() => (this._isLoading = false))
    },

    async addFeedback(feedback) {}
  }
})
