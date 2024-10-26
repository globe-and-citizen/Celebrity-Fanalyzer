import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { useUserStore } from 'src/stores'
import { db } from 'src/firebase'
import { monthDayYear } from 'src/utils/date'

export const useImpressionsStore = defineStore('impressions', {
  state: () => ({
    _isLoading: false,
    _impressions: undefined
  }),

  // persist: true,

  getters: {
    getImpressions: (state) => state._impressions,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async addImpression(collectionName, documentId) {
      const visitorRef = doc(db, collectionName, documentId, 'impressions', monthDayYear().replaceAll('/', '-'))
      const visitorSnap = await getDoc(visitorRef)
      const userStore = useUserStore()
      const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash

      const lastViewsRef = doc(db, collectionName, documentId, 'lastViews', user_id)
      const lastViewsSnap = await getDoc(lastViewsRef)

      this._isLoading = true
      if (visitorSnap.exists()) {
        await updateDoc(visitorRef, { impression: visitorSnap.data().impression + 1 })
      } else {
        const visitor = {
          id: monthDayYear().replaceAll('/', '-'),
          impression: 1
        }
        await setDoc(visitorRef, visitor)
      }
      this._isLoading = false

      if (lastViewsSnap.exists()) {
        await updateDoc(lastViewsRef, { views: arrayUnion(Timestamp.fromDate(new Date())) })
      } else {
        const visitor = {
          id: user_id,
          views: [Timestamp.fromDate(new Date())]
        }
        await setDoc(lastViewsRef, visitor)
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
