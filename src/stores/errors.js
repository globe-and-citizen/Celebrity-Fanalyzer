import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useErrorStore = defineStore('errors', {
  state: () => ({
    _errors: [],
    _isLoading: false
  }),

  getters: {
    getErrors: (state) => state._errors,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchErrors() {
      this._isLoading = true
      await getDocs(collection(db, 'errors'))
        .then(async (querySnapshot) => {
          const errors = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const error of errors) {
            if (typeof error.user === 'object') {
              error.user = await getDoc(error.user).then((doc) => doc.data())
            }
          }

          this.$patch({ _errors: errors })
        })
        .finally(() => (this._isLoading = false))
    },

    async throwError(error, message) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const err = {
        createdAt: Timestamp.fromDate(new Date()),
        error: error.stack,
        user: userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIp
      }

      await addDoc(collection(db, 'errors'), err)
        .then(() => console.log('Error stored in database'))
        .catch((e) => console.error(e))
        .finally(() => {
          if (message) {
            Notify.create({ message, type: 'negative' })
          }
          throw new Error(error)
        })
    },

    async deleteError(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'errors', id))
        .then(() => this.$patch({ _errors: this._errors.filter((error) => error.id !== id) }))
        .catch((e) => console.error(e))
        .finally(() => (this._isLoading = false))
    }
  }
})
