import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  getCountFromServer,
  onSnapshot,
  query,
  where,
  or,
  and,
  orderBy
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import layer8 from 'layer8_interceptor'
import { baseURL } from 'stores/stats'

const pushCommentToStats = async (user_id, id, content) =>
  await layer8
    .fetch(`${baseURL}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id, id, content })
    })
    .then((res) => res.json())
    .catch((err) => console.log(err))

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: undefined,
    _commentsCount: 0,
    _unSubscribe: undefined,
    _isLoading: false,
    _replyTo: ''
  }),

  persist: true,

  getters: {
    getComments: (state) => state._comments,
    getCommentsCount: (state) => state._commentsCount,
    /**
     * @returns undefined|Object
     */
    getCommentById: (state) => (commentId) => state._comments?.find((comment) => comment.id === commentId),
    isLoading: (state) => state._isLoading,
    isLoaded: (state) => !!state._comments,
    /**
     * Return A comment children
     * @param state
     * @returns {function(*): T[]|*[]}
     */
    getCommentChildren: (state) => (commentId) => state._comments?.filter((comment) => comment.parentId === commentId) || [],
    getReplyTo: (state) => state._replyTo,
    haveToReply: (state) => state._replyTo !== ''
  },

  actions: {
    async fetchComments(collectionName, documentId) {
      const userStore = useUserStore()
      if (!userStore.getUsers) {
        await userStore.fetchUsers()
      }
      if (this._unSubscribe) {
        this._unSubscribe()
      }
      const q = query(
        collection(db, collectionName, documentId, 'comments'),
        or(where('text', '!=', 'Comment Deleted'), where('isAnonymous', '==', false))
      )
      this._unSubscribe = onSnapshot(q, async (querySnapshot) => {
        const comments = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((data) => {
            if (data.isDeleted) return false
            return true
          })

        for (const comment of comments) {
          if (!comment.isAnonymous) {
            comment.author = userStore.getUserById(comment.author?.id) || comment.author?.id
          }
          comment.likes = comment.likes ? comment.likes.map((like) => like.id || like) : []
          comment.dislikes = comment.dislikes ? comment.dislikes.map((dislike) => dislike.id || dislike) : []
        }

        const authors = await Promise.all(
          comments
            .filter((comment) => !comment.isAnonymous && typeof comment.author === 'string')
            .map((comment) => comment.author)
            .filter((author, index, self) => self.indexOf(author) === index)
            .map((author) => userStore.fetchUser(author))
        )

        for (const comment of comments) {
          if (!comment.isAnonymous && typeof comment.author === 'string') {
            comment.author = authors.find((author) => author.uid === comment.author)
          }
        }
        this.$patch({ _comments: comments })
      })
    },

    async getTotalComments(collectionName, documentId) {
      const userStore = useUserStore()
      if (!userStore.getUsers) {
        await userStore.fetchUsers()
      }
      if (this._unSubscribe) {
        this._unSubscribe()
      }

      try {
        const q1 = query(
          collection(db, collectionName, documentId, 'comments'),
          or(where('text', '!=', 'Comment Deleted'), where('isAnonymous', '==', false))
        )
        const q2 = query(
          collection(db, collectionName, documentId, 'comments'),
          or(where('text', '!=', 'Comment Deleted'), where('isAnonymous', '==', false)),
          orderBy('parentId')
        )

        const totalCountFunc = await getCountFromServer(q1)
        const totalChildCommentCountFunc = await getCountFromServer(q2)

        const totalComments = totalCountFunc.data().count
        const totalChildComments = totalChildCommentCountFunc.data().count

        this.$patch({ _commentsCount: totalComments - totalChildComments })
      } catch (e) {
        console.error('Failed fetching comments count', e)
      }
    },

    async addComment(collectionName, comment, document) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()
      const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash

      comment.author = userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIpHash
      comment.created = Timestamp.fromDate(new Date())
      comment.id = Date.now() + '-' + (comment.author.id || comment.author)
      comment.isAnonymous = !userStore.isAuthenticated

      await pushCommentToStats(user_id, document.id, comment.text)

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
      await this.fetchComments(collectionName, documentId)
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
      await this.fetchComments(collectionName, documentId)
    },

    async deleteComment(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        const relatedCommentsQuery = query(collection(db, collectionName, documentId, 'comments'), where('parentId', '==', commentId))
        const relatedCommentsSnapshot = await getDocs(relatedCommentsQuery)
        transaction.update(doc(db, collectionName, documentId, 'comments', commentId), {
          author: userStore.getUserIpHash,
          isAnonymous: true,
          text: 'Comment Deleted',
          isDeleted: true
        })
        relatedCommentsSnapshot.forEach((relatedCommentDocs) => {
          transaction.update(relatedCommentDocs.ref, {
            isAnonymous: true,
            text: 'Comment Deleted',
            isDeleted: true
          })
        })
      }).finally(async () => {
        this._isLoading = false
        await this.fetchComments(collectionName, documentId)
      })
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
      await this.fetchComments(collectionName, documentId)
    },

    async removeCommentFromFirestore(collectionName, documentId, commentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      this._isLoading = true
      await deleteDoc(doc(db, collectionName, documentId, 'comments', commentId)).finally(() => (this._isLoading = false))
    },

    async resetComments() {
      this._comments = undefined
    }
  }
})
