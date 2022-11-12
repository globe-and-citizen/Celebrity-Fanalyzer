import { collection, getDoc, getDocs } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: LocalStorage.getItem('comments') || []
  }),

  getters: {
    getComments: (state) => state._comments
  },

  actions: {
    async fetchComments(postId) {
      await getDocs(collection(db, 'posts', postId, 'comments')).then(async (querySnapshot) => {
        const comments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const comment of comments) {
          comment.author = await getDoc(comment.author).then((doc) => doc.data())
        }

        this._comments = []
        this.$patch({ _comments: comments })
      })
    },

    async addComment(comment) {
      console.log(comment)
    },

    async editComment(post) {
      console.log(post)
    },

    async deleteComment(id) {
      console.log(id)
    }
  }
})
