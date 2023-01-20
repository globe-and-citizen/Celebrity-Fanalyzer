import { collection, deleteDoc, doc, getCountFromServer, getDoc, query, setDoc, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from '../firebase'
import { useUserStore } from './user'
import { calendarDay, calendarWeek } from 'src/utils/date'

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
     * @returns {Promise<void>}
     */
    async fetchPromptStat(promptId, createdAt, startAt, endAd = Date.now()) {
      if (startAt < createdAt) {
        startAt = createdAt
      }
      const _calendarDay = calendarDay(startAt, endAd)
      const _calendarWeek = calendarWeek(startAt, endAd)

      const fetchCalendarData = async (calendar) => {
        const stats = []
        for (let i = 0; i < calendar.length; i++) {
          const date = calendar[i]
          let nextDate
          if (i + 1 < calendar.length) {
            nextDate = calendar[i + 1]
          } else {
            nextDate = new Date().getTime()
          }
          const likesCollection = collection(db, 'prompts', promptId, 'likes')
          const dislikesCollection = collection(db, 'prompts', promptId, 'dislikes')

          const likesQuery_ = query(likesCollection, where('createdAt', '>=', date), where('createdAt', '<', nextDate))
          const likeSnapshot = await getCountFromServer(likesQuery_)

          const dislikesQuery_ = query(dislikesCollection, where('createdAt', '>=', date), where('createdAt', '<', nextDate))
          const dislikesSnapshot = await getCountFromServer(dislikesQuery_)

          const likes = likeSnapshot.data().count
          const dislikes = dislikesSnapshot.data().count
          stats.push({ date, likes, dislikes })
        }
        return stats
      }

      const allStats = [{ date: new Date().getTime(), likes: this._likes, dislikes: this._dislikes }]
      const weekStats = await fetchCalendarData(_calendarWeek)
      const dayStats = await fetchCalendarData(_calendarDay)

      const index = this._promptStat.findIndex((data) => data.promptId === promptId)
      if (index >= 0) {
        this._promptStat[index] = { promptId, dayStats, weekStats, allStats }
      } else {
        this._promptStat.push({ promptId, dayStats, weekStats, allStats })
      }
    },

    async likePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      await setDoc(doc(db, 'prompts', promptId, 'likes', userStore.getUserIp), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._likes++

      // Check if the same browserId exists in dislikes collection. If true, remove the current Dislike from there
      const dislikesRef = doc(db, 'prompts', promptId, 'dislikes', userStore.getUserIp)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes--
      }

      this.countPromptLikes(promptId)
    },

    async dislikePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      await setDoc(doc(db, 'prompts', promptId, 'dislikes', userStore.getUserIp), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._dislikes++

      // Check if the same browserId exists in likes collection. If true, remove the current like from there
      const likesRef = doc(db, 'prompts', promptId, 'likes', userStore.getUserIp)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes--
      }

      this.countPromptLikes(promptId)
    },

    async countEntryLikes(entryId) {
      const likesCollection = collection(db, 'entries', entryId, 'likes')
      const dislikesCollection = collection(db, 'entries', entryId, 'dislikes')

      const snapshot = await getCountFromServer(likesCollection)
      const dislikesSnapshot = await getCountFromServer(dislikesCollection)

      this._likes = snapshot.data().count
      this._dislikes = dislikesSnapshot.data().count

      return {
        likes: this._likes,
        dislikes: this._dislikes
      }
    },

    async likeEntry(entryId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      await setDoc(doc(db, 'entries', entryId, 'likes', userStore.getUserIp), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._likes++

      const dislikesRef = doc(db, 'entries', entryId, 'dislikes', userStore.getUserIp)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes--
      }

      this.countEntryLikes(entryId)
    },

    async dislikeEntry(entryId) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      await setDoc(doc(db, 'entries', entryId, 'dislikes', userStore.getUserIp), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._dislikes++

      const likesRef = doc(db, 'entries', entryId, 'likes', userStore.getUserIp)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes--
      }

      this.countEntryLikes(entryId)
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
