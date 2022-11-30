import { collection, getDoc, getDocs } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'

export const useCommentStore = defineStore('comments', {
  state: () => ({
    _comments: [],
    _isLoading: false
  }),

  getters: {
    getComments: (state) => LocalStorage.getItem('comments') || state._comments,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchComments(promptId) {
      this._isLoading = true
      await getDocs(collection(db, 'prompts', promptId, 'comments'))
        .then(async (querySnapshot) => {
          const comments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const comment of comments) {
            comment.author = await getDoc(comment.author).then((doc) => doc.data())
          }

          this._comments = []
          this.$patch({ _comments: comments })
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addComment(comment) {
      console.log(comment)
    },

    async editComment(prompt) {
      console.log(prompt)
    },

    async deleteComment(id) {
      console.log(id)
    }
  }
})
