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
import { useEntryStore } from 'src/stores'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: [],
    _isLoading: false,

    _entries: [],
    _isLoading: false,
  }),

  getters: {
    getComments: (state) => state._comments,
    isLoading: (state) => state._isLoading,

    getEntries: (state) => state._entries,
    isLoading: (state) => state._isLoading,
  },

  actions: {
    async fetchComments(slug) {
      const q = query(collection(db, 'entries'), where('slug', '==', slug))
      this._isLoading = true
      const querySnapshot = await getDocs(q)

      const entries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      // entry.author = await getDoc(entry.author).then((doc) => doc.data())
      // entry.prompt = await getDoc(entry.prompt).then((doc) => doc.data())

      this._isLoading = false

      return entries.comments
    },

    async addComment(comment, entry) {
      const userStore = useUserStore()

      comment.author = userStore.getUserRef
      comment.id = new Date().toJSON()

      console.log('entry.id', entry.id)
      console.log({ comment })

      this._isLoading = true
      await setDoc(doc(db, 'entries', entry.id, 'comments', comment.id), comment)
        .catch((err) => {
          console.log(err)
          throw new Error(err)
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
