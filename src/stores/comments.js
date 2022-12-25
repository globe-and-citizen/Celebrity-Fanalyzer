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

      const userStore = useUserStore()
      const promptStore = usePromptStore()

      const promptId = entry.prompt.value
      const entryId = `${promptId}T${Date.now()}`
      const entryRef = doc(db, 'entries', entryId)

      entry.author = userStore.getUserRef

      this._isLoading = true
      await setDoc(entryRef, entry)
        .then(() => {
          this.$patch({ _entries: [...this.getEntries, entry] })
          LocalStorage.set('entries', this._entries)
          promptStore.updateEntryField(promptId, entryRef)
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editComment(prompt) {
      console.log(prompt)
    },

    async deleteComment(id) {
      console.log(id)
    }
  }
})
