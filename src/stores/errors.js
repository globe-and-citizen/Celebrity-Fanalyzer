import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useErrorStore = defineStore('errors', {
  state: () => ({
    _errors: undefined,
    _isLoading: false,
    _unSubscribe: undefined
  }),

  getters: {
    getErrors: (state) => state._errors,
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._errors
  },

  actions: {
    async fetchErrors() {
      this._isLoading = true
      this._unSubscribe = onSnapshot(collection(db, 'errors'), async (querySnapshot) => {
        const errors = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const error of errors) {
          if (typeof error.user === 'object') {
            error.user = await getDoc(error.user).then((doc) => doc.data())
          }
        }

        this.$patch({ _errors: errors })
      })
      this._isLoading = false
    },

    async throwError(error, message) {
      const userStore = useUserStore()
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
          // throw new Error(error)
        })
    },

    async deleteError(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'errors', id))
        .catch((e) => console.error(e))
        .finally(() => (this._isLoading = false))
    }
  }
})
