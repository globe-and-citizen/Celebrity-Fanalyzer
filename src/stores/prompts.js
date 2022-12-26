import {
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
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { useUserStore } from 'src/stores'
import sha1 from 'sha1'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _isLoading: false,
    _monthPrompt: null,
    _prompts: []
  }),

  getters: {
    getMonthPrompt: (state) => LocalStorage.getItem('monthPrompt') || state._monthPrompt,
    getPromptRef: () => (id) => doc(db, 'prompts', id),
    getPrompts: (state) => state._prompts,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchMonthPrompt() {
      const q = query(collection(db, 'prompts'), orderBy('created', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)

      const monthPrompt = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      this._isLoading = true
      for (const index in monthPrompt.entries) {
        monthPrompt.entries[index] = await getDoc(monthPrompt.entries[index]).then((doc) => doc.data())
        monthPrompt.entries[index].author = await getDoc(monthPrompt.entries[index].author).then((doc) => doc.data())
      }

      this._isLoading = false

      this.$patch({ _monthPrompt: monthPrompt })
      LocalStorage.set('monthPrompt', monthPrompt)
      return monthPrompt
    },

    async fetchPromptById(id) {
      this._isLoading = true
      return await getDoc(doc(db, 'prompts', id))
        .then(async (doc) => {
          if (doc.data === undefined) {
            throw new Error('Document not found.')
          }
          const prompt = { id: doc.id, ...doc.data() }
          prompt.author = await getDoc(prompt.author).then((doc) => doc.data())

          if (prompt.entries?.length) {
            for (const index in prompt.entries) {
              prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
              prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
            }
          }

          return prompt
        })
        .catch((err) => {
          throw new Error(err)
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchPromptBySlug(slug) {
      const q = query(collection(db, 'prompts'), where('slug', '==', slug))
      this._isLoading = true
      const querySnapshot = await getDocs(q)

      const prompt = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      prompt.author = await getDoc(prompt.author).then((doc) => doc.data())

      if (prompt.entries?.length) {
        for (const index in prompt.entries) {
          prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
          prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
        }
      }
      this._isLoading = false

      return prompt
    },

    async fetchPromptsByYear(year) {
      const q = query(collection(db, 'prompts'), where('date', '>=', `${year}-01-01`), where('date', '<=', `${year}-12-31`))

      this._isLoading = true
      return await getDocs(q)
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
          }

          prompts.reverse()

          return prompts
        })
        .catch((error) => {
          console.error(error)
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

          prompts.reverse()

          this._prompts = []
          this.$patch({ _prompts: prompts })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchPromptsAndEntries() {
      this._isLoading = true
      await getDocs(collection(db, 'prompts'))
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())

            if (prompt.entries) {
              for (const index in prompt.entries) {
                prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
                prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
              }
            }
          }

          prompts.reverse()

          this._prompts = []
          this.$patch({ _prompts: prompts })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = userStore.getUserRef
      prompt.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.date), prompt)
        .then(() => {
          this.$patch({ _prompts: [...this.getPrompts, prompt] })
        })
        .catch((error) => {
          console.error(error)
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
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      this._isLoading = true
      const localPrompt = this._prompts.find((prompt) => prompt.id === id)
      const imageRef = ref(storage, `images/${localPrompt.image.slice(86, 133)}`)
      const deleteImage = await deleteObject(imageRef)
      const deletePrompt = await deleteDoc(doc(db, 'prompts', id))
      Promise.all([deleteImage, deletePrompt])
        .then(() => {
          console.log('Prompt and his image deleted successfully')
          const index = this._prompts.findIndex((prompt) => prompt.id === id)
          this._prompts.splice(index, 1)
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async updateEntryField(promptId, entryRef) {
      this._isLoading = true
      await updateDoc(doc(db, 'prompts', promptId), {
        entries: arrayUnion(entryRef)
      })
        .then(() => this.fetchPromptById(promptId))
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file) {
      const storageRef = ref(storage, `images/prompt-${sha1(file.name + Date.now())}`)
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
        .then(() => this.fetchPromptById(id))
        .catch((error) => {
          console.error(error)
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
        .then(() => this.fetchPromptById(id))
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    }
  }
})
