import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const useFeedbackStore = defineStore('feedbacks', {
  state: () => ({
    _feedbacks: undefined,
    _isLoading: false
  }),

  getters: {
    getFeedbacks: (state) => state._feedbacks,
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._feedbacks
  },

  actions: {
    async fetchFeedbacks() {
      this._isLoading = true
      await getDocs(collection(db, 'feedbacks'))
        .then(async (querySnapshot) => {
          const feedbacks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const feedback of feedbacks) {
            feedback.author = await getDoc(feedback.author).then((doc) => doc.data())
          }

          this.$patch({ _feedbacks: feedbacks })
        })
        .finally(() => (this._isLoading = false))
    },

    async addFeedback(feedback) {
      const userStore = useUserStore()

      feedback.author = userStore.getUserRef
      feedback.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await addDoc(collection(db, 'feedbacks'), feedback)
        .then(() => this.$patch({ _feedbacks: [...this._feedbacks, feedback] }))
        .finally(() => (this._isLoading = false))
    },

    async deleteFeedback(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'feedbacks', id))
        .then(() => this.$patch({ _feedbacks: this._feedbacks.filter((feedback) => feedback.id !== id) }))
        .finally(() => (this._isLoading = false))
    }
  }
})
