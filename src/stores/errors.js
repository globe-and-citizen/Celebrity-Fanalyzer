import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from './user'

export const useErrorStore = defineStore('errors', {
  actions: {
    async throwError(error) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const err = {
        createdAt: Timestamp.fromDate(new Date()),
        error,
        user: userStore.isAuthenticated ? userStore.getUserRef.id : userStore.getUserIp
      }

      await setDoc(doc(db, 'errors', Date.now()), err)

      console.error(error)
      throw error.code
    }
  }
})
