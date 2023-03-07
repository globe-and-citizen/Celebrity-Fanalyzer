import { collection, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const useFeedbackStore = defineStore('feedbacks', {
  state: () => ({
    _feedbacks: [],
    _isLoading: false
  }),

  getters: {
    getFeedbacks: (state) => state._feedbacks,
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

    async addFeedback(feedback) {
      const userStore = useUserStore()

      feedback.author = userStore.getUserRef
      feedback.created = Timestamp.fromDate(new Date())

      const docId = Date.now()

      this._isLoading = true
      // BUG: This is not working (use addDoc() maybe)
      await setDoc(doc(db, 'feedbacks', docId), feedback)
        // .then(() => this.$patch({ _feedbacks: [...this._feedbacks, feedback] }))
        .finally(() => (this._isLoading = false))
    }
  }
})
