import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useNotificationStore, useShareStore, useUserStore } from 'src/stores'
import { currentYearMonth } from 'src/utils/date'

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

      this._isLoading = true
      const docSnap = await getDoc(doc(db, 'prompts', currentMonthId))

      let prompt = {}

      if (docSnap.exists()) {
        prompt = docSnap.data()
      } else {
        await getDocs(query(collection(db, 'prompts'), orderBy('date', 'desc'), limit(1))).then(async (querySnapshot) => {
          prompt = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
        })
      }

      prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
      this._monthPrompt = prompt

      if (prompt.entries?.length) {
        for (const index in prompt.entries) {
          prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
          prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
        }
      }

      this._isLoading = false
    },

    async fetchPrompts() {
      const userStore = useUserStore()

      if (!userStore.getUsers.length) {
        await userStore.fetchAdminsAndWriters()
      }

      this._isLoading = true
      onSnapshot(collection(db, 'prompts'), (querySnapshot) => {
        const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const prompt of prompts) {
          prompt.author = userStore.getUserById(prompt.author.id)
          prompt.entries = prompt.entries?.map((entry) => entry.id)
        }

        prompts.reverse()

        this._prompts = []
        this.$patch({ _prompts: prompts })
      })
      this._isLoading = false
    },

    async addPrompt(payload) {
      const notificationStore = useNotificationStore()
      const userStore = useUserStore()

      const prompt = { ...payload }

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.created = Timestamp.fromDate(new Date())
      prompt.id = prompt.date

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.id), prompt)
        .then(() => {

          // This not needed, with onSnapCHot
          // prompt.author = userStore.getUserById(prompt.author.id)
          // this.$patch({ _prompts: [...this.getPrompts, prompt] })
        })
        .finally(() => (this._isLoading = false))

      await notificationStore.toggleSubscription('prompts', prompt.id)
    },

    async editPrompt(payload) {
      const userStore = useUserStore()

      const prompt = { ...payload }

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), prompt)
      })
        .then(() => {
          const index = this.getPrompts.findIndex((p) => p.id === prompt.id)
          prompt.author = userStore.getUserById(prompt.author.id)
          this.$patch({
            _prompts: [...this._prompts.slice(0, index), { ...this._prompts[index], ...prompt }, ...this._prompts.slice(index + 1)]
          })
        })
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      const commentStore = useCommentStore()
      const entryStore = useEntryStore()
      const errorStore = useErrorStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()

      const relatedEntries = this._prompts.find((prompt) => prompt.id === id)?.entries || []

      this._isLoading = true
      if (relatedEntries.length) {
        for (const entryId of relatedEntries) {
          await entryStore.deleteEntry(entryId)
        }
      }

      try {
        const deleteImage = deleteObject(ref(storage, `images/prompt-${id}`))
        const deleteComments = commentStore.deleteCommentsCollection('prompts', id)
        const deleteLikes = likeStore.deleteAllLikesDislikes('prompts', id)
        const deletePromptDoc = deleteDoc(doc(db, 'prompts', id))
        const deleteShares = shareStore.deleteAllShares('prompts', id)

        await Promise.all([deleteComments, deleteLikes, deleteShares, deleteImage, deletePromptDoc]).then(() => {
         // No need
         //  const index = this._prompts.findIndex((prompt) => prompt.id === id)
         //  this._prompts.splice(index, 1)
        })
      } catch (error) {
        errorStore.throwError(error)
      }
      this._isLoading = false
    }
  }
})
