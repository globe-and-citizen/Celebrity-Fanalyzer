import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
  writeBatch
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { useUserStore } from 'src/stores'
import { db } from 'src/firebase'
import { monthDayYear } from 'src/utils/date'
import firebase from 'firebase/compat'
import { LocalStorage } from 'quasar'

export const useImpressionsStore = defineStore('impressions', {
  state: () => ({
    _isLoading: false,
    _impressions: undefined
  }),

  getters: {
    getImpressions: (state) => state._impressions,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async addImpression(impressions) {
      this._isLoading = true
      const batch = writeBatch(db)
      const formattedDate = monthDayYear().replaceAll('/', '-')

      try {
        const userStore = useUserStore()
        const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash()

        for (const [adId, count] of Object.entries(impressions)) {
          const impressionRef = doc(db, 'advertises', adId, 'impressions', formattedDate)
          const lastViewsRef = doc(db, 'advertises', adId, 'lastViews', user_id)

          batch.set(impressionRef, { impression: firebase.firestore.FieldValue.increment(count) }, { merge: true })

          batch.set(
            lastViewsRef,
            { views: firebase.firestore.FieldValue.arrayUnion(firebase.firestore.Timestamp.fromDate(new Date())) },
            { merge: true }
          )

          LocalStorage.remove(adId)
        }

        batch
          .commit()
          .then(() => {
            console.log('Batch update completed successfully.')
          })
          .catch((error) => {
            console.error('Error committing batch update:', error)
          })
      } catch (e) {
        console.error('Error during batch update:', e)
      } finally {
        this._isLoading = false
      }
    },

    async readImpressions(collectionName, documentId) {
      onSnapshot(collection(db, collectionName, documentId, 'impressions'), (querySnapshot) => {
        this._impressions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
    },

    async deleteAllImpressions(collectionName, documentId) {
      this._isLoading = true
      const impressionsCollection = collection(db, collectionName, documentId, 'impressions')

      const snapshot = await getDocs(impressionsCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    }
  }
})
