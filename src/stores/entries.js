import {
  arrayRemove,
  arrayUnion,
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
  updateDoc,
  where
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import { useCommentStore, useErrorStore, useLikeStore, useNotificationStore, usePromptStore, useShareStore, useUserStore } from 'src/stores'

export const useEntryStore = defineStore('entries', {
  state: () => ({
    _entries: undefined,
    _isLoading: false,
    _unSubscribe: undefined,
    _tab: 'post'
  }),

  persist: true,

  getters: {
    getEntries: (state) => state._entries,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab
  },

  actions: {
    async fetchEntries() {
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndWriters()
      }

      this._isLoading = true

      if (this._unSubscribe) {
        this._unSubscribe()
      }
      this._unSubscribe = onSnapshot(collection(db, 'entries'), (querySnapshot) => {
        const entries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const entry of entries) {
          entry.author = userStore.getUserById(entry.author.id) ?userStore.getUserById(entry.author.id) :  entry.author
          entry.prompt = entry.prompt.id
        }

        this.$patch({ _entries: entries })
      })
      this._isLoading = false
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

    async addEntry(payload) {
      const notificationStore = useNotificationStore()
      const promptStore = usePromptStore()

      const entry = { ...payload }

      const promptId = entry.prompt.value
      const entryRef = doc(db, 'entries', entry.id)

      entry.author = doc(db, 'users', entry.author.value)
      entry.created = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)

      this._isLoading = true
      await setDoc(entryRef, entry).finally(() => (this._isLoading = false))

      await updateDoc(doc(db, 'prompts', promptId), { entries: arrayUnion(entryRef) })

      await notificationStore.toggleSubscription('entries', entry.id)
    },

    async editEntry(payload) {
      const promptStore = usePromptStore()

      const entry = { ...payload }

      entry.author = doc(db, 'users', entry.author.value)
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)
      entry.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'entries', entry.id), { ...entry })
      }).finally(() => (this._isLoading = false))
    },

    async deleteEntry(entryId) {
      const commentStore = useCommentStore()
      const errorStore = useErrorStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()

      const promptId = entryId.split('T')[0]
      const entryRef = doc(db, 'entries', entryId)

      this._isLoading = true
      try {
        const deleteImage = deleteObject(ref(storage, `images/entry-${entryId}`))
        const deleteComments = commentStore.deleteCommentsCollection('entries', entryId)
        const deleteLikes = likeStore.deleteAllLikesDislikes('entries', entryId)
        const deleteShares = shareStore.deleteAllShares('entries', entryId)
        const deleteEntryRef = updateDoc(doc(db, 'prompts', promptId), { entries: arrayRemove(entryRef) })
        const deleteEntryDoc = deleteDoc(doc(db, 'entries', entryId))

        await Promise.all([deleteImage, deleteEntryDoc, deleteEntryRef, deleteComments, deleteLikes, deleteShares])
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
