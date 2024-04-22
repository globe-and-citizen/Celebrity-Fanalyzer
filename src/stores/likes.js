import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useLikeStore = defineStore('likes', {
  state: () => ({
    _likes: undefined,
    _dislikes: undefined,
    _unSubscribeLike: undefined,
    _unSubscribeDislike: undefined,
    _isLoading: false,
    _isLoaded: false
  }),

  persist: true,

  getters: {
    getLikes: (state) => state._likes,
    getDislikes: (state) => state._dislikes
  },

  actions: {
    async getAllLikesDislikes(collectionName, documentId) {
      try {
        this._isLoading = true
        const likesCollection = collection(db, collectionName, documentId, 'likes')
        const dislikesCollection = collection(db, collectionName, documentId, 'dislikes')

        const likesSnapshot = await getDocs(likesCollection)
        this._likes = likesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const dislikesSnapshot = await getDocs(dislikesCollection)
        this._dislikes = dislikesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // if (this._unSubscribeLike || this._unSubscribeDislike) {
        //   this._unSubscribeLike()
        //   this._unSubscribeDislike()
        // }
        // this._unSubscribeLike = onSnapshot(likesCollection, (likesSnapshot) => {
        //   this._likes = likesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        // })
        // this._unSubscribeDislike = onSnapshot(dislikesCollection, (dislikesSnapshot) => {
        //   this._dislikes = dislikesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        // })
      } catch (e) {
        console.error('Error fetching likes/dislikes', e)
      } finally {
        this._isLoading = false
      }
    },

    async addLike(collectionName, documentId) {
      try {
        this._isLoading = true
        const userStore = useUserStore()
        await userStore.fetchUserIp()

        const likesRef = doc(db, collectionName, documentId, 'likes', userStore.getUserId)
        const likesSnap = await getDoc(likesRef)

        const dislikesRef = doc(db, collectionName, documentId, 'dislikes', userStore.getUserId)
        const dislikesSnap = await getDoc(dislikesRef)
        if (dislikesSnap.exists()) {
          await deleteDoc(dislikesRef)
        }

        if (likesSnap.exists()) {
          await deleteDoc(likesRef)
        } else {
          const like = {
            author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
            createdAt: Timestamp.fromDate(new Date())
          }
          await setDoc(likesRef, like)
        }

        await this.getAllLikesDislikes(collectionName, documentId)

        this._isLoading = false
      } catch (error) {
        console.error('Error adding like:', error)
        this._isLoading = false
      }
    },

    async addDislike(collectionName, documentId) {
      try {
        this._isLoading = true
        const userStore = useUserStore()
        await userStore.fetchUserIp()

        const dislikesRef = doc(db, collectionName, documentId, 'dislikes', userStore.getUserId)
        const dislikesSnap = await getDoc(dislikesRef)

        const likesRef = doc(db, collectionName, documentId, 'likes', userStore.getUserId)
        const likesSnap = await getDoc(likesRef)
        if (likesSnap.exists()) {
          await deleteDoc(likesRef)
        }

        if (dislikesSnap.exists()) {
          await deleteDoc(dislikesRef)
        } else {
          const dislike = {
            author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
            createdAt: Timestamp.fromDate(new Date())
          }
          await setDoc(dislikesRef, dislike)
        }

        await this.getAllLikesDislikes(collectionName, documentId)

        this._isLoading = false
      } catch (error) {
        console.error('Error adding dislike:', error)
        this._isLoading = false
      }
    },

    async deleteAllLikesDislikes(collectionName, documentId) {
      this._isLoading = true
      const likesCollection = collection(db, collectionName, documentId, 'likes')
      const dislikesCollection = collection(db, collectionName, documentId, 'dislikes')

      const likesSnapshot = await getDocs(likesCollection)
      const dislikesSnapshot = await getDocs(dislikesCollection)

      likesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })

      dislikesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      this._isLoading = false
    },

    async resetLikes() {
      this._likes = undefined
      this._dislikes = undefined
    }
  }
})
