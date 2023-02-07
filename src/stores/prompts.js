import { collection, deleteDoc, doc, getDoc, getDocs, query, runTransaction, setDoc, Timestamp, where } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import { useEntryStore, useLikeStore, useShareStore, useUserStore } from 'src/stores'
import { currentYearMonth, previousYearMonth } from 'src/utils/date'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _isLoading: false,
    _monthPrompt: null,
    _prompts: []
  }),

  persist: true,

  getters: {
    getMonthPrompt: (state) => state._monthPrompt,
    getPromptRef: () => (id) => doc(db, 'prompts', id),
    getPrompts: (state) => state._prompts,
    isLoading: (state) => state._isLoading
  },

  actions: {
    /**
     * Fetch the current month prompt and set the value in the store :
     * Checking if we have a data in the store.
     * Check if we have data in the local storage.
     * Fetch the data form firebase if 1-2 is false.
     * @returns {Promise<void>}
     */
    async fetchMonthPrompt() {
      const currentMonthId = currentYearMonth()
      const previousMonthId = previousYearMonth()

      this._isLoading = true
      const docSnap = await getDoc(doc(db, 'prompts', currentMonthId))

      if (docSnap.exists()) {
        const prompt = docSnap.data()

        prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
        if (prompt.entries?.length) {
          for (const index in prompt.entries) {
            prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
            prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
          }
        }
        this._monthPrompt = prompt
      } else {
        await getDoc(doc(db, 'prompts', previousMonthId)).then(async (doc) => {
          const prompt = { id: doc.id, ...doc.data() }

          prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
          if (prompt.entries?.length) {
            for (const index in prompt.entries) {
              prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
              prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
            }
          }
          this._monthPrompt = prompt
        })
      }
      this._isLoading = false
    },
    /**
     * Fetch prompt By id if it's not exist or reload it if it's exist
     * @param promptId
     * @returns {Promise<void>}
     */
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
                prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => ({ id: doc.id, ...doc.data() }))
                prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
              }
            }
          }

          prompts.reverse()

          this._prompts = []
          this.$patch({ _prompts: prompts })
        })
        .finally(() => (this._isLoading = false))
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = userStore.getUserRef
      prompt.created = Timestamp.fromDate(new Date())
      prompt.id = prompt.date

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.id), prompt)
        .then(() => {
          prompt.author = userStore.getUser
          this.$patch({ _prompts: [...this.getPrompts, prompt] })
        })
        .finally(() => (this._isLoading = false))
    },

    async editPrompt(prompt) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), prompt)
      })
        .then(() => {
          const index = this.getPrompts.findIndex((p) => p.id === prompt.id)
          this.$patch({
            _prompts: [...this._prompts.slice(0, index), { ...this._prompts[index], ...prompt }, ...this._prompts.slice(index + 1)]
          })
        })
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      const entryStore = useEntryStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()

      const relatedEntries = this._prompts.find((prompt) => prompt.id === id)?.entries || []

      this._isLoading = true
      if (relatedEntries.length) {
        for (const entry of relatedEntries) {
          await entryStore.deleteEntry(entry.id)
        }
      }
      const deleteImage = await deleteObject(ref(storage, `images/prompt-${id}`))
      const deleteLikes = await likeStore.deleteAllPromptLikes(id)
      const deletePromptDoc = await deleteDoc(doc(db, 'prompts', id))
      const deleteShares = await shareStore.deleteAllPromptShares(id)

      Promise.all([deleteLikes, deleteShares, deleteImage, deletePromptDoc])
        .then(() => {
          const index = this._prompts.findIndex((prompt) => prompt.id === id)
          this._prompts.splice(index, 1)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file, promptId) {
      const storageRef = ref(storage, `images/prompt-${promptId}`)

      this._isLoading = true
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(ref(storage, storageRef))
    }
  }
})
