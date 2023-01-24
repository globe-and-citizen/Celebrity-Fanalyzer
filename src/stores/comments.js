import { collection, deleteDoc, doc, getDoc, getDocs, query, runTransaction, setDoc, Timestamp, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
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
        if (!comment.isAnonymous) {
          comment.author = await getDoc(comment.author).then((doc) => doc.data())
        }
      }
      this._isLoading = false

      this._comments = comments
    },

    async addComment(comment, entry) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      comment.author = userStore.getUserRef || userStore.getUserIpHash
      comment.created = Timestamp.fromDate(new Date())
      comment.isAnonymous = !userStore.isAuthenticated

      const stateAuthor = Object.keys(userStore.getUser).length ? userStore.getUser : userStore.getUserIpHash
      const docId = Date.now() + '-' + (comment.author.id || comment.author)

      this._isLoading = true
      await setDoc(doc(db, 'entries', entry.id, 'comments', docId), comment)
        .then(() => this.$patch({ _comments: [...this._comments, { ...comment, author: stateAuthor }] }))
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
      if (guy.uid === comment.author.uid) {
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
      }
    },

    async deleteComment(entryId, id, userId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const comment = this.getComments.find((comment) => comment.id === id)
      console.log('comment', comment)

      const index = this._comments.findIndex((comment) => comment.id === id)
      console.log('index', index)

      console.log(userId)
      console.log([userId].includes(comment.author?.uid || comment.author))
      console.log([comment.author?.uid, comment.author].includes(userId))
      console.log(comment.author)

      this._isLoading = true
      if (index !== -1 && userId === (comment.author?.uid || comment.author)) {
        await deleteDoc(doc(db, 'entries', entryId, 'comments', id))
          .then(() => {
            this._comments.splice(index, 1)
          })
          .catch((error) => {
            console.error(error)
            throw new Error(error)
          })
          .finally(() => (this._isLoading = false))
      } else {
        console.log('User is not authorize!')
        $q.notify({ message: 'Comment submission failed!' })
      }
    }
  }
})
