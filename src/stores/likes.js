import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import { baseURL } from 'stores/stats'
import { mock_layer8_interceptor } from 'mock_layer8_module'

const pushLikeToStats = async (user_id, article_id, topic_id, isLike, ad_id) =>
  await mock_layer8_interceptor
    .fetch(`${baseURL}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id, article_id, topic_id, isLike, ad_id })
    })
    .then((res) => res.json())
    .catch((err) => console.log(err))

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
      this._isLoading = true
      const likesCollection = collection(db, collectionName, documentId, 'likes')
      const dislikesCollection = collection(db, collectionName, documentId, 'dislikes')

      if (this._unSubscribeLike || this._unSubscribeDislike) {
        this._unSubscribeLike()
        this._unSubscribeDislike()
      }
      this._unSubscribeLike = onSnapshot(likesCollection, (likesSnapshot) => {
        this._likes = likesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
      this._unSubscribeDislike = onSnapshot(dislikesCollection, (dislikesSnapshot) => {
        this._dislikes = dislikesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
      this._isLoading = false
    },

    async addLike(collectionName, documentId, article_id, topic_id, ad_id, isTest = false) {
      try {
        this._isLoading = true
        const userStore = useUserStore()
        const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash

        const likesRef = doc(db, collectionName, documentId, 'likes', userStore.getUserId)
        const likesSnap = await getDoc(likesRef)

        const dislikesRef = doc(db, collectionName, documentId, 'dislikes', userStore.getUserId)
        const dislikesSnap = await getDoc(dislikesRef)
        if (dislikesSnap.exists()) {
          await deleteDoc(dislikesRef)
        }

        if (likesSnap.exists()) {
          await deleteDoc(likesRef)
          if (!isTest) {
            await pushLikeToStats(user_id, article_id, topic_id, null, ad_id)
          }
        } else {
          const like = {
            author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
            createdAt: Timestamp.fromDate(new Date())
          }
          await setDoc(likesRef, like)
          if (!isTest) {
            await pushLikeToStats(user_id, article_id, topic_id, true, ad_id)
          }
        }

        await this.getAllLikesDislikes(collectionName, documentId)

        this._isLoading = false
      } catch (error) {
        console.error('Error adding like:', error)
        this._isLoading = false
      }
    },

    async addDislike(collectionName, documentId, article_id, topic_id, ad_id, isTest = false) {
      try {
        this._isLoading = true
        const userStore = useUserStore()
        const user_id = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash

        const dislikesRef = doc(db, collectionName, documentId, 'dislikes', userStore.getUserId)
        const dislikesSnap = await getDoc(dislikesRef)

        const likesRef = doc(db, collectionName, documentId, 'likes', userStore.getUserId)
        const likesSnap = await getDoc(likesRef)
        if (likesSnap.exists()) {
          await deleteDoc(likesRef)
        }

        if (dislikesSnap.exists()) {
          await deleteDoc(dislikesRef)
          if (!isTest) {
            await pushLikeToStats(user_id, article_id, topic_id, null, ad_id)
          }
        } else {
          const dislike = {
            author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
            createdAt: Timestamp.fromDate(new Date())
          }
          await setDoc(dislikesRef, dislike)
          if (!isTest) {
            await pushLikeToStats(user_id, article_id, topic_id, false, ad_id)
          }
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
    }
  }
})
