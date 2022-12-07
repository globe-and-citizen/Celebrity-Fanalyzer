import { collection, deleteDoc, doc, getDoc, getDocs, runTransaction, setDoc, Timestamp } from 'firebase/firestore'
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
        })
        .catch((error) => {
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addEntry(entry) {
      const userStore = useUserStore()
      const promptStore = usePromptStore()

      entry.author = userStore.getUserRef
      entry.created = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)

      this._isLoading = true
      await setDoc(doc(db, 'entries', new Date().toJSON()), entry)
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
    }
  }
})
