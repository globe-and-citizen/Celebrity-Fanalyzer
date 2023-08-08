import { collection, deleteDoc, doc, onSnapshot, runTransaction, setDoc, Timestamp } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import {
  useCommentStore,
  useEntryStore,
  useErrorStore,
  useLikeStore,
  useNotificationStore,
  useShareStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _isLoading: false,
    _prompts: [],
    _tab: 'post'
  }),

  persist: true,

  getters: {
    getPromptRef: () => (id) => doc(db, 'prompts', id),
    getPrompts: (state) => state._prompts,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab
  },

  actions: {
    async fetchPrompts() {
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndWriters()
      }

      this._isLoading = true
      onSnapshot(collection(db, 'prompts'), (querySnapshot) => {
        const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const prompt of prompts) {
          prompt.author = userStore.getUserById(prompt.author.id) || prompt.author
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

      const prompt = { ...payload }

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.created = Timestamp.fromDate(new Date())
      prompt.id = prompt.date

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.id), prompt).finally(() => (this._isLoading = false))

      await notificationStore.toggleSubscription('prompts', prompt.id)
    },

    async editPrompt(payload) {
      const prompt = { ...payload }

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), prompt)
      }).finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      const commentStore = useCommentStore()
      const entryStore = useEntryStore()
      const errorStore = useErrorStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()
      const visitorStore = useVisitorStore()

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
        const deleteVisitors = visitorStore.deleteAllVisitors('entries', entryId)

        await Promise.all([deleteComments, deleteLikes, deleteShares, deleteImage, deletePromptDoc, deleteVisitors])
      } catch (error) {
        errorStore.throwError(error)
      }
      this._isLoading = false
    },

    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
