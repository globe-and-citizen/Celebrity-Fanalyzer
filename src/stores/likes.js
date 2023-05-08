import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useLikeStore = defineStore('likes', {
  state: () => ({
    _likes: [],
    _dislikes: [],
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
      this._isLoading = true
      const likesCollection = collection(db, collectionName, documentId, 'likes')
      const dislikesCollection = collection(db, collectionName, documentId, 'dislikes')

      const likesSnapshot = await getDocs(likesCollection)
      const dislikesSnapshot = await getDocs(dislikesCollection)

      this._likes = likesSnapshot.docs.map((doc) => doc.data())
      this._dislikes = dislikesSnapshot.docs.map((doc) => doc.data())

      this._isLoading = false
      this._isLoaded = true
    },

    async addLike(collectionName, documentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp

      const likesRef = doc(db, collectionName, documentId, 'likes', docId)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes.pop()
      } else {
        const like = {
          author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
          createdAt: Timestamp.fromDate(new Date())
        }

        await setDoc(likesRef, like).then(() => this._likes.push(like))
      }

      const dislikesRef = doc(db, collectionName, documentId, 'dislikes', docId)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes.pop()
      }

      this.getAllLikesDislikes(collectionName, documentId)
    },

    async addDislike(collectionName, documentId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp

      const dislikesRef = doc(db, collectionName, documentId, 'dislikes', docId)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes.pop()
      } else {
        const dislike = {
          author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
          createdAt: Timestamp.fromDate(new Date())
        }

        await setDoc(dislikesRef, dislike).then(() => this._dislikes.push(dislike))
      }
      const likesRef = doc(db, collectionName, documentId, 'likes', docId)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes.pop()
      }

      this.getAllLikesDislikes(collectionName, documentId)
    },

    async deleteAllLikesDislikes(collectionName, documentId) {
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
    }
  }
})
