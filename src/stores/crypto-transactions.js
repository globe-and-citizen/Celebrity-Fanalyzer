import { addDoc, collection, doc, getDoc, getDocs, query, runTransaction, Timestamp, updateDoc, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useEntryStore, usePromptStore, useUserStore } from 'src/stores'

export const useCryptoTransactionStore = defineStore('cryptoTransactions', {
  state: () => ({
    _cryptoTransactions: undefined,
    _isLoading: false,
    _unSubscribe: undefined,
    _tab: 'post'
  }),

  // persist: true,

  getters: {
    getCryptoTransactions: (state) => state._cryptoTransactions,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab
  },

  actions: {
    async addCryptoTransaction(payload) {
      const promptStore = usePromptStore()
      const entryStore = useEntryStore()
      const userStore = useUserStore()
      // Clone the payload to avoid mutating the original object
      const { prompt, ...cryptoTransaction } = payload

      // Get the prompt reference
      const promptRef = promptStore.getPromptRef(prompt?.id)

      // Update fields with document references
      cryptoTransaction.entry = doc(db, 'entries', cryptoTransaction.entry.id)
      cryptoTransaction.initiator = doc(db, 'users', cryptoTransaction.initiator.uid)
      cryptoTransaction.created = Timestamp.fromDate(new Date())

      this._isLoading = true

      try {
        // Update the prompt document
        await updateDoc(doc(db, 'prompts', promptRef.id), { isTreated: true, updated: Timestamp.fromDate(new Date()) })
        await updateDoc(doc(db, 'entries', payload.entry.id), {
          isTreated: true,
          updated: Timestamp.fromDate(new Date())
        })
        const cryptoTransactionRef = await addDoc(collection(db, 'cryptoTransactions'), cryptoTransaction)
        // Fetch updated documents separately after the transaction
        const updatedEntryDoc = await getDoc(doc(db, 'entries', cryptoTransaction.entry.id))
        const updatedPromptDoc = await getDoc(doc(db, 'prompts', prompt?.id))
        if (!userStore.isEditorOrAbove) {
          const updatedEntry = updatedEntryDoc.data()
          const index = entryStore.getUserRelatedEntries.findIndex((entry) => entry.id === updatedEntry.id)
          if (index !== -1) {
            const newEntry = {
              ...updatedEntry,
              isTreated: true
            }
            entryStore.getUserRelatedEntries.splice(index, 1, newEntry)
          }
        }

        return {
          _entry: updatedEntryDoc.data(),
          _prompt: updatedPromptDoc.data()
        }
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
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      } catch (error) {
        console.error('Error fetching cryptoTransaction :', error)
        return []
      } finally {
        this._isLoading = false
      }
    }
  }
})
