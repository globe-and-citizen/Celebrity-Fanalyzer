import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const useFeedbackStore = defineStore('feedbacks', {
  state: () => ({
    _feedbacks: undefined,
    _isLoading: false,
    _unSubscribe: undefined
  }),

  getters: {
    getFeedbacks: (state) => state._feedbacks,
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._feedbacks
  },

  actions: {
    async fetchFeedbacks() {
      this._isLoading = true

      // TO avoid a subscription every time we call fetch FeedBacks
      if (!this._unSubscribe)
        this._unSubscribe = onSnapshot(collection(db, 'feedbacks'), async (querySnapshot) => {
          const feedbacks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const feedback of feedbacks) {
            feedback.author = await getDoc(feedback.author).then((doc) => doc.data())
          }
          this.$patch({ _feedbacks: feedbacks })
        })
      this._isLoading = false
    },

    async addFeedback(feedback) {
      const userStore = useUserStore()

      feedback.author = userStore.getUserRef
      feedback.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await addDoc(collection(db, 'feedbacks'), feedback).finally(() => (this._isLoading = false))
    },

    async deleteFeedback(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'feedbacks', id)).finally(() => (this._isLoading = false))
    }
  }
})
