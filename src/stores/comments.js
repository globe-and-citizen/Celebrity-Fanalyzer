import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: [],
    _isLoading: false
  }),

  persist: true,

  getters: {
    getComments: (state) => state._comments,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchComments(collectionName, documentId) {
      this._isLoading = true
      await getDocs(collection(db, collectionName, documentId, 'comments'))
        .then(async (querySnapshot) => {
          const comments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const comment of comments) {
            if (!comment.isAnonymous) {
              comment.author = await getDoc(comment.author).then((doc) => doc.data())
            }
            comment.likes = comment.likes?.map((like) => like.id || like)
            comment.dislikes = comment.dislikes?.map((dislike) => dislike.id || dislike)
          }
          this.$patch({ _comments: comments })
        })
        .finally(() => (this._isLoading = false))
    },

    async addComment(comment, document) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      comment.author = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      comment.created = Timestamp.fromDate(new Date())
      comment.isAnonymous = !userStore.isAuthenticated

      const stateAuthor = Object.keys(userStore.getUser).length ? userStore.getUser : userStore.getUserIpHash
      const docId = comment.id || Date.now() + '-' + (comment.author.id || comment.author)

      comment.id = docId
      localStorage.setItem('id', docId)

      this._isLoading = true
      await setDoc(doc(db, 'entries', document.id, 'comments', docId), comment)
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

    async likeComment(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const commentRef = doc(db, collectionName, documentId, 'comments', commentId)
      const user = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      const comment = this._comments.find((comment) => comment.id === commentId)

      await updateDoc(commentRef, { likes: arrayUnion(user) }).then(() => {
        if (!comment.likes?.includes(user.id)) {
          comment.likes ??= []
          comment.likes.push(user.id)
        } else {
          comment.likes = comment.likes.filter((like) => like !== user.id)
        }
      })

      await updateDoc(commentRef, { dislikes: arrayRemove(user) }).then(() => {
        if (comment.dislikes?.includes(user.id)) {
          comment.dislikes = comment.dislikes.filter((dislike) => dislike !== user.id)
        }
      })
    },

    async dislikeComment(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const commentRef = doc(db, collectionName, documentId, 'comments', commentId)
      const user = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      const comment = this._comments.find((comment) => comment.id === commentId)

      await updateDoc(commentRef, { dislikes: arrayUnion(user) }).then(() => {
        if (!comment.dislikes?.includes(user.id)) {
          comment.dislikes ??= []
          comment.dislikes.push(user.id)
        } else {
          comment.dislikes = comment.dislikes.filter((dislike) => dislike !== user.id)
        }
      })

      await updateDoc(commentRef, { likes: arrayRemove(user) }).then(() => {
        if (comment.likes?.includes(user.id)) {
          comment.likes = comment.likes.filter((like) => like !== user.id)
        }
      })
    },

    async deleteComment(entryId, id) {
      const index = this._comments.findIndex((comment) => comment.id === id)

      this._isLoading = true
      await deleteDoc(doc(db, 'entries', entryId, 'comments', id))
        .then(() => this._comments.splice(index, 1))
        .finally(() => (this._isLoading = false))
    },

    async deleteCommentsCollection(collectionName, documentId) {
      const commentsCollection = collection(db, collectionName, documentId, 'comments')

      const commentsSnapshot = await getDocs(commentsCollection)

      commentsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
    },

    async addReply(entryId, commentId, reply) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      reply.author = userStore.getUserRef || userStore.getUserIpHash
      reply.created = Timestamp.fromDate(new Date())
      reply.isAnonymous = !userStore.isAuthenticated

      const stateAuthor = Object.keys(userStore.getUser).length ? userStore.getUser : userStore.getUserIpHash
      const docId = Date.now() + '-' + (reply.author.id || reply.author)

      reply.id = docId
      reply.id = reply.id || docId

      this._isLoading = true
      await setDoc(doc(db, 'entries', entryId, 'comments', docId), reply)
        .then(() => this.$patch({ _comments: [...this._comments, { ...reply, author: stateAuthor }] }))
        .finally(() => (this._isLoading = false))
    }
  }
})
