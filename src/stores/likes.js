import { collection, deleteDoc, doc, getCountFromServer, getDoc, setDoc } from "firebase/firestore";
import { defineStore } from 'pinia'
import { db } from '../firebase'
import { useUserStore } from './user'

export const useLikeStore = defineStore('likes', {
  state: () => ({
    _isLoading: false,
    _likes: 0,
    _dislikes: 0
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    getLikes: (state) => state._likes,
    getDislikes: (state) => state._dislikes
  },

  actions: {
    async countPromptLikes(promptId) {
      const likesCollection = collection(db, 'prompts', promptId, 'likes')
      const dislikesCollection = collection(db, 'prompts', promptId, 'dislikes')

      const snapshot = await getCountFromServer(likesCollection)
      const dislikesSnapshot = await getCountFromServer(dislikesCollection)

      return {
        likes: snapshot.data().count,
        dislikes: dislikesSnapshot.data().count
      }
    },

    async likePrompt(promptId) {
      const userStore = useUserStore()

      await userStore.loadBrowserId()

      const docSnap = doc(db, 'prompts', promptId, 'likes', userStore.getBrowserId)
      await setDoc(docSnap, {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })

      // Check if the same browserId exists in dislikes collection. If true, remove the current Dislike from there
      const dislikesSnap= doc(db, 'prompts', promptId, 'dislikes', userStore.getBrowserId)
      const dislikesDoc = await getDoc(dislikesSnap)

      if(dislikesDoc.exists()){
        await deleteDoc(dislikesSnap)
      }
      this._likes++
    },

    async dislikePrompt(promptId) {

      const userStore = useUserStore()

      await userStore.loadBrowserId()

      const docSnap = doc(db, 'prompts', promptId, 'dislikes', userStore.getBrowserId)
      await setDoc(docSnap, {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })

      // Check if the same browserId exists in likes collection. If true, remove the current like from there
      const likesSnap= doc(db, 'prompts', promptId, 'likes', userStore.getBrowserId)
      const likesDoc = await getDoc(likesSnap)

      if(likesDoc.exists()){
        await deleteDoc(likesSnap)
      }
      this._dislikes++
    },

    async removeLikePrompt(promptId) {},

    async countEntryLikes(entryId) {},

    async likeEntry(entryId) {},

    async dislikeEntry(entryId) {},

    async removeLikeEntry(entryId) {}
  }
})
