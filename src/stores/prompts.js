import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore'
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
    _prompts: undefined,
    _tab: 'post',
    promptDialog: false,
    entryDialog: {}
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

      try {
        this._isLoading = true
        const querySnapshot = await getDocs(collection(db, 'prompts'))
        const prompts = []

        for (const doc of querySnapshot.docs) {
          const promptData = doc.data()
          const authorId = promptData.author.id
          const author = userStore.getUserById(authorId) || (await userStore.fetchUser(authorId))

          prompts.push({
            id: doc.id,
            ...promptData,
            author,
            entries: promptData.entries?.map((entry) => entry.id) || []
          })
        }
        prompts.reverse()
        this._prompts = prompts
      } catch (e) {
        console.error('Error fetching prompts:', e)
      } finally {
        this._isLoading = false
      }
    },

    async fetchPromptBySlug(slug) {
      this._isLoading = true
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndWriters()
      }

      const promptRef = await getDocs(query(collection(db, 'prompts'), where('slug', '==', slug)))
      const promptSnapshot = promptRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

      this._isLoading = false
      this._prompts = [
        {
          ...promptSnapshot,
          entries: promptSnapshot.entries?.map((entry) => entry.id) || []
        }
      ]
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
        const deleteVisitors = visitorStore.deleteAllVisitors('prompts', id)

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
