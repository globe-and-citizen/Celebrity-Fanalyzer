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
    async fetchComments(entryId) {
      console.log(entryId)
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
