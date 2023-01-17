import { collection, deleteDoc, doc, getCountFromServer, getDoc, query, setDoc, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from '../firebase'
import { useUserStore } from './user'
import { calendarDay, calendarWeek } from "src/utils/date";

export const useLikeStore = defineStore('likes', {
  state: () => ({
    _isLoading: false,
    _likes: 0,
    _dislikes: 0,
    _promptStat: []
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

      this._likes = snapshot.data().count
      this._dislikes = dislikesSnapshot.data().count

      return {
        likes: this._likes,
        dislikes: this._dislikes
      }
    },

    /**
     *
     * @param promptId
     * @param createdAt
     * @param startAt Start Date
     * @param endAd  End Date
     * @param format  type of data : day, week, month
     * @returns {Promise<void>}
     */
    async fetchPromptStat(promptId, createdAt, startAt, endAd = Date.now(), format = 'date') {
      if (startAt < createdAt) {
        startAt = createdAt
      }
      let calendar
      switch (format){
        case 'date' :
           calendar = calendarDay(startAt, endAd)
          break;
        case 'week' :
           calendar = calendarWeek(startAt, endAd)
          break;
        case 'month' :
          break;
        default:
          calendar = calendarDay(startAt, endAd)
      }
      const stats = []
      for(let i=0; i<calendar.length; i++){
        const date= calendar[i]
        let nextDate
        if(i+1<calendar.length){
          nextDate= calendar[i+1]
        }else {
          nextDate = new Date()
        }
        const likesCollection = collection(db, 'prompts', promptId, 'likes')
        const dislikesCollection = collection(db, 'prompts', promptId, 'dislikes')

        const likesQuery_ = query(likesCollection, where('createdAt', '>=', date), where('createdAt', '<=', nextDate))
        const likeSnapshot = await getCountFromServer(likesQuery_)

        const dislikesQuery_ = query(dislikesCollection, where('createdAt', '>=', date), where('createdAt', '<=', nextDate))
        const dislikesSnapshot = await getCountFromServer(dislikesQuery_)

        const likes = likeSnapshot.data().count
        const dislikes = dislikesSnapshot.data().count
        stats.push({ date, likes, dislikes })
      }
      const index = this._promptStat.findIndex((data)=>data.promptId===promptId)
      if(index>=0){
        this._promptStat[index]= {promptId, stats}
      }else {
        this._promptStat.push({promptId, stats, format})
      }
    },

    async likePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      await setDoc(doc(db, 'prompts', promptId, 'likes', userStore.getBrowserId), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._likes++

      // Check if the same browserId exists in dislikes collection. If true, remove the current Dislike from there
      const dislikesRef = doc(db, 'prompts', promptId, 'dislikes', userStore.getBrowserId)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes--
      }

      this.countPromptLikes(promptId)
    },

    async dislikePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      await setDoc(doc(db, 'prompts', promptId, 'dislikes', userStore.getBrowserId), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._dislikes++

      // Check if the same browserId exists in likes collection. If true, remove the current like from there
      const likesRef = doc(db, 'prompts', promptId, 'likes', userStore.getBrowserId)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes--
      }

      this.countPromptLikes(promptId)
    },

    async removeLikePrompt(promptId) {},

    async countEntryLikes(entryId) {},

    async likeEntry(entryId) {},

    async dislikeEntry(entryId) {},

    async removeLikeEntry(entryId) {}
  }
})
