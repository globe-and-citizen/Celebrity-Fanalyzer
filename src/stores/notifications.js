import { arrayRemove, arrayUnion, doc, runTransaction } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useEntryStore } from './entries'
import { usePromptStore } from './prompts'
import { useUserStore } from './user'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    _isLoading: false,
    _notifications: []
  }),

  persist: true,

  getters: {
    getNotifications: (state) => state._notifications,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async toggleSubscription(collectionName, documentId) {
      const promptStore = usePromptStore()
      const entryStore = useEntryStore()
      const userStore = useUserStore()

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        const addToArray = (array, element) => [...array, element]
        const removeFromArray = (array, element) => array.filter((item) => item !== element)

        if (userStore.getUser.subscriptions?.includes(documentId)) {
          transaction.update(doc(db, collectionName, documentId), { subscribers: arrayRemove(userStore.getUser.uid) })
          transaction.update(userStore.getUserRef, { subscriptions: arrayRemove(documentId) })
          userStore._user.subscriptions = removeFromArray(userStore.getUser.subscriptions, documentId)

          if (collectionName === 'prompts') {
            promptStore._prompts = promptStore.getPrompts.map((prompt) =>
              prompt.id === documentId ? { ...prompt, subscribers: removeFromArray(prompt.subscribers, userStore.getUser.uid) } : prompt
            )
          }
          if (collectionName === 'entries') {
            entryStore._entries = entryStore.getEntries.map((entry) =>
              entry.id === documentId ? { ...entry, subscribers: removeFromArray(entry.subscribers, userStore.getUser.uid) } : entry
            )
          }
        } else {
          transaction.update(doc(db, collectionName, documentId), { subscribers: arrayUnion(userStore.getUser.uid) })
          transaction.update(userStore.getUserRef, { subscriptions: arrayUnion(documentId) })
          userStore._user.subscriptions = addToArray(userStore.getUser.subscriptions, documentId)

          if (collectionName === 'prompts') {
            promptStore._prompts = promptStore.getPrompts.map((prompt) =>
              prompt.id === documentId ? { ...prompt, subscribers: addToArray(prompt.subscribers, userStore.getUser.uid) } : prompt
            )
          }

          if (collectionName === 'entries') {
            entryStore._entries = entryStore.getEntries.map((entry) =>
              entry.id === documentId ? { ...entry, subscribers: addToArray(entry.subscribers, userStore.getUser.uid) } : entry
            )
          }
        }
      }).finally(() => (this._isLoading = false))
    }
  }
})
