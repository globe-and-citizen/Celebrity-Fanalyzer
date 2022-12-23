import { collection, deleteDoc, doc, getDoc, getDocs, query, runTransaction, setDoc, Timestamp, where } from 'firebase/firestore'
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
    async fetchEntryBySlug(slug) {
      const q = query(collection(db, 'entries'), where('slug', '==', slug))
      this._isLoading = true
      const querySnapshot = await getDocs(q)

      const entry = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      entry.author = await getDoc(entry.author).then((doc) => doc.data())
      entry.prompt = await getDoc(entry.prompt).then((doc) => doc.data())

      this._isLoading = false

      return entry
    },

    async fetchEntries(promptId) {
      const promptStore = usePromptStore()
      const promptRef = promptStore.getPromptRef(promptId)

      const q = query(collection(db, 'entries'), where('prompt', '==', promptRef))

      this._isLoading = true
      const querySnapshot = await getDocs(q)
      try {
        const entries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const entry of entries) {
          entry.author = await getDoc(entry.author).then((doc) => doc.data())
          entry.prompt = await getDoc(entry.prompt).then((doc) => doc.data())
        }

        this._entries = []
        this.$patch({ _entries: entries })
      } catch (error) {
        console.error(error)
        throw new Error(error)
      }

      this._isLoading = false
    },

    async addEntry(entry) {
      const userStore = useUserStore()
      const promptStore = usePromptStore()

      const promptId = entry.prompt.value
      const entryId = `${promptId}T${Date.now()}` // 2022-11T1670535123715
      const entryRef = doc(db, 'entries', entryId)

      entry.author = userStore.getUserRef
      entry.created = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)

      this._isLoading = true
      await setDoc(entryRef, entry)
        .then(() => {
          this.$patch({ _entries: [...this.getEntries, entry] })
          promptStore.updateEntryField(promptId, entryRef)
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editEntry(entry) {
      const promptStore = usePromptStore()

      entry.updated = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'entries', entry.id), { ...entry })
      })
        .then(() => {
          const index = this.getEntries.findIndex((p) => p.fid === entry.id)
          this.$patch({
            _entries: [...this._entries.slice(0, index), { ...this._entries[index], ...entry }, ...this._entries.slice(index + 1)]
          })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async deleteEntry(id) {
      this._isLoading = true
      await deleteDoc(doc(db, 'entries', id))
        .then(() => {
          const index = this._entries.findIndex((entry) => entry.id === id)
          this._entries.splice(index, 1)
        })
        .catch((error) => {
          console.error(error)
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
