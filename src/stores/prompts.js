import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _prompts: [],
    _monthPrompt: null,
    _isLoading: false
  }),

  getters: {
    getMonthPrompt: (state) => LocalStorage.getItem('monthPrompt') || state._monthPrompt,
    getPrompts: (state) => LocalStorage.getItem('prompts') || state._prompts,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchMonthPrompt() {
      const q = query(collection(db, 'prompts'), orderBy('created', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)

      this._monthPrompt = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      await getDocs(collection(db, 'prompts', this._monthPrompt.id, 'entries'))
        .then(async (querySnapshot) => {
          const entries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const entry of entries) {
            entry.author = await getDoc(entry.author).then((doc) => doc.data())
          }

          this._monthPrompt.entries = entries
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))

      LocalStorage.set('monthPrompt', this._monthPrompt)
    },

    async fetchPrompt(id) {
      this._isLoading = true
      await getDoc(doc(db, 'prompts', id))
        .then(async (doc) => {
          const prompt = { id: doc.id, ...doc.data() }
          prompt.author = await getDoc(prompt.author).then((doc) => doc.data())

          this._prompts = this.getPrompts
          const index = this._prompts.findIndex((p) => p.id === prompt.id)

          if (index === -1) this._prompts.push(prompt)
          else this._prompts[index] = prompt

          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchPrompts() {
      this._isLoading = true
      await getDocs(collection(db, 'prompts'))
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
          }

          this._prompts = []
          this.$patch({ _prompts: prompts })

          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = userStore.getUserRef
      prompt.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await addDoc(collection(db, 'prompts'), prompt)
        .then(() => {
          this.$patch({ _prompts: [...this.getPrompts, prompt] })
          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          console.error('Error:', error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editPrompt(prompt) {
      this._isLoading = true
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
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'prompts', id))
        .then(() => {
          const index = this._prompts.findIndex((prompt) => prompt.id === id)
          this._prompts.splice(index, 1)
          LocalStorage.set('prompts', this._prompts)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file) {
      const storageRef = ref(storage, `images/prompt-${file.name + Date.now()}`)

      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(ref(storage, storageRef))
    },

    async addLike(id) {
      this._prompts = []
      this.$patch({ _prompts: this.getPrompts })

      this._isLoading = true
      await updateDoc(doc(db, 'prompts', id), {
        'info.likes': arrayUnion(useUserStore().getUserRef),
        'info.dislikes': arrayRemove(useUserStore().getUserRef)
      })
        .then(() => this.fetchPrompt(id))
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addDislike(id) {
      this._isLoading = true
      await updateDoc(doc(db, 'prompts', id), {
        'info.dislikes': arrayUnion(useUserStore().getUserRef),
        'info.likes': arrayRemove(useUserStore().getUserRef)
      })
        .then(() => this.fetchPrompt(id))
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    }
  }
})
