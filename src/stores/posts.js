import { addDoc, collection, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'
import { useUserStore } from './user'

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
        .then(async (querySnapshot) => {
          const posts = querySnapshot.docs.map((docPost) => ({
            id: docPost.id,
            ...docPost.data()
          }))

          posts.forEach(async (post) => {
            const docSnap = await getDoc(post.author)
            post.author = docSnap.data().displayName
          })

          this._posts = []
          this.$patch({ _posts: posts })
          return posts
        })
        .catch((error) => {
          console.error(error)
          throw error.code
        })
      if (this.getPosts) {
        LocalStorage.set('posts', this._posts)
      }
    },

    async addPost(post) {
      const userStore = useUserStore()

      post.author = doc(db, 'users', userStore.getUser.uid)
      post.created = Timestamp.fromDate(new Date())

      await addDoc(collection(db, 'posts'), post)
        .then(() => {
          this.$patch({ _posts: [...this.getPosts, post] })
          LocalStorage.set('posts', this._posts)
        })
        .catch((error) => {
          console.error(error)
          throw error.code
        })
    }
  }
})
