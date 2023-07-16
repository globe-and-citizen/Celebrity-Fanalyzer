import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
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
    _comments: undefined,
    _unSubscribe: undefined,
    _isLoading: false,
    _replyTo: ''
  }),

  persist: true,

  getters: {
    getComments: (state) => state._comments,
    getCommentById: (state) => {
      /**
       * @returns undefined|Object
       */
      return (commentId) => {
        return  state._comments?.find((comment) => comment.id === commentId)
      }
    },
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._comments,
    /**
     * Return A comment children
     * @param state
     * @returns {function(*): T[]|*[]}
     */
    getCommentChildren: (state) => {
      return (commentId) => {
        return state._comments ? state._comments.filter((comment) => comment.parentId === commentId) : []
      }
    },
    getReplyTo: (state) => state._replyTo,
    haveToReply: (state) => state._replyTo !== ''
  },

  actions: {
    async fetchComments(collectionName, documentId) {
      const userStore = useUserStore()
      if(!userStore.getUsers){
        await userStore.fetchUsers()
      }
      if (this._unSubscribe) {
        this._unSubscribe()
      }
      this._unSubscribe = onSnapshot(collection(db, collectionName, documentId, 'comments'), (querySnapshot) => {
        const comments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const comment of comments) {
          if (!comment.isAnonymous) {
            comment.author = userStore.getUserById(comment.author.id)
          }
          comment.likes = comment.likes? comment.likes.map((like) => like.id || like) :  []
          comment.dislikes = comment.dislikes? comment.dislikes.map((dislike) => dislike.id || dislike) :  []
        }
        this.$patch({ _comments: comments })
      })
    },

    async addComment(collectionName, comment, document) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      comment.author = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      comment.created = Timestamp.fromDate(new Date())
      comment.id = Date.now() + '-' + (comment.author.id || comment.author)
      comment.isAnonymous = !userStore.isAuthenticated

      this._isLoading = true
      await setDoc(doc(db, collectionName, document.id, 'comments', comment.id), comment).finally(() => (this._isLoading = false))
    },

    async editComment(collectionName, documentId, id, editedComment, userId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const comment = this.getComments?.find((comment) => comment.id === id)
      const index = this._comments.findIndex((comment) => comment.id === id)

      if (comment) {
        comment.updated = Timestamp.fromDate(new Date())
        this._isLoading = true
        if (index !== -1 && userId === (comment.author?.uid || comment.author)) {
          await runTransaction(db, async (transaction) => {
            transaction.update(doc(db, collectionName, documentId, 'comments', comment.id), { text: editedComment })
          }).finally(() => (this._isLoading = false))
        } else {
          throw new Error("Can't Find the comment with ID " + id)
        }
      }
    },

    setReplyTo(commentId) {
      if (this._replyTo !== commentId) {
        this._replyTo = commentId
      } else {
        this._replyTo = ''
      }
    },

    async likeComment(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const comment = this._comments.find((comment) => comment.id === commentId)
      const commentRef = doc(db, collectionName, documentId, 'comments', commentId)
      const user = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      const userId = user?.id || user

      if (!comment) {
        throw new Error("Can't Find the comment with ID: " + commentId)
      }
      if (!comment.likes?.includes(userId)) {
        await updateDoc(commentRef, { likes: arrayUnion(user) })
      } else {
        await updateDoc(commentRef, { likes: arrayRemove(user) })
      }

      if (comment.dislikes?.includes(userId)) {
        await updateDoc(commentRef, { dislikes: arrayRemove(user) })
      }
    },

    async dislikeComment(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const comment = this._comments.find((comment) => comment.id === commentId)
      const commentRef = doc(db, collectionName, documentId, 'comments', commentId)
      const user = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      const userId = user?.id || user

      if (!comment) {
        throw new Error("Can't Find the comment with ID: " + commentId)
      }
      if (!comment.dislikes?.includes(userId)) {
        await updateDoc(commentRef, { dislikes: arrayUnion(user) })
      } else {
        await updateDoc(commentRef, { dislikes: arrayRemove(user) })
      }

      if (comment.likes?.includes(userId)) {
        await updateDoc(commentRef, { likes: arrayRemove(user) })
      }
    },

    async deleteComment(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, collectionName, documentId, 'comments', commentId), {
          author: userStore.getUserIpHash,
          isAnonymous: true,
          text: 'Comment Deleted'
        })
      }).finally(() => (this._isLoading = false))
    },

    async deleteCommentsCollection(collectionName, documentId) {
      const commentsCollection = collection(db, collectionName, documentId, 'comments')

      const commentsSnapshot = await getDocs(commentsCollection)

      commentsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
    },

    async addReply(collectionName, documentId, reply) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      reply.author = userStore.getUserRef || userStore.getUserIpHash
      reply.created = Timestamp.fromDate(new Date())
      reply.id ??= Date.now() + '-' + (reply.author.id || reply.author)
      reply.isAnonymous = !userStore.isAuthenticated

      this._isLoading = true
      await setDoc(doc(db, collectionName, documentId, 'comments', reply.id), reply).finally(() => (this._isLoading = false))
    },

    async removeCommentFromFirestore(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      this._isLoading = true
      await deleteDoc(doc(db, collectionName, documentId, 'comments', commentId)).finally(() => (this._isLoading = false))
    }
  }
})
