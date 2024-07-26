import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, runTransaction, setDoc, Timestamp, where } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import {
  useClicksStore,
  useCommentStore,
  useErrorStore,
  useImpressionsStore,
  useLikeStore,
  useShareStore,
  useUserStore,
  useVisitorStore
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
    async fetchAdvertises(type) {
      const userStore = useUserStore()
      if (type) {
        try {
          const q = query(collection(db, 'advertises'), type !== 'All' ? where('status', '==', type) : '', orderBy('created', 'desc'))
          this._unSubscribe = onSnapshot(q, async (querySnapshot) => {
            this.setLoaderTrue()
            let advertises = querySnapshot.docs.map((doc) => {
              return { id: doc.id, ...doc.data() }
            })

            if (!userStore.isAdmin) {
              advertises = advertises.filter((advertise) => {
                return advertise.author.id === userStore.getUserId
              })
            }

            for (const advertise of advertises) {
              advertise.author = userStore.getUserById(advertise.author.id) || (await userStore.fetchUser(advertise.author.id))
            }
            this._advertises = []
            this.$patch({ _advertises: advertises })
            await this.computeValues()
            this.setLoaderFalse()
          })
        } catch (err) {
          console.error(err)
        }
      }
    },
    setLoaderTrue() {
      this._isLoading = true
    },
    setLoaderFalse() {
      this._isLoading = false
    },
    async computeValues() {
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
        onSnapshot(collection(db, 'advertises', advertise.id, 'visitors'), (visitsSnapshot) => {
          let computedVisits = 0
          visitsSnapshot.docs.map((doc) => {
            computedVisits += doc.data().visits?.length || 0
          })
          this._advertises = this._advertises.map((element) => {
            if (element.id === advertise.id) {
              element.visits = computedVisits
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
        this._unSubscribeActive = onSnapshot(q, async (querySnapshot) => {
          const activeAdvertisePromises = querySnapshot.docs.map(async (doc) => {
            const data = { id: doc.id, ...doc.data(), isAdd: true }
            let user = userStore.getUserById(data.author.id)
            if (!user) {
              user = await userStore.fetchUser(data.author.id)
            }
            data.author = user
            return data
          })
          const activeAdvertises = await Promise.all(activeAdvertisePromises)
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
        await errorStore.throwError(error)
      }

      this._isLoading = false
    },
    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
