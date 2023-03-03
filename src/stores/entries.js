import {
  arrayRemove,
  arrayUnion,
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
import { useCommentStore, useLikeStore, usePromptStore, useShareStore, useUserStore } from 'src/stores'

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
    async fetchEntriesCollection() {
      this._isLoading = true
      await getDocs(collection(db, 'entries'))
        .then(async (querySnapshot) => {
          const entries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          entries.reverse()

          this._entries = []
          this.$patch({ _entries: entries })
        })
        .finally(() => (this._isLoading = false))
    },
    async fetchEntryBySlug(slug) {
      this._isLoading = true
      const querySnapshot = await getDocs(query(collection(db, 'entries'), where('slug', '==', slug)))

      const entry = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      entry.author = await getDoc(entry.author).then((doc) => doc.data())
      entry.prompt = await getDoc(entry.prompt).then((doc) => doc.data())

      this._isLoading = false

      return entry
    },

    async addEntry(entry) {
      const promptStore = usePromptStore()
      const userStore = useUserStore()

      const promptId = entry.prompt.value
      const entryRef = doc(db, 'entries', entry.id)

      entry.author = doc(db, 'users', entry.author.value)
      entry.created = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)

      this._isLoading = true
      await setDoc(entryRef, entry).then(() => {
        const index = promptStore.getPrompts.findIndex((prompt) => prompt.id === promptId)
        const prompt = promptStore.getPrompts[index]
        prompt.entries ??= []

        entry.author = userStore.getUserById(entry.author.id)
        prompt.entries.push({ ...entry, author: entry.author })
        promptStore.$patch({ _prompts: [...promptStore._prompts.slice(0, index), prompt, ...promptStore._prompts.slice(index + 1)] })
      })

      await updateDoc(doc(db, 'prompts', promptId), { entries: arrayUnion(entryRef) })
      this._isLoading = false
    },

    async editEntry(entry) {
      const promptStore = usePromptStore()
      const userStore = useUserStore()

      entry.author = doc(db, 'users', entry.author.value)
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)
      entry.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'entries', entry.id), { ...entry })
      })
        .then(() => {
          const prompts = promptStore.getPrompts
          const promptIndex = prompts.findIndex((prompt) => prompt.id === entry.prompt.id)
          const prompt = prompts[promptIndex]
          const entryIndex = prompt.entries.findIndex((e) => e.id === entry.id)

          entry.author = userStore.getUserById(entry.author.id)
          prompt.entries[entryIndex] = { ...entry, author: entry.author }
          prompts[promptIndex] = prompt
          promptStore.$patch({ _prompts: prompts })
        })
        .finally(() => (this._isLoading = false))
    },

    async deleteEntry(entryId) {
      const commentStore = useCommentStore()
      const likeStore = useLikeStore()
      const promptStore = usePromptStore()
      const shareStore = useShareStore()

      const promptId = entryId.split('T')[0]
      const entries = promptStore.getPrompts.find((prompt) => prompt.id === promptId).entries
      const entryRef = doc(db, 'entries', entryId)
      const entryImage = entries.find((entry) => entry.id === entryId).id

      this._isLoading = true
      const deleteImage = await deleteObject(ref(storage, `images/entry-${entryImage}`))
      const deleteComments = await commentStore.deleteCommentsCollection('entries', entryId)
      const deleteLikes = await likeStore.deleteAllEntryLikes(entryId)
      const deleteShares = await shareStore.deleteAllEntryShares(entryId)
      const deleteEntryRef = await updateDoc(doc(db, 'prompts', promptId), { entries: arrayRemove(entryRef) })
      const deleteEntryDoc = await deleteDoc(doc(db, 'entries', entryId))

      Promise.all([deleteImage, deleteEntryDoc, deleteEntryRef, deleteComments, deleteLikes, deleteShares])
        .then(() => {
          const prompt = promptStore.getPrompts.find((prompt) => prompt.id === promptId)
          prompt.entries = prompt.entries.filter((entry) => entry.id !== entryId)
          promptStore.$patch({
            _prompts: [
              ...promptStore._prompts.slice(0, promptStore._prompts.indexOf(prompt)),
              prompt,
              ...promptStore._prompts.slice(promptStore._prompts.indexOf(prompt) + 1)
            ]
          })
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
