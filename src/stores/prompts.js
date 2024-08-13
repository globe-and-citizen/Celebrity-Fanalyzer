import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  or,
  orderBy,
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
  useStatStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'
import { Notify } from 'quasar'
import { currentYearMonth } from 'src/utils/date'

const getPrompts = async (querySnapshot, userStore) => {
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
  return prompts.reverse()
}

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _isLoading: false,
    _prompts: undefined,
    _monthPrompt: undefined,
    _tab: 'post',
    promptDialog: false,
    entryDialog: {}
  }),

  persist: true,

  getters: {
    getPromptRef: () => (id) => doc(db, 'prompts', id),
    getPrompts: (state) => state._prompts,
    getMonthPrompt: (state) => state._monthPrompt,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab
  },

  actions: {
    async redirect() {
      Notify.create({
        type: 'info',
        message: 'Not found'
      })
      setTimeout(async () => {
        Notify.create({
          type: 'info',
          message: 'You will be redirected in 3 seconds'
        })
      }, 3000)
      setTimeout(async () => {
        window.location.href = '/404'
      }, 6000)
    },

    async fetchPrompts() {
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndEditors()
      }

      try {
        this._isLoading = true
        const querySnapshot = await getDocs(collection(db, 'prompts'))
        const prompts = await getPrompts(querySnapshot, userStore)
        this._prompts = prompts
        return prompts
      } catch (e) {
        console.error('Error fetching prompts:', e)
      } finally {
        this._isLoading = false
      }
    },

    async fetchPromptById(id) {
      const userStore = useUserStore()
      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndEditors()
      }

      try {
        this._isLoading = true
        const querySnapshot = await getDocs(query(collection(db, 'prompts'), where('id', '==', id)))
        return await getPrompts(querySnapshot, userStore)
      } catch (e) {
        console.error('Error fetching prompts:', e)
      } finally {
        this._isLoading = false
      }
    },

    async fetchPromptBySlug(slug) {
      try {
        this._isLoading = true
        const userStore = useUserStore()

        if (!userStore.getUsers) {
          await userStore.fetchAdminsAndEditors()
        }
        const promptRef = await getDocs(query(collection(db, 'prompts'), or(where('slug', '==', slug), where('date', '==', slug))))
        const promptSnapshot = promptRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

        if (promptSnapshot.author.id) {
          promptSnapshot.author = userStore.getUserById(promptSnapshot.author.id) || (await userStore.fetchUser(promptSnapshot.author.id))
        }

        if (promptRef.empty) {
          await this.redirect()
        }

        this._isLoading = false
        this._prompts = [
          {
            ...promptSnapshot,
            entries: promptSnapshot?.entries?.map((entry) => entry.id) || []
          }
        ]
      } catch (e) {
        console.error('Error fetching promptsBySlug:', e)
        await this.redirect()
      }
    },

    async fetchMonthsPrompt() {
      try {
        this._isLoading = true
        const userStore = useUserStore()

        if (!userStore.getUsers) {
          await userStore.fetchAdminsAndEditors()
        }

        const promptDocRef = doc(db, 'prompts', currentYearMonth())
        const promptSnapshotRef = await getDoc(promptDocRef)

        if (promptSnapshotRef.exists()) {
          const promptSnapshot = { id: promptSnapshotRef.id, ...promptSnapshotRef.data() }

          if (promptSnapshot.author && promptSnapshot.author.id) {
            promptSnapshot.author = userStore.getUserById(promptSnapshot.author.id) || (await userStore.fetchUser(promptSnapshot.author.id))
          }

          this._isLoading = false
          this._monthPrompt = [
            {
              ...promptSnapshot,
              entries: promptSnapshot?.entries?.map((entry) => entry.id) || []
            }
          ]
        } else {
          const lastPromptAvailableRef = await getDocs(query(collection(db, 'prompts'), orderBy('created', 'desc'), limit(1)))
          const lastPrompt = lastPromptAvailableRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

          if (lastPrompt.author && lastPrompt.author.id) {
            lastPrompt.author = userStore.getUserById(lastPrompt.author.id) || (await userStore.fetchUser(lastPrompt.author.id))
          }
          this._isLoading = false
          this._monthPrompt = [
            {
              ...lastPrompt,
              entries: lastPrompt?.entries?.map((entry) => entry.id) || []
            }
          ]
        }
      } catch (e) {
        await this.redirect()
        console.error('Error fetching months prompts:', e)
      }
    },

    async hasPrompt(date) {
      try {
        const promptSnapshot = await getDocs(query(collection(db, 'prompts'), where('date', '==', date)))
        return !promptSnapshot.empty
      } catch (error) {
        console.log('Error occurred while checking', error)
        return false
      }
    },

    async addPrompt(payload) {
      const notificationStore = useNotificationStore()
      const userStore = useUserStore()

      const prompt = { ...payload }

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.created = Timestamp.fromDate(new Date())
      prompt.id = prompt.date

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.id), prompt).finally(() => (this._isLoading = false))

      prompt.author = await userStore.fetchUser(prompt.author.id)
      prompt.entries = []
      const prompts = [prompt, ...this.getPrompts]
      this._prompts = prompts

      await notificationStore.toggleSubscription('prompts', prompt.id)
    },

    async editPrompt(payload) {
      const prompt = { ...payload }
      const userStore = useUserStore()

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), prompt)
      })
        .then(async () => {
          prompt.entries = []
          prompt.author = await userStore.fetchUser(prompt.author.id)

          this._prompts = this._prompts.map((element) => (element.id === prompt.id ? prompt : element))
          this._monthPrompt = this._monthPrompt.map((element) => (element.id === prompt.id ? prompt : element))
        })
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      const commentStore = useCommentStore()
      const entryStore = useEntryStore()
      const errorStore = useErrorStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()
      const visitorStore = useVisitorStore()
      const statStore = useStatStore()

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
        const deletePromptFromStats = statStore.removeTopic(id)

        await Promise.all([deleteComments, deleteLikes, deleteShares, deleteImage, deletePromptDoc, deleteVisitors, deletePromptFromStats])
        this._prompts = this.getPrompts?.filter((prompt) => prompt.id !== id)
      } catch (error) {
        await errorStore.throwError(error, 'Error deleting prompt')
      }
      this._isLoading = false
    },

    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
