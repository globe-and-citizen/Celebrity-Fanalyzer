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
  addDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import {
  useEntryStore,
  useCommentStore,
  useErrorStore,
  useLikeStore,
  useNotificationStore,
  usePromptStore,
  useShareStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'

export const useCryptoTransactionStore = defineStore('cryptoTransactions', {
  state: () => ({
    _trnsactions: undefined,
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
      const entryStore= useEntryStore()
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndWriters()
      }

      this._isLoading = true

      if (this._unSubscribe) {
        this._unSubscribe()
      }
      this._unSubscribe = onSnapshot(collection(db, 'cryptoTransactions'), async (querySnapshot) => {
        const cryptoTransactions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        for (const cryptoTransaction of cryptoTransactions) {
          //entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
          if(cryptoTransaction.initiator.id){
            cryptoTransaction.initiator = userStore.getUserById(cryptoTransaction.initiator.id) 
          }
          if(cryptoTransaction.entry.id){
            cryptoTransaction.entry = entryStore.getEntryById(cryptoTransaction.entry.id) 
          }
        }

        this.$patch({ _cryptoTransactions: cryptoTransactions })
      })
      this._isLoading = false
    },

    async addCryptoTransaction(payload) {
      console.log("the received payload ", payload);
      const notificationStore = useNotificationStore();
      const promptStore= usePromptStore();
    
      // Clone the payload to avoid mutating the original object
      const cryptoTransaction = { ...payload };
    
      // Get the prompt reference
      const promptRef = promptStore.getPromptRef(cryptoTransaction.entry.prompt);
    
      // Update fields with document references
      cryptoTransaction.entry = doc(db, 'entries', cryptoTransaction.entry.id);
      cryptoTransaction.initiator = doc(db, 'users', cryptoTransaction.initiator.uid);
      cryptoTransaction.created = Timestamp.fromDate(new Date());
    
      console.log("we got you ", cryptoTransaction.entry);
    
      this._isLoading = true;
      
      try {
        // Update the prompt document
        await updateDoc(doc(db, 'prompts', promptRef.id), { isTreated: true, updated: Timestamp.fromDate(new Date()) });
    
        // Add the new transaction document to the 'cryptoTransactions' collection
        // Firestore will automatically generate a document ID for this transaction
        const cryptoTransactionRef = await addDoc(collection(db, 'cryptoTransactions'), cryptoTransaction);
       
    
        // Optionally, update the notification store
        // await notificationStore.toggleSubscription('transactions', cryptoTransactionRef.id);
      } catch (error) {
        console.error("Error adding transaction:", error);
      } finally {
        this._isLoading = false;
      }
    },

    async getCryptoTransactionsByEntry(entryId) {
      
      this._isLoading = true;
    
      // Query combining 'where' conditions
      const cryptoTransactionsQuery = query(
        collection(db, 'cryptoTransactions'),
        where('entry', '==', doc(db, 'entries', entryId))
      );
    
      try {
        const querySnapshot = await getDocs(cryptoTransactionsQuery);
        const cryptoTransaction = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return cryptoTransaction;
      } catch (error) {
        console.error("Error fetching cryptoTransaction :", error);
        return [];
      } finally {
        this._isLoading = false;
      }
    },

  }
})
