import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, runTransaction, Timestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { useUserStore } from './user'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _monthPrompt: null,
    _prompts: []
  }),

  getters: {
    getMonthPrompt: (state) => LocalStorage.getItem('monthPrompt') || state._monthPrompt,
    getPrompts: (state) => LocalStorage.getItem('prompts') || state._prompts
  },

  actions: {
    async fetchMonthPrompt() {
      const q = query(collection(db, 'prompts'), orderBy('created', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)

      this._monthPrompt = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
      LocalStorage.set('monthPrompt', this._monthPrompt)
    },

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

    async uploadImage(file) {
      const storageRef = ref(storage, `images/prompt-${file.name + Date.now()}`)

      await uploadBytes(storageRef, file)

      return getDownloadURL(ref(storage, storageRef))
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = userStore.getUserRef
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
