import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: [],
    _isLoading: false,

    _entries: [],
    _isLoading: false,
  }),

  getters: {
    getComments: (state) => LocalStorage.getItem('comments') || state._comments,
    isLoading: (state) => state._isLoading,

    getEntries: (state) => state._entries,
    isLoading: (state) => state._isLoading,
  },

  actions: {
    async fetchComments(id) {
      this._isLoading = true
      return await getDoc(doc(db, 'entries', id))
        .then(async (doc) => {
          if (doc.data === undefined) {
            throw new Error('Data not found.')
          }
          const entry = { id: doc.id, ...doc.data() }
          entry.author = await getDoc(entry.author).then((doc) => doc.data())

          if (entry.comments?.length) {
            for (const index in entry.comments) {
              entry.comments[index] = await getDoc(entry.comments[index]).then((doc) => doc.data())
              entry.comments[index].author = await getDoc(entry.comments[index].author).then((doc) => doc.data())
            }
          }
          return entry
        })
        .catch((err) => {
          throw new Error(err)
        })
        .finally(() => (this._isLoading = false))
    },

    async addComment(comment, entry) {
      console.log(comment, entry)
      const entryRef = doc(db, 'entries', entry.id)
      this._isLoading = true
      await updateDoc(doc(db, 'entries', entry.id), {
        comments: arrayUnion(entryRef)
      })
      console.log("updatedoc")
        .then(() => this.fetchComments(entry.id, comment))
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editComment(entry) {
      console.log(entry)
    },

    async deleteComment(id) {
      console.log(id)
    }
  }
})
