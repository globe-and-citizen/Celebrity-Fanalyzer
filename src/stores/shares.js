import { collection, deleteDoc, doc, getCountFromServer, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import layer8 from 'layer8_interceptor'
import { baseURL } from 'stores/stats'

const pushShareToStats = async (user_id, id, social_media) =>
  await layer8
    .fetch(`${baseURL}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id, id, social_media })
    })
    .then((res) => res.json())
    .catch((err) => console.log(err))

export const useShareStore = defineStore('shares', {
  state: () => ({
    _sharesCount: undefined,
    _sharesStats: undefined,
    _unSubscribe: undefined,
    _isLoading: false
  }),

  persist: true,

  getters: {
    getShares: (state) => state._shares,
    isLoaded: (state) => !!state._shares || state._shares === 0,
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchSharesCount(collectionName, documentId) {
      try {
        const totalCountFunc = await getCountFromServer(collection(db, collectionName, documentId, 'shares'))
        this._sharesCount = totalCountFunc.data().count
        this._isLoading = false
      } catch (e) {
        console.error('Failed fetching shares count', e)
      }
    },

    async fetchSharesStats(collectionName, documentId) {
      try {
        const sharesCollection = collection(db, collectionName, documentId, 'shares')
        const querySnapshot = await getDocs(sharesCollection)
        this._sharesStats = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        this._isLoading = false
      } catch (e) {
        console.error('Failed fetching shares count', e)
      }
    },

    async addShare(collectionName, documentId, socialNetwork) {
      try {
        this._isLoading = true
        const userStore = useUserStore()
        await userStore.fetchUserIp()

        const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash
        const docId = socialNetwork + '-' + (userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIpHash)

        await setDoc(doc(db, collectionName, documentId, 'shares', docId), {
          author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
          createdAt: Timestamp.fromDate(new Date()),
          sharedOn: socialNetwork
        })
        await pushShareToStats(user_id, documentId, socialNetwork)

        await this.fetchSharesCount(collectionName, documentId)
        this._isLoading = false
      } catch (e) {
        console.error('Error adding share:', e)
      } finally {
        this._isLoading = false
      }
    },

    async deleteAllShares(collectionName, documentId) {
      this._isLoading = true
      const sharesCollection = collection(db, collectionName, documentId, 'shares')

      const snapshot = await getDocs(sharesCollection)

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    },

    async resetShares() {
      this._sharesCount = undefined
    }
  }
})
