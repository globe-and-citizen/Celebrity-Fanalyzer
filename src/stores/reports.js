import { collection, deleteDoc, doc, getDoc, onSnapshot, updateDoc, Timestamp, setDoc } from 'firebase/firestore'
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

    async addReports(payload) {
      try {
        const userStore = useUserStore();
        this._isLoading = true;
        const report = {
          ...payload,
          author: userStore.getUserRef,
          created: Timestamp.fromDate(new Date()),
          id: Date.now() + '-' + (payload.author?.id || payload.author),
          status: 'New',
        };
        const reportRef = doc(db, 'reports', report.id);
        await setDoc(reportRef, report);
      } catch (error) {
        console.error('Error adding report:', error.message);
      } finally {
        this._isLoading = false;
      }
    },

    async deleteReport(id) {
      try {
        this._isLoading = true;
        const reportRef = doc(db, 'reports', id);
        await deleteDoc(reportRef);
      } catch (error) {
        console.error('Error deleting document:', error.message);
      } finally {
        this._isLoading = false;
      }
    },

    async editStatusReport(id) {
      const reportRef = doc(db, 'reports', id);

      try {
        const reportSnapshot = await getDoc(reportRef);
        if (reportSnapshot.exists()) {
          const updatedTimestamp = Timestamp.fromDate(new Date());
          await updateDoc(reportRef, {
            status: 'Deleted',
            updated: updatedTimestamp,
          });
        } else {
          console.error('Document does not exist');
        }
      } catch (error) {
        console.error('Error updating document status:', error.message);
      } finally {
        this._isLoading = false;
      }
    },

    async deleteComment(collectionName, documentId, commentId, reportId) {
      try {
        this._isLoading = true;
        const commentStore = useCommentStore();
        await commentStore.deleteComment(collectionName, documentId, commentId);
        await this.editStatusReport(reportId);
      } catch (error) {
        console.error('Error deleting comment:', error.message);
      } finally {
        this._isLoading = false;
      }
    }

  }
})
