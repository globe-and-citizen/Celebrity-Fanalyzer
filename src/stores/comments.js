import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: [],
    _childcomments: [],
    _isLoading: false
  }),

  persist: true,

  getters: {
    getComments: (state) => state._comments,
    getChildComments: (state) => state._childcomments,
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

    async fetchCommentsByparentId(slug, parentId) {
      this._isLoading = true
      const querySnapshot = await getDocs(query(collection(db, 'entries'), where('slug', '==', slug)))
      const entry = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      const c = query(collection(db, 'entries', entry.id, 'comments'), where('parentId', '==', parentId))
      const snap = await getDocs(c)
      const comments = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      for (const comment of comments) {
        if (!comment.isAnonymous) {
          comment.author = await getDoc(comment.author).then((doc) => doc.data())
        }
      }
      this._isLoading = false

      this._childcomments = comments
    },

    async addComment(comment, entry) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      comment.author = userStore.getUserRef || userStore.getUserIpHash
      comment.created = Timestamp.fromDate(new Date())
      comment.isAnonymous = !userStore.isAuthenticated

      const stateAuthor = Object.keys(userStore.getUser).length ? userStore.getUser : userStore.getUserIpHash
      const docId = Date.now() + '-' + (comment.author.id || comment.author)

      comment.id = docId

      this._isLoading = true
      await setDoc(doc(db, 'entries', entry.id, 'comments', docId), commentAAA)
        .then(() => this.$patch({ _comments: [...this._comments, { ...comment, author: stateAuthor }] }))
        .finally(() => (this._isLoading = false))
    },

    async editComment(entryId, id, editedComment, userId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const comment = this.getComments.find((comment) => comment.id === id)
      const index = this._comments.findIndex((comment) => comment.id === id)

      comment.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      if (index !== -1 && userId === (comment.author?.uid || comment.author)) {
        await runTransaction(db, async (transaction) => {
          transaction.update(doc(db, 'entries', entryId, 'comments', comment.id), { text: editedComment })
        })
          .then(() => {
            this.$patch({
              _comments: [...this._comments.slice(0, index), { ...this._comments[index], ...comment }, ...this._comments.slice(index + 1)]
            })
          })
          .finally(() => (this._isLoading = false))
      } else {
        throw new Error(error)
      }
    },

    async likeComment(entryId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const commentRef = doc(db, 'entries', entryId, 'comments', commentId)
      const user = userStore.getUserRef || userStore.getUserIpHash

      await updateDoc(commentRef, { likes: arrayUnion(user) })
      await updateDoc(commentRef, { dislikes: arrayRemove(user) })

      const comments = this._comments.map((comment) => {
        if (comment.id === commentId && !comment.likes.includes(user)) {
          comment.likes.push(user)
          comment.dislikes = comment.dislikes.filter((user) => user !== user)
        }
        return comment
      })

      this.$patch({ _comments: comments })
    },

    async dislikeComment(entryId, id) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const commentRef = doc(db, 'entries', entryId, 'comments', id)
      const user = userStore.getUserRef || userStore.getUserIpHash

      await updateDoc(commentRef, { dislikes: arrayUnion(user) })
      await updateDoc(commentRef, { likes: arrayRemove(user) })

      const comments = this._comments.map((comment) => {
        if (comment.id === id && !comment.dislikes.includes(user)) {
          comment.dislikes.push(user)
          comment.likes = comment.likes.filter((user) => user !== user)
        }
        return comment
      })

      this.$patch({ _comments: comments })
    },

    async deleteComment(entryId, id, userId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const comment = this.getComments.find((comment) => comment.id === id)
      const index = this._comments.findIndex((comment) => comment.id === id)

      this._isLoading = true
      // TODO: check if is possible to remove if statement
      if (index !== -1 && userId === (comment.author?.uid || comment.author)) {
        await deleteDoc(doc(db, 'entries', entryId, 'comments', id))
          .then(() => this._comments.splice(index, 1))
          .finally(() => (this._isLoading = false))
      }
    },

    async addReply(entryId, commentId, reply) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      reply.author = userStore.getUserRef || userStore.getUserIpHash
      reply.created = Timestamp.fromDate(new Date())
      reply.isAnonymous = !userStore.isAuthenticated

      const stateAuthor = Object.keys(userStore.getUser).length ? userStore.getUser : userStore.getUserIpHash
      const docId = Date.now() + '-' + (reply.author.id || reply.author)

      this._isLoading = true
      await setDoc(doc(db, 'entries', entryId, 'comments', docId), reply)
        .then(() => this.$patch({ _childcomments: [...this._childcomments, { ...reply, author: stateAuthor }] }))
        .finally(() => (this._isLoading = false))
    }
  }
})
