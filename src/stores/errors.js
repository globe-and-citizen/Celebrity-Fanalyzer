import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useErrorStore = defineStore('errors', {
  actions: {
    async throwError(error) {
      const userStore = useUserStore()
      await userStore.fetchUserIp()

      const err = {
        createdAt: Timestamp.fromDate(new Date()),
        error: error.stack,
        user: userStore.isAuthenticated ? userStore.getUserRef : userStore.getUserIp
      }

      await addDoc(collection(db, 'errors'), err)
        .then((res) => console.log('Error stored in database'))
        .catch((e) => console.error(e))
    }
  }
})
