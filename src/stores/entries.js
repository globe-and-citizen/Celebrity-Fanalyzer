import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import { usePromptStore, useUserStore } from 'src/stores'

export const useEntryStore = defineStore('entries', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    getEntriesFromPrompt: () => (promptId) => {
      const promptStore = usePromptStore()
      const prompt = promptStore.getPrompts.find((prompt) => prompt.id === promptId)

      return prompt.entries
    },
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
      const entryRef = doc(db, 'entries', entry.date)

      entry.author = userStore.getUserRef
      entry.created = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)

      this._isLoading = true
      await setDoc(entryRef, entry)
        .then(() => {
          // TODO: Once a entry is added, update the prompt's entry array
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
        .then(() => {})
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async deleteEntry(entryId) {
      const promptStore = usePromptStore()

      const promptId = entryId.split('T')[0]
      const entries = promptStore.getPrompts.find((prompt) => prompt.id === promptId).entries
      const entryRef = doc(db, 'entries', entryId)
      const entryImage = entries.find((entry) => entry.id === entryId).image
      const imageRef = ref(storage, `images/${entryImage.split('?alt')[0].split('images%2F')[1]}`)

      this._isLoading = true
      const deleteImage = await deleteObject(imageRef)
      const deleteEntryDoc = await deleteDoc(doc(db, 'entries', entryId))
      const deleteEntryRef = await updateDoc(doc(db, 'prompts', promptId), { entries: arrayRemove(entryRef) })

      Promise.all([deleteImage, deleteEntryDoc, deleteEntryRef])
        .then(() => {
          const prompt = promptStore._prompts.find((prompt) => prompt.id === promptId)
          prompt.entries = prompt.entries.filter((entry) => entry.id !== entryId)
          promptStore.$patch({ _prompts: [...promptStore._prompts] })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file, entryId) {
      const storageRef = ref(storage, `images/entry-${entryId}`)

      this._isLoading = true
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(ref(storage, storageRef))
    }
  }
})
