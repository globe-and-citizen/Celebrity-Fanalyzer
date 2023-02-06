import { doc, getDoc, runTransaction } from '@firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import sha1 from 'sha1'
import { db } from 'src/firebase'
import { useErrorStore } from 'src/stores'

export const useUserStore = defineStore('user', {
  state: () => ({
    _user: {},
    _userIp: '',
    _isLoading: false
  }),

  getters: {
    getUser: (state) => LocalStorage.getItem('user') || state._user,
    getUserIp: (state) => state._userIp,
    getUserIpHash: (state) => sha1(state._userIp),
    getUserRef: (getters) => doc(db, 'users', getters.getUser.uid),
    isAdmin: (getters) => getters.getUser.role === 'admin',
    isAuthenticated: (getters) => !!getters.getUser?.uid,
    isLoading: (state) => state._isLoading
  },
  actions: {
    async fetchUserProfile(user) {
      const errorStore = useErrorStore()

      this._isLoading = true
      await getDoc(doc(db, 'users', user.uid))
        .then((document) =>
          this.$patch({
            _user: { uid: document.id, ...document.data() }
          })
        )
        .catch((error) => errorStore.throwError(error))
        .finally(() => (this._isLoading = false))

      if (this.getUser) {
        LocalStorage.set('user', this._user)
        this.router.go(0)
      }
    },

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

    async updateProfile(user) {
      const errorStore = useErrorStore()

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', this.getUser.uid), { ...user })
      })
        .then(() => {
          this._user.displayName = user.displayName
          this._user.photoURL = user.photoURL
          this._user.bio = user.bio
          LocalStorage.set('user', this._user)
        })
        .catch((error) => errorStore.throwError(error))
        .finally(() => (this._isLoading = false))
    }
  }
})
