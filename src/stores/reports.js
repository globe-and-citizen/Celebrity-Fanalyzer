import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'
import { useCommentStore } from './comments'

export const useReportStore = defineStore('reports', {
  state: () => ({
    _reports: undefined,
    _isLoading: false,
    _unSubscribe: undefined
  }),

  getters: {
    getReports: (state) => state._reports,
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._reports
  },

  actions: {
    async fetchReports() {
      this._isLoading = true

      if (!this._unSubscribe)
        this._unSubscribe = onSnapshot(collection(db, 'reports'), async (querySnapshot) => {
          const reports = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const report of reports) {
            report.author = await getDoc(report.author).then((doc) => doc.data())
          }
          this.$patch({ _reports: reports })
        })
      this._isLoading = false
    },

    async addReports(report) {
      const userStore = useUserStore()

      report.author = userStore.getUserRef
      report.created = Timestamp.fromDate(new Date())
      report.id = Date.now() + '-' + (report.author.id || report.author)

      this._isLoading = true
      await addDoc(collection(db, 'reports'), report).finally(() => (this._isLoading = false))
    },

    async deleteReport(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'reports', id)).finally(() => (this._isLoading = false))
    },

    async deleteComment(commentId) {
      const commentStore = useCommentStore()
      this._isLoading = true
      await commentStore.deleteComment("entries", "2023-12T1701010519528", commentId)
      this._isLoading = false
    }
  }
})
