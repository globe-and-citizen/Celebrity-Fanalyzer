import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  or,
  query,
  runTransaction,
  setDoc,
  where
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import sha1 from 'sha1'
import { auth, db } from 'src/firebase'
import { useEntryStore } from './entries'
import { usePromptStore } from './prompts'

export const useUserStore = defineStore('user', {
  state: () => ({
    _profileTab: 'profile',
    _user: {},
    _userIp: '',
    _users: [],
    _isLoading: false
  }),

  persist: true,

  getters: {
    getAdmins: (getters) => getters.getUsers.filter((user) => user.role === 'Admin'),
    getAdminsAndWriters: (getters) => getters.getUsers.filter((user) => user.role === 'Admin' || user.role === 'Writer'),
    getProfileTab: (state) => state._profileTab,
    getUser: (state) => state._user,
    getUserById: (getters) => (id) => getters.getUsers.find((user) => user.uid === id),
    getUserIp: (state) => state._userIp,
    getUserIpHash: (state) => sha1(state._userIp),
    getUserRef: (getters) => doc(db, 'users', getters.getUser.uid),
    getUsers: (state) => state._users,
    getWriters: (getters) => getters.getUsers.filter((user) => user.role === 'Writer'),
    isAdmin: (getters) => getters.getUser.role === 'Admin',
    isAdminOrWriter: (getters) => getters.getUser.role === 'Admin' || getters.getUser.role === 'Writer',
    isAnonymous: (getters) => getters.getUser.isAnonymous,
    isAuthenticated: (getters) => Boolean(getters.getUser?.uid),
    isLoading: (state) => state._isLoading,
    isWriter: (getters) => getters.getUser.role === 'Writer'
  },

  actions: {
    async fetchUsers() {
      this._isLoading = true
      await getDocs(collection(db, 'users'))
        .then((querySnapshot) => {
          const users = querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
          this.$patch({ _users: users })
        })
        .finally(() => (this._isLoading = false))
    },

    async getUserByUidOrUsername(id) {
      this._isLoading = true
      return await getDocs(query(collection(db, 'users'), or(where('uid', '==', id), where('username', '==', id))))
        .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))[0])
        .finally(() => (this._isLoading = false))
    },

    async fetchAdminsAndWriters() {
      this._isLoading = true
      await getDocs(query(collection(db, 'users'), or(where('role', '==', 'Admin'), where('population', '==', 'Writer'))))
        .then((querySnapshot) => {
          const users = querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
          this.$patch({ _users: users })
        })
        .finally(() => (this._isLoading = false))
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

    async emailSignUp(user) {
      this._isLoading = true
      await createUserWithEmailAndPassword(auth, user.email, user.password)
        .then(async (userCredential) => {
          await setDoc(doc(db, 'users', userCredential.user.uid), { displayName: user.displayName, email: user.email })
        })
        .finally(() => (this._isLoading = false))
    },

    async emailSignIn(user) {
      this.$reset()
      LocalStorage.remove('user')
      this._isLoading = true
      await signInWithEmailAndPassword(auth, user.email, user.password)
        .then(async (result) => {
          onSnapshot(doc(db, 'users', result.user.uid), (doc) => {
            this.$patch({ _user: { uid: doc.id, ...doc.data() } })
          })
        })
        .finally(() => (this._isLoading = false))
    },

    // async anonymousSignIn() {
    //   this._isLoading = true
    //   await signInAnonymously(auth)
    //     .catch((error) => console.error(error))
    //     .finally(() => (this._isLoading = false))

    //   onAuthStateChanged(auth, (user) => (this._user = user))
    // },

    async googleSignIn() {
      this.$reset()
      const provider = new GoogleAuthProvider()

      this._isLoading = true
      await signInWithPopup(auth, provider)
        .then(async (result) => {
          const isNewUser = getAdditionalUserInfo(result)?.isNewUser
          const { email, displayName, photoURL, uid } = result.user

          if (isNewUser) {
            await setDoc(doc(db, 'users', uid), { email, displayName, photoURL })
          }

          onSnapshot(doc(db, 'users', result.user.uid), (doc) => {
            this.$patch({ _user: { uid: doc.id, ...doc.data() } })
          })
        })
        .finally(() => (this._isLoading = false))
    },

    async toggleSubscription(collectionName, documentId) {
      const promptStore = usePromptStore()
      const entryStore = useEntryStore()

      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        if (this.getUser.subscriptions?.includes(documentId)) {
          transaction.update(doc(db, collectionName, documentId), { subscribers: arrayRemove(this.getUser.uid) })
          transaction.update(this.getUserRef, { subscriptions: arrayRemove(documentId) })
          this._user.subscriptions = this.getUser.subscriptions.filter((id) => id !== documentId)
          if (collectionName === 'prompts') {
            promptStore._prompts = promptStore.getPrompts.map((prompt) => {
              if (prompt.id === documentId) {
                prompt.subscribers = prompt.subscribers.filter((id) => id !== this.getUser.uid)
              }
              return prompt
            })
          }
          if (collectionName === 'entries') {
            entryStore._entries = entryStore.getEntries.map((entry) => {
              if (entry.id === documentId) {
                entry.subscribers = entry.subscribers.filter((id) => id !== this.getUser.uid)
              }
              return entry
            })
          }
        } else {
          transaction.update(doc(db, collectionName, documentId), { subscribers: arrayUnion(this.getUser.uid) })
          transaction.update(this.getUserRef, { subscriptions: arrayUnion(documentId) })
          this._user.subscriptions = [...this.getUser.subscriptions, documentId]
          if (collectionName === 'prompts') {
            promptStore._prompts = promptStore.getPrompts.map((prompt) => {
              if (prompt.id === documentId) {
                prompt.subscribers = [...prompt.subscribers, this.getUser.uid]
              }
              return prompt
            })
          }
          if (collectionName === 'entries') {
            entryStore._entries = entryStore.getEntries.map((entry) => {
              if (entry.id === documentId) {
                entry.subscribers = [...entry.subscribers, this.getUser.uid]
              }
              return entry
            })
          }
        }
      }).finally(() => (this._isLoading = false))
    },

    async checkUsernameAvailability(username) {
      this._isLoading = true
      return await getDocs(query(collection(db, 'users'), where('uid', '!=', this.getUser.uid)))
        .then((querySnapshot) => {
          const usernames = querySnapshot.docs.map((document) => document.data().username)
          return usernames.some((name) => name?.toLowerCase() === username?.toLowerCase())
        })
        .finally(() => (this._isLoading = false))
    },

    async updateProfile(user) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', this.getUser.uid), user)
      })
        .then(() => this.$patch({ _user: { ...this.getUser, ...user } }))
        .finally(() => (this._isLoading = false))
    },

    async updateRole(user) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', user.uid), user)
      })
        .then(() => {
          const users = this.getUsers
          const index = users.findIndex((u) => u.uid === user.uid)
          users[index].role = user.role
          this.$patch({ _users: users })
        })
        .finally(() => (this._isLoading = false))
    },

    logout() {
      signOut(auth).then(() => {
        this.$reset()
        LocalStorage.remove('user')
        this.router.go(0)
      })
    },

    setProfileTab(tab) {
      this.$patch({ _profileTab: tab })
    },

    async testing_loadUserProfile(user) {
      await getDoc(doc(db, 'users', user.uid)).then((document) => {
        this.$patch({ _user: { uid: document.id, ...document.data() } })
        localStorage.setItem('user', JSON.stringify({ uid: document.id, ...document.data() }))
      })
    }
  }
})
