import { collection, doc, getDoc, getDocs, query, setDoc, runTransaction, where, Timestamp, deleteDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { comment } from 'postcss'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: [],
    _entries: [],
    _isLoading: false
  }),

  getters: {
    getComments: (state) => state._comments,
    getEntries: (state) => state._entries,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchComments(slug) {
      this._isLoading = true
      const querySnapshot = await getDocs(query(collection(db, 'entries'), where('slug', '==', slug)))
      const entry = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      const c = query(collection(db, 'entries', entry.id, 'comments'))
      const snap = await getDocs(c)
      const comments = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      for (const comment of comments) {
        comment.author = await getDoc(comment.author).then((doc) => doc.data())
      }
      this._isLoading = false

      this._comments = comments
    },

    async addComment(comment, entry) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      comment.author = !userStore.isAuthenticated ? userStore.getUserIp : userStore.getUserRef
      comment.id = comment.author.id + Date.now()
      comment.created = Timestamp.fromDate(new Date())
      comment.showEdit = false

      this._isLoading = true
      await setDoc(doc(db, 'entries', entry.id, 'comments', comment.id), comment)
        .then(() => this.$patch({ _comments: [...this._comments, { ...comment, author: userStore.getUser }] }))
        .catch((err) => {
          console.log(err)
          throw new Error(err)
        })
        .finally(() => (this._isLoading = false))
    },

    async editComment(editedComment, commentId, entry) {
      const userStore = useUserStore()
      const comment = this.getComments.find((comment) => comment.id === commentId)

      const guyWhoIsEditing = !userStore.isAuthenticated ? userStore.getUserIp : userStore.getUserRef
      const guy = await getDoc(guyWhoIsEditing).then((doc) => doc.data())

      this._isLoading = true
      if(guy.uid === comment.author.uid) {
        await runTransaction(db, async (transaction) => {
          transaction.update(doc(db, 'entries', entry.id, 'comments', comment.id), { text: editedComment })
        })
          .then(() => {
            const index = this.getComments.findIndex((comment) => comment.id === commentId)
            this.$patch({
              _comments: [...this._comments.slice(0, index), { ...this._comments[index], ...comment }, ...this._comments.slice(index + 1)]
            })
          })
          .catch((error) => {
            console.error(error)
            throw new Error(error)
          })
          .finally(() => (this._isLoading = false))
      } else {
        $q.notify({ message: 'Comment submission failed!' })
        return 0;
      }
    },

    async deleteComment(id, entry) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()
      const comment = this.getComments.find((comment) => comment.id === id)

      const guyWhoIsDeleting = !userStore.isAuthenticated ? userStore.getUserIp : userStore.getUserRef

      const guy = await getDoc(guyWhoIsDeleting).then((doc) => doc.data())

      const index = this._comments.findIndex((comment) => comment.id === id)
      // TODO: Check if the user is the author of the comment (check author id with user id)
      this._isLoading = true
      if (index !== -1 && guy.uid === comment.author.uid) {
        await deleteDoc(doc(db, 'entries', entry.id, 'comments', id))
          .then(() => {
            this._comments.splice(index, 1)
          })
          .catch((error) => {
            console.error(error)
            throw new Error(error)
          })
          .finally(() => (this._isLoading = false))
      } else {
        console.log('User is not authorize!');
        $q.notify({ message: 'Comment submission failed!' })
        return 0;
      }
    }
  }
})
