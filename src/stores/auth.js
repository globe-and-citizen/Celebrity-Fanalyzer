import { getAdditionalUserInfo, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { auth, db } from 'src/firebase.js'
import { useUserStore } from 'src/stores/user'

export const useAuthStore = defineStore('auth', {
  actions: {
    async fetchProfile(user) {
      const userStore = useUserStore()
      userStore.fetchUserProfile(user)
    },

    async googleSignIn() {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
        .then(async (result) => {
          const isNewUser = getAdditionalUserInfo(result)?.isNewUser
          const { email, displayName, photoURL, uid } = result.user
          if (isNewUser) {
            await setDoc(doc(db, 'users', uid), { email, displayName, photoURL })
          }
          this.fetchProfile(result.user)
        })
        .catch((error) => {
          throw error.code
        })
    },

    logout() {
      const userStore = useUserStore()
      signOut(auth).then(() => {
        userStore.$reset()
        LocalStorage.remove('user')
        this.router.go(0)
      })
    }
  }
})
