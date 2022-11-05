import { doc, getDoc, runTransaction } from '@firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db } from 'src/firebase'

export const useUserStore = defineStore('user', {
  state: () => ({
    _user: LocalStorage.getItem('user') || {}
  }),

  getters: {
    getUser: (state) => state._user,
    isAdmin: (state) => state._user.role === 'admin',
    isAuthenticated: (state) => !!state._user?.uid
  },

  actions: {
    async fetchUserProfile(user) {
      await getDoc(doc(db, 'users', user.uid))
        .then((document) =>
          this.$patch({
            _user: { uid: document.id, ...document.data() }
          })
        )
        .catch((error) => {
          throw error
        })

      if (this.getUser) {
        LocalStorage.set('user', this._user)
        this.router.go(0)
      }
    },

    async updateProfile(user) {
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
    }
  }
})
