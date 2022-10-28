import { collection, getDocs } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'

export const usePostStore = defineStore('posts', {
  state: () => ({
    _posts: []
  }),

  getters: {
    getPosts: (state) => state._posts
  },

  actions: {
    async fetchPosts() {
      await getDocs(collection(db, 'posts'))
        .then((querySnapshot) => {
          const posts = querySnapshot.docs.map((docPost) => ({
            id: docPost.id,
            ...docPost.data()
          }))
          this._posts = []
          this.$patch({ _posts: posts })
          return posts
        })
        .catch(() => {
          console.error(error)
          throw error.code
        })
      if (this.getPosts) {
        LocalStorage.set('posts', this._posts)
      }
    }
    // TODO: Create a function to fetch the authors of the posts
  }
})
