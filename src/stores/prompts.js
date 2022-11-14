import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, runTransaction, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _prompts: LocalStorage.getItem('prompts') || []
  }),

  getters: {
    getPrompts: (state) => state._prompts
  },

  actions: {
    async fetchPrompts() {
      await getDocs(collection(db, 'prompts'))
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
          }

          this._prompts = []
          this.$patch({ _prompts: prompts })
        })
        .catch((error) => {
          throw new Error(error)
        })

      if (this.getPrompts) {
        LocalStorage.set('prompts', this._prompts)
      }
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = doc(db, 'users', userStore.getUser.uid)
      prompt.created = Timestamp.fromDate(new Date())

      await addDoc(collection(db, 'prompts'), prompt)
        .then(() => {
          this.$patch({ _prompts: [...this.getPrompts, prompt] })
          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          console.error('Error:', error)
          throw new Error(error)
        })
    },

    async editPrompt(prompt) {
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), { ...prompt })
      })
        .then(() => {
          const index = this.getPrompts.findIndex((p) => p.id === prompt.id)
          this.$patch({
            _prompts: [...this._prompts.slice(0, index), { ...this._prompts[index], ...prompt }, ...this._prompts.slice(index + 1)]
          })
          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          throw new Error(error)
        })
    },

    async deletePrompt(id) {
      await deleteDoc(doc(db, 'prompts', id))
        .then(() => {
          const index = this._prompts.findIndex((prompt) => prompt.id === id)
          this._prompts.splice(index, 1)
          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          throw new Error(error)
        })
    }
  }
})
