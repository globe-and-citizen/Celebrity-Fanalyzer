import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore'
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import sha1 from 'sha1'
import { auth, db } from 'src/firebase'

export const useUserStore = defineStore('user', {
  state: () => ({
    _user: {},
    _userIp: '',
    _isLoading: false
  }),

  persist: true,

  getters: {
    getUser: (state) => state._user,
    getUserIp: (state) => state._userIp,
    getUserIpHash: (state) => sha1(state._userIp),
    getUserRef: (getters) => doc(db, 'users', getters.getUser.uid),
    isAdmin: (getters) => getters.getUser.role === 'admin',
    isAuthenticated: (getters) => Boolean(getters.getUser?.uid),
    isLoading: (state) => state._isLoading
  },
  actions: {
    /**
     * Fetch the user ip from Cloudflare
     * @SaveState <string> IPV6
     */
    async fetchUserIp() {
      await fetch('https://www.cloudflare.com/cdn-cgi/trace')
        .then((res) => res.text())
        .then((text) => {
          text.split('\n').forEach((line) => {
            const [key, value] = line.split('=')
            if (key === 'ip') {
              this._userIp = value
            }
          })
        })
    },

    async googleSignIn() {
      const provider = new GoogleAuthProvider()

      this._isLoading = true
      await signInWithPopup(auth, provider)
        .then(async (result) => {
          const isNewUser = getAdditionalUserInfo(result)?.isNewUser
          const { email, displayName, photoURL, uid } = result.user

          if (isNewUser) {
            await setDoc(doc(db, 'users', uid), { email, displayName, photoURL })
          }

          await getDoc(doc(db, 'users', result.user.uid)).then((document) => {
            this.$patch({ _user: { uid: document.id, ...document.data() } })
          })
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchUserProfile(user) {
      await getDoc(doc(db, 'users', user.uid)).then((document) => {
        this.$patch({ _user: { uid: document.id, ...document.data() } })
        localStorage.setItem('user', JSON.stringify({ uid: document.id, ...document.data() }))
      })
    },

    async updateProfile(user) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', this.getUser.uid), user)
      })
        .then(() => this.$patch({ _user: { ...this.getUser, ...user } }))
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
