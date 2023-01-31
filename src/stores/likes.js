import { collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from '../firebase'
import { useUserStore } from './user'
export const useLikeStore = defineStore('likes', {
  state: () => ({
    _likes: [],
    _dislikes: []
  }),

  persist: true,

  getters: {
    getLikes: (state) => state._likes,
    getDislikes: (state) => state._dislikes
  },

  actions: {
    async getAllPromptLikesDislikes(promptId) {
      const likesCollection = collection(db, 'prompts', promptId, 'likes')
      const dislikesCollection = collection(db, 'prompts', promptId, 'dislikes')

      const likesSnapshot = await getDocs(likesCollection)
      const dislikesSnapshot = await getDocs(dislikesCollection)

      this._likes = likesSnapshot.docs.map((doc) => doc.data())
      this._dislikes = dislikesSnapshot.docs.map((doc) => doc.data())
    },

    async getAllEntryLikesDislikes(entryId) {
      const likesCollection = collection(db, 'entries', entryId, 'likes')
      const dislikesCollection = collection(db, 'entries', entryId, 'dislikes')

      const likesSnapshot = await getDocs(likesCollection)
      const dislikesSnapshot = await getDocs(dislikesCollection)

      this._likes = likesSnapshot.docs.map((doc) => doc.data())
      this._dislikes = dislikesSnapshot.docs.map((doc) => doc.data())
    },

    async likePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp
      const like = {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date())
      }

      await setDoc(doc(db, 'prompts', promptId, 'likes', docId), like)
        .then(() => {
          this._likes.push(like)
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })

      const dislikesRef = doc(db, 'prompts', promptId, 'dislikes', docId)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes.pop()
      }

      this.getAllPromptLikesDislikes(promptId)
    },

    async dislikePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp
      const dislike = {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date())
      }

      await setDoc(doc(db, 'prompts', promptId, 'dislikes', docId), dislike).then(() => {
        this._dislikes.push(dislike)
      })

      const likesRef = doc(db, 'prompts', promptId, 'likes', docId)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes.pop()
      }

      this.getAllPromptLikesDislikes(promptId)
    },

    async likeEntry(entryId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp
      const like = {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date())
      }

      await setDoc(doc(db, 'entries', entryId, 'likes', docId), like)

      this._likes.push(like)

      const dislikesRef = doc(db, 'entries', entryId, 'dislikes', docId)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes.pop()
      }

      this.getAllEntryLikesDislikes(entryId)
    },

    async dislikeEntry(entryId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const docId = userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp
      const dislike = {
        author: userStore.isAuthenticated ? userStore.getUserRef : 'Anonymous',
        createdAt: Timestamp.fromDate(new Date())
      }

      await setDoc(doc(db, 'entries', entryId, 'dislikes', docId), dislike)

      this._dislikes.push(dislike)

      const likesRef = doc(db, 'entries', entryId, 'likes', docId)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes.pop()
      }

      this.getAllEntryLikesDislikes(entryId)
    },

    async deleteAllPromptLikes(promptId) {
      const likesCollection = collection(db, 'prompts', promptId, 'likes')
      const dislikesCollection = collection(db, 'prompts', promptId, 'dislikes')

      const likesSnapshot = await getDocs(likesCollection)
      const dislikesSnapshot = await getDocs(dislikesCollection)

      likesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })

      dislikesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
    },

    async deleteAllEntryLikes(entryId) {
      const likesCollection = collection(db, 'entries', entryId, 'likes')
      const dislikesCollection = collection(db, 'entries', entryId, 'dislikes')

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
