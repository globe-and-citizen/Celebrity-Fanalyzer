import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import {
  collection,
  doc,
  Timestamp,
  runTransaction,
  onSnapshot,
  deleteDoc,
  addDoc,
  updateDoc,
  getDocs,
  where,
  query,
  setDoc
} from 'firebase/firestore'
import { deleteObject, ref, getMetadata, updateMetadata } from 'firebase/storage'
import {
  useCommentStore,
  useErrorStore,
  useLikeStore,
  useShareStore,
  useUserStore,
  useVisitorStore,
  useClicksStore,
  useImpressionsStore
} from 'src/stores'
import { monthDayYear } from 'src/utils/date'

export const useAdvertiseStore = defineStore('advertises', {
  state: () => ({
    _isLoading: false,
    _unSubscribe: undefined,
    _advertises: [],
    _tab: 'post',
    _activeAdvertises: [],
    _advertisesMap: new Map()
  }),

  persist: true,

  getters: {
    // getAdvertiseRef: () => (id) => doc(db, 'advertises', id),
    getAdvertises: (state) => state._advertises,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab,
    getActiveAdvertises: (state) => state._activeAdvertises
  },

  actions: {
    async fetchAdvertises() {
      const userStore = useUserStore()
      this._isLoading = true
      if (!this._unSubscribe) {
        this._unSubscribe = onSnapshot(collection(db, 'advertises'), async (querySnapshot) => {
          let advertises = querySnapshot.docs
            .map((doc) => {
              const data = { id: doc.id, ...doc.data() }

              // HashMap implementation complexcity O(1)
              // this._advertisesMap[doc.id] = data
              return data
            })
            .sort((doc1, doc2) => doc2.created - doc1.created)
          // console.log(this._advertisesMap)
          if (!userStore.isAdmin) {
            const filterData = advertises.filter((advertise) => {
              if (advertise.author.id === userStore.getUserId) {
                return true
              } else return false
            })
            advertises = filterData
          }

          for (const advertise of advertises) {
            advertise.author = userStore.getUserById(advertise.author.id) || (await userStore.fetchUser(advertise.author.id))

            onSnapshot(collection(db, 'advertises', advertise.id, 'impressions'), (impressionsSnapshot) => {
              let computedImpressions = 0
              impressionsSnapshot.docs.map((doc) => {
                computedImpressions += doc.data().impression
              })

              // HashMap implementation complexcity O(1)
              // this._advertisesMap[advertise.id] = { ...this._advertisesMap[advertise.id], impressions: computedImpressions }

              // Array implementation complexcity O(n)
              this._advertises = this._advertises.map((element) => {
                if (element.id === advertise.id) {
                  element.impressions = computedImpressions
                }
                return element
              })
            })

            onSnapshot(collection(db, 'advertises', advertise.id, 'clicks'), (clicksSnapshot) => {
              let computedClicks = 0
              clicksSnapshot.docs.map((doc) => {
                computedClicks += doc.data().clicked
              })

              // HashMap implementation complexcity O(1)
              // this._advertisesMap[advertise.id] = { ...this._advertisesMap[advertise.id], clicks: computedClicks }

              // Array implementation complexcity O(n)
              this._advertises = this._advertises.map((element) => {
                if (element.id === advertise.id) {
                  element.clicks = computedClicks
                }
                return element
              })
            })
          }

          this._advertises = []

          this.$patch({ _advertises: advertises })
        })
      }
      this._isLoading = false
    },

    async addAdvertise(payload) {
      const advertise = { ...payload }
      advertise.author = doc(db, 'users', advertise.author.uid)
      advertise.created = Timestamp.fromDate(new Date())

      this._isLoading = true
      await setDoc(doc(db, 'advertises', advertise.id), advertise)
        .catch((error) => console.log(error))
        // .then((doc) => doc.id)
        .finally(() => (this._isLoading = false))
    },

    async editAdvertise(payload) {
      const advertise = { ...payload }
      advertise.updated = Timestamp.fromDate(new Date())

      advertise.author = doc(db, 'users', advertise.author.uid)

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'advertises', advertise.id), advertise)
      }).finally(() => (this._isLoading = false))
    },

    async getActiveAdvertise() {
      const q = query(collection(db, 'advertises'), where('status', '==', 'Active'))

      const querySnapshot = await getDocs(q)

      let activeAdvertises = []
      this._activeAdvertises = querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data(), isAdd: true }
        activeAdvertises.push(data)
      })
      this._activeAdvertises = []
      this.$patch({ _activeAdvertises: activeAdvertises })
    },

    async deleteAdvertise(id, isBanner) {
      const commentStore = useCommentStore()
      const errorStore = useErrorStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()
      const visitorStore = useVisitorStore()
      const clicksStore = useClicksStore()
      const impressionsStore = useImpressionsStore()
      const imagePath = `advertise/content-${id}`

      const imageRef = ref(storage, imagePath)

      if (isBanner) {
        await deleteObject(imageRef)
      }
      try {
        const deleteComments = commentStore.deleteCommentsCollection('advertises', id)
        const deleteLikes = likeStore.deleteAllLikesDislikes('advertises', id)
        const deleteAdvertiseDoc = deleteDoc(doc(db, 'advertises', id))
        const deleteShares = shareStore.deleteAllShares('advertises', id)
        const deleteVisitors = visitorStore.deleteAllVisitors('advertises', id)
        const deleteClicks = clicksStore.deleteAllClicks('advertises', id)
        const deleteImpressions = impressionsStore.deleteAllImpressions('advertises', id)

        await Promise.all([deleteComments, deleteLikes, deleteShares, deleteAdvertiseDoc, deleteVisitors, deleteClicks, deleteImpressions])
      } catch (error) {
        console.log(error)
        errorStore.throwError(error)
      }

      this._isLoading = false
    },

    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
