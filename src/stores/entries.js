import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, runTransaction, Timestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { usePromptStore, useUserStore } from 'src/stores'

export const useEntryStore = defineStore('entries', {
  state: () => ({
    _entries: [],
    _isLoading: false
  }),

  getters: {
    getEntries: (state) => state._entries,
    getEntriesFromPrompt: () => (id) => LocalStorage.getItem('prompts').find((p) => p.id === id),
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchEntries(id) {
      this._isLoading = true
      await getDocs(collection(db, 'prompts', id, 'entries'))
        .then(async (querySnapshot) => {
          const entries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const entry of entries) {
            entry.author = await getDoc(entry.author).then((doc) => doc.data())
          }

          this._entries = []
          this.$patch({ _entries: entries })

          await this.updateLocalEntries(id)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addEntry(entry) {
      const userStore = useUserStore()

      entry.author = userStore.getUserRef
      entry.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await addDoc(collection(db, 'prompts', entry.prompt.value, 'entries'), entry)
        .then(() => {
          this.$patch({ _entries: [...this.getEntries, entry] })
          LocalStorage.set('entries', this._entries)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editEntry(entry) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', entry.prompt.id, 'entries', entry.id), { ...entry })
      })
        .then(() => {
          const index = this.getEntries.findIndex((p) => p.id === entry.id)
          this.$patch({
            _entries: [...this._entries.slice(0, index), { ...this._entries[index], ...entry }, ...this._entries.slice(index + 1)]
          })
          LocalStorage.set('entries', this._entries)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async deleteEntry(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'prompts', entry.prompt.id, 'entries', id))
        .then(() => {
          const index = this._entries.findIndex((entry) => entry.id === id)
          this._entries.splice(index, 1)
          LocalStorage.set('entries', this._entries)
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file) {
      this._isLoading = true
      const storageRef = ref(storage, `images/entry-${file.name + Date.now()}`)

      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(ref(storage, storageRef))
    },

    async updateLocalEntries(promptId) {
      const promptStore = usePromptStore()

      await promptStore.fetchPrompt(promptId)
      const prompts = promptStore.getPrompts

      const index = prompts?.findIndex((p) => p.id === promptId)
      prompts[index].entries = this.getEntries
      LocalStorage.set('prompts', prompts)
    }
  }
})
