import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  startAfter,
  getCountFromServer
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useErrorStore = defineStore('errors', {
  state: () => ({
    _errors: [],
    _isLoading: false,
    _lastVisible: null,
    _totalErrors: 0
  }),

  getters: {
    getErrors: (state) => state._errors,
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._errors.length,
    totalErrors: (state) => state._totalErrors
  },

  actions: {
    async fetchErrors({ loadMore = false } = {}) {
      this._isLoading = true
      try {
        let queryRef = collection(db, 'errors')

        if (loadMore && this._lastVisible) {
          queryRef = query(queryRef, orderBy('createdAt', 'desc'), startAfter(this._lastVisible), limit(5))
        } else {
          queryRef = query(queryRef, orderBy('createdAt', 'desc'), limit(5))
        }

        const querySnapshot = await getDocs(queryRef)
        const newErrors = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        if (querySnapshot.docs.length > 0) {
          this._lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        }

        await Promise.all(
          newErrors.map(async (error) => {
            if (typeof error.user === 'object') {
              const userDoc = await getDoc(error.user)
              error.user = userDoc.exists() ? userDoc.data() : null
            }
          })
        )
        if (loadMore) {
          this._isLoading = true
          this._errors = [...this._errors, ...newErrors]
        } else {
          this._errors = newErrors
        }
      } catch (error) {
        console.error('Error fetching errors:', error)
      } finally {
        this._isLoading = false
      }
    },

    async fetchErrorsCount() {
      try {
        this._isLoading = false
        const totalCountFunc = await getCountFromServer(collection(db, 'errors'))
        this._totalErrors = totalCountFunc.data().count
        this._isLoading = false
      } catch (e) {
        console.error('Failed fetching errors count', e)
      }
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
        })
    },

    async deleteError(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'errors', id))
        .then(() => (this._errors = this._errors.filter((error) => error.id !== id)))
        .catch((e) => console.error(e))
        .finally(() => {
          this._isLoading = false
        })
    }
  }
})
