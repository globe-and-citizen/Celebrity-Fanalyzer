import { getAdditionalUserInfo, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { auth, db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    isLoading: (state) => state._isLoading
  },

  actions: {
    async googleSignIn() {
      const userStore = useUserStore()
      const provider = new GoogleAuthProvider()

      this._isLoading = true
      await signInWithPopup(auth, provider)
        .then(async (result) => {
          const isNewUser = getAdditionalUserInfo(result)?.isNewUser
          const { email, displayName, photoURL, uid } = result.user
          if (isNewUser) {
            await setDoc(doc(db, 'users', uid), { email, displayName, photoURL })
          }
          await userStore.fetchUserProfile(result.user)
        })
        .finally(() => (this._isLoading = false))
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
