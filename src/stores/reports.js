import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import { monthDayYear } from 'src/utils/date'

export const useReportStore = defineStore('reports', {
  state: () => ({
    _isLoading: false,
    _reports: []
  }),

  persist: true,

  getters: {
    getReports: (state) => state._reports,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async create(collectionName, documentId, comment) {
      const userStore = useUserStore()

      const reportId = new Date().getTime().toString()

      const report = {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: monthDayYear(),
        comment: comment.text,
        document: doc(db, collectionName, documentId),
        id: reportId,
        isResolved: false,
        target: comment.author.uid || 'Anonymous'
      }

      console.log(comment)
      console.log(report)

      await setDoc(doc(db, 'reports', reportId), report).finally(() => (this._isLoading = false))
    },

    async read() {
      await getDocs(collection(db, 'reports')).then((querySnapshot) => {
        const reports = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        this._reports = reports
      })
    }
  }
})
