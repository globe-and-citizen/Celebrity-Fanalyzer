import { doc, getDoc, runTransaction } from '@firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'
import sha1 from 'sha1'

export const useUserStore = defineStore('user', {
  state: () => ({
    _user: {},
    _isLoading: false,
    _browserId: ''
  }),

  getters: {
    // TODO: fix this, get shoul only return the valu in the store, if we need to use the storage, we should use it to update the store
    getUser: (state) => LocalStorage.getItem('user') || state._user,
    getUserRef: (getters) => doc(db, 'users', getters.getUser.uid),
    isAdmin: (getters) => getters.getUser.role === 'admin',
    isAuthenticated: (getters) => !!getters.getUser?.uid,
    isLoading: (state) => state._isLoading,
    getBrowserId: (state) => state._browserId
  },
  actions: {
    async fetchUserProfile(user) {
      this._isLoading = true
      await getDoc(doc(db, 'users', user.uid))
        .then((document) =>
          this.$patch({
            _user: { uid: document.id, ...document.data() }
          })
        )
        .catch((error) => {
          throw error
        })
        .finally(() => (this._isLoading = false))

      if (this.getUser) {
        LocalStorage.set('user', this._user)
        this.router.go(0)
      }
    },
    /**
     * Create and store a unique Browser id in the storage and in the store
     * @returns {Promise<void>}
     */
    async loadBrowserId() {
      if (this.isAuthenticated && this._browserId !== this.getUser.uid) {
        this._browserId = this.getUser.uid
        LocalStorage.set('browserId', this._browserId)
      } else if (!this.getUser || !this.getUser.uid) {
        // Create the new browser id or use the localStorage browserId
        const storageBrowserId = LocalStorage.getItem('browserId')
        if (storageBrowserId) {
          this._browserId = storageBrowserId
        } else {
          this._browserId = sha1(Math.random(), Date.now())
          LocalStorage.set('browserId', this._browserId)
        }
      }
    },

    async updateProfile(user) {
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
        .catch((error) => {
          throw error
        })
        .finally(() => (this._isLoading = false))
    }
  }
})
