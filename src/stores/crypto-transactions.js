import { collection, doc, getDocs, onSnapshot, query, addDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useEntryStore, useNotificationStore, usePromptStore, useUserStore } from 'src/stores'

export const useCryptoTransactionStore = defineStore('cryptoTransactions', {
  state: () => ({
    _cryptoTransactions: undefined,
    _isLoading: false,
    _unSubscribe: undefined,
    _tab: 'post'
  }),

  persist: true,

  getters: {
    getCryptoTransactions: (state) => state._cryptoTransactions,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab
  },

  actions: {
    async fetchETransactions() {
      const entryStore = useEntryStore()
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndEditors()
      }

      this._isLoading = true

      if (this._unSubscribe) {
        this._unSubscribe()
      }
      this._unSubscribe = onSnapshot(collection(db, 'cryptoTransactions'), async (querySnapshot) => {
        const cryptoTransactions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const cryptoTransaction of cryptoTransactions) {
          //entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
          if (cryptoTransaction.initiator.id) {
            cryptoTransaction.initiator = userStore.getUserById(cryptoTransaction.initiator.id)
          }
          if (cryptoTransaction.entry.id) {
            cryptoTransaction.entry = entryStore.getEntryById(cryptoTransaction.entry.id)
          }
        }

        this.$patch({ _cryptoTransactions: cryptoTransactions })
      })
      this._isLoading = false
    },

    async addCryptoTransaction(payload) {
      //console.log("the pay load ", payload);
      const notificationStore = useNotificationStore()
      const promptStore = usePromptStore()

      //console.log("the payload === ", payload);
      // Clone the payload to avoid mutating the original object
      const cryptoTransaction = { ...payload }

      // Get the prompt reference
      const promptRef = promptStore.getPromptRef(cryptoTransaction.entry.prompt?.id)

      // Update fields with document references
      cryptoTransaction.entry = doc(db, 'entries', cryptoTransaction.entry.id)
      cryptoTransaction.initiator = doc(db, 'users', cryptoTransaction.initiator.uid)
      cryptoTransaction.created = Timestamp.fromDate(new Date())

      this._isLoading = true

      try {
        // Update the prompt document
        await updateDoc(doc(db, 'prompts', promptRef.id), { isTreated: true, updated: Timestamp.fromDate(new Date()) })
        // Add the new transaction document to the 'cryptoTransactions' collection
        const cryptoTransactionRef = await addDoc(collection(db, 'cryptoTransactions'), cryptoTransaction)
      } catch (error) {
        console.error('Error adding transaction:', error)
      } finally {
        this._isLoading = false
      }
    },

    async getCryptoTransactionsByEntry(entryId) {
      this._isLoading = true

      // Query combining 'where' conditions
      const cryptoTransactionsQuery = query(collection(db, 'cryptoTransactions'), where('entry', '==', doc(db, 'entries', entryId)))

      try {
        const querySnapshot = await getDocs(cryptoTransactionsQuery)
        const cryptoTransaction = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        return cryptoTransaction
      } catch (error) {
        console.error('Error fetching cryptoTransaction :', error)
        return []
      } finally {
        this._isLoading = false
      }
    }
  }
})
