import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { monthDayYear } from 'src/utils/date'

export const useClicksStore = defineStore('clicks', {
  state: () => ({
    _isLoading: false,
    _clicks: undefined
  }),

  persist: true,

  getters: {
    getClicks: (state) => state._clicks,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async addClick(collectionName, documentId) {
      const visitorRef = doc(db, collectionName, documentId, 'clicks', monthDayYear().replaceAll('/', '-'))
      const visitorSnap = await getDoc(visitorRef)

      this._isLoading = true
      if (visitorSnap.exists()) {
        await updateDoc(visitorRef, { clicked: visitorSnap.data().clicked + 1 })
      } else {
        const visitor = {
          id: monthDayYear().replaceAll('/', '-'),
          clicked: 1
        }
        await setDoc(visitorRef, visitor)
      }
      this._isLoading = false
    },

    async readClicks(collectionName, documentId) {
      onSnapshot(collection(db, collectionName, documentId, 'clicks'), (querySnapshot) => {
        this._clicks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
    },

    async deleteAllClicks(collectionName, documentId) {
      this._isLoading = true
      const visitorsCollection = collection(db, collectionName, documentId, 'clicks')

      const snapshot = await getDocs(visitorsCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    }
  }
})
