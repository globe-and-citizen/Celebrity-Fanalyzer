import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import { monthDayYear } from 'src/utils/date'

export const useVisitorStore = defineStore('visitors', {
  state: () => ({
    _isLoading: false,
    _visitors: undefined
  }),

  persist: true,

  getters: {
    getVisitors: (state) => state._visitors,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async addVisitor(collectionName, documentId, v = undefined) {
      const userStore = useUserStore()
      const visitorId = v !== undefined ? v : userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp

      const visitorRef = doc(db, collectionName, documentId, 'visitors', visitorId)
      const visitorSnap = await getDoc(visitorRef)

      this._isLoading = true
      if (visitorSnap.exists()) {
        await updateDoc(visitorRef, { visits: arrayUnion(monthDayYear()) })
      } else {
        const visitor = {
          id: visitorId,
          visits: [monthDayYear()]
        }
        await setDoc(visitorRef, visitor)
      }
      this._isLoading = false
    },

    async readVisitors(collectionName, documentId) {
      onSnapshot(collection(db, collectionName, documentId, 'visitors'), (querySnapshot) => {
        this._visitors = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
    },

    async deleteAllVisitors(collectionName, documentId) {
      this._isLoading = true
      const visitorsCollection = collection(db, collectionName, documentId, 'visitors')

      const snapshot = await getDocs(visitorsCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    }
  }
})
