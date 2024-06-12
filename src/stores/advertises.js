import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import { collection, doc, Timestamp, runTransaction, onSnapshot, deleteDoc, where, query, setDoc, orderBy } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
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

export const useAdvertiseStore = defineStore('advertises', {
  state: () => ({
    _isLoading: false,
    _unSubscribe: undefined,
    _advertises: [],
    _tab: 'post',
    _activeAdvertises: [],
    _unSubscribeActive: undefined,
    _singleAdvertise: undefined
  }),

  persist: true,

  getters: {
    getAdvertises: (state) => state._advertises,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab,
    getActiveAdvertises: (state) => state._activeAdvertises,
    getMapAdvertises: (state) => Object.values(state._advertisesMap)
  },

  actions: {
    async fetchAdvertises() {
      const userStore = useUserStore()
      if (!this._unSubscribe) {
        const q = query(collection(db, 'advertises'), orderBy('created', 'desc'))
        this._unSubscribe = onSnapshot(q, async (querySnapshot) => {
          this.setLoaderTrue()
          let advertises = querySnapshot.docs.map((doc) => {
            const data = { id: doc.id, ...doc.data() }
            return data
          })

          if (!userStore.isAdmin) {
            const filterData = advertises.filter((advertise) => {
              if (advertise.author.id === userStore.getUserId) {
                return true
              } else {
                return false
              }
            })
            advertises = filterData
          }

          for (const advertise of advertises) {
            advertise.author = userStore.getUserById(advertise.author.id) || (await userStore.fetchUser(advertise.author.id))
          }

          this._advertises = []
          this.$patch({ _advertises: advertises })
          this.computeLikesAndImpressions()
          this.setLoaderFalse()
        })
      }
    },
    setLoaderTrue() {
      this._isLoading = true
    },
    setLoaderFalse() {
      this._isLoading = false
    },
    async computeLikesAndImpressions() {
      this.getAdvertises.map((advertise) => {
        onSnapshot(collection(db, 'advertises', advertise.id, 'impressions'), (impressionsSnapshot) => {
          let computedImpressions = 0
          impressionsSnapshot.docs.map((doc) => {
            computedImpressions += doc.data().impression
          })
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
          this._advertises = this._advertises.map((element) => {
            if (element.id === advertise.id) {
              element.clicks = computedClicks
            }
            return element
          })
        })
      })
    },

    async addAdvertise(payload) {
      const advertise = { ...payload }
      advertise.author = doc(db, 'users', advertise.author.uid)
      advertise.created = Timestamp.fromDate(new Date())
      advertise.isApproved = false

      this._isLoading = true
      await setDoc(doc(db, 'advertises', advertise.id), advertise)
        .catch((error) => console.log(error))
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
      const q = query(
        collection(db, 'advertises'),
        where('status', '==', 'Active'),
        where('isApproved', '==', true),
        orderBy('created', 'desc')
      )
      const userStore = useUserStore()
      if (!this._unSubscribeActive) {
        this._unSubscribeActive = onSnapshot(q, (querySnapshot) => {
          const activeAdvertises = []
          querySnapshot.forEach(async (doc) => {
            const data = { id: doc.id, ...doc.data(), isAdd: true }
            const user = userStore.getUserById(data.author.id) || (await userStore.fetchUser(data.author.id))
            data.author = user
            activeAdvertises.push(data)
          })
          this._activeAdvertises = []
          this.$patch({ _activeAdvertises: activeAdvertises })
        })
      }
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
    resetAdvertises() {
      this._advertises = []
    },
    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
