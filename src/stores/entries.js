import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, runTransaction, Timestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { usePromptStore, useUserStore } from 'src/stores'

export const useEntryStore = defineStore('entries', {
  state: () => ({
    _entries: []
  }),

  getters: {
    getEntries: (state) => state._entries,
    getEntriesFromPrompt: () => (id) => LocalStorage.getItem('prompts').find((p) => p.id === id)
  },

  actions: {
    async fetchEntries(id) {
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
    },

    async addEntry(entry) {
      const userStore = useUserStore()

      entry.author = userStore.getUserRef
      entry.created = Timestamp.fromDate(new Date())

      await addDoc(collection(db, 'prompts', entry.prompt.value, 'entries'), entry)
        .then(() => {
          this.$patch({ _entries: [...this.getEntries, entry] })
          LocalStorage.set('entries', this._entries)
        })
        .catch((error) => {
          console.error('Error:', error)
          throw new Error(error)
        })
    },

    async editEntry(entry) {
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
    },

    async deleteEntry(id) {
      await deleteDoc(doc(db, 'prompts', entry.prompt.id, 'entries', id))
        .then(() => {
          const index = this._entries.findIndex((entry) => entry.id === id)
          this._entries.splice(index, 1)
          LocalStorage.set('entries', this._entries)
        })
        .catch((error) => {
          throw new Error(error)
        })
    },

    async uploadImage(file) {
      const storageRef = ref(storage, `images/entry-${file.name + Date.now()}`)

      await uploadBytes(storageRef, file)

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
