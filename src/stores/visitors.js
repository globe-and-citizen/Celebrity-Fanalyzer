import { arrayUnion, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import { monthDayYear } from 'src/utils/date'

export const useVisitorStore = defineStore('visitors', {
  state: () => ({
    _isLoading: false,
    _visitors: []
  }),

  persist: true,

  getters: {
    getVisitors: (state) => state._visitors,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async addVisitor(collectionName, documentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const visitorId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp

      const visitorRef = doc(db, collectionName, documentId, 'visitors', visitorId)
      const visitorSnap = await getDoc(visitorRef)

      this._isLoading = true
      if (visitorSnap.exists()) {
        await updateDoc(visitorRef, { visits: arrayUnion(monthDayYear()) })
      } else {
        const visitor = {
          id: userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp,
          visits: [monthDayYear()]
        }
        await setDoc(visitorRef, visitor)
      }
      this._isLoading = false
    },

    async readVisitors(collectionName, documentId) {
      onSnapshot(collection(db, collectionName, documentId, 'visitors'), (querySnapshot) => {
        const visitors = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        this._visitors = visitors
      })
    }
  }
})
