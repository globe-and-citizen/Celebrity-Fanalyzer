import { auth, db } from 'src/firebase'
import router from 'src/router'
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from '@firebase/auth'
import { collection, doc, getDoc, getDocs, runTransaction, updateDoc } from '@firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useUserStore = defineStore('user', {
  state: () => ({
    _user: LocalStorage.getItem('user') || {}
  }),

  getters: {
    getUser: (state) => state._user,
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

    async checkEmail(email) {
      const users = await getDocs(collection(db, 'users'))

      const emails = users.docs.map((document) => document.data().email)

      return Boolean(emails.includes(email))
    },

    async checkUsername(username) {
      const users = await getDocs(collection(db, 'users'))

      const usernames = users.docs.map((document) => document.data().username.toLowerCase())

      return Boolean(usernames.includes(username.toLowerCase()))
    },

    async updateAccount(credentials) {
      const user = auth.currentUser
      const credential = EmailAuthProvider.credential(this.getUser.email, credentials.password)

      if (!user) return

      await reauthenticateWithCredential(user, credential)
        .then(async () => {
          await updateDoc(doc(db, 'users', this.getUser.uid), { email: credentials.email })
          updateEmail(user, credentials.email)
            .then(() => {
              this.$patch({ _user: { email: credentials.email } })
              LocalStorage.set('user', this._user)
            })
            .catch((error) => {
              throw error.code
            })
          updatePassword(user, credentials.newPass)
        })
        .catch((error) => {
          throw error.code
        })
    },

    async updateProfile(user) {
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', this.getUser.uid), { ...user })
      })
        .then(() => {
          this._user.displayName = user.displayName
          this._user.username = user.username
        })
        .catch((error) => {
          throw error.code
        })
    }
  }
})
