import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, onSnapshot, or, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { LocalStorage, Notify } from 'quasar'
import sha1 from 'sha1'
import { auth, db } from 'src/firebase'
import layer8 from 'layer8_interceptor'
import { baseURL } from 'stores/stats'

export const useUserStore = defineStore('user', {
  state: () => ({
    _profileTab: 'profile',
    _user: {},
    _userIp: '',
    _users: undefined,
    _isLoading: false,
    _userLocation: '',
    _statsUsers: undefined
  }),

  persist: true,

  getters: {
    getAdmins: (getters) => getters.getUsers?.filter((user) => user.role === 'Admin') || [],
    getAdminsAndWriters: (getters) => getters.getUsers?.filter((user) => user.role === 'Admin' || user.role === 'Writer') || [],
    getProfileTab: (state) => state._profileTab,
    getSubscriptions: (state) => state._user.subscriptions,
    getUser: (state) => state._user,
    getUserById: (getters) => (id) => getters.getUsers?.find((user) => user.uid === id),
    getUserIp: (state) => state._userIp,
    getUserIpHash: (state) => sha1(state._userIp),
    getUserRef: (getters) => (getters.getUser.uid ? doc(db, 'users', getters.getUser.uid) : undefined),
    getUsers: (state) => state._users,
    isAdmin: (getters) => getters.getUser.role === 'Admin',
    isEditorOrAbove: (getters) => ['Admin', 'Editor'].includes(getters.getUser.role),
    isWriterOrAbove: (getters) => ['Admin', 'Editor', 'Writer'].includes(getters.getUser.role),
    isAdvertiser: (getters) => getters.getUser.role === 'Advertiser',
    isAuthenticated: (getters) => Boolean(getters.getUser?.uid),
    isLoading: (state) => state._isLoading,
    getUserId: (getters) => (getters.isAuthenticated && getters.getUser ? getters.getUser.uid : getters.getUserIpHash),
    getUserLocation: (state) => state._userLocation,
    getAllUsers: (state) => state._statsUsers
  },

  actions: {
    async fetchUser(uid) {
      this._isLoading = true
      return await getDoc(doc(db, 'users', uid))
        .then((document) => {
          return { uid: document.id, ...document.data() }
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchUsers() {
      this._isLoading = true
      onSnapshot(query(collection(db, 'users'), where('role', '!=', 'User')), (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
        this.$patch({ _users: users })
      })
      this._isLoading = false
    },

    async getUserByUidOrUsername(id) {
      this._isLoading = true
      const user = await getDoc(doc(db, 'users', id)).catch((error) => console.error(error))
      if (user.exists()) {
        this._isLoading = false
        return { uid: user.id, ...user.data() }
      }
      return await getDocs(query(collection(db, 'users'), or(where('username', '==', id), where('displayName', '==', id))))
        .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))[0])
        .finally(() => (this._isLoading = false))
    },

    async fetchAdminsAndWriters() {
      this._isLoading = true
      await getDocs(
        query(collection(db, 'users'), or(where('role', '==', 'Admin'), where('role', '==', 'Editor'), where('population', '==', 'Writer')))
      )
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
      this._userIp = ''
      this._userLocation = ''
      await fetch('https://www.cloudflare.com/cdn-cgi/trace')
        .then((res) => res.text())
        .then((text) => {
          text.split('\n').forEach((line) => {
            const [key, value] = line.split('=')
            if (key === 'ip') {
              this._userIp = value
            }
            if (key === 'loc') {
              this._userLocation = value
            }
          })
        })
    },

    async emailSignUp(user) {
      this._isLoading = true
      await createUserWithEmailAndPassword(auth, user.email, user.password)
        .then(async (userCredential) => {
          await setDoc(doc(db, 'users', userCredential.user.uid), { displayName: user.name, email: user.email })
            .then(() => this.emailSignIn(user))
            .then(() => Notify.create({ color: 'positive', message: 'Account created successfully' }))
            .catch((error) => console.error(error))
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            Notify.create({ type: 'negative', message: 'Email already exists' })
          } else {
            Notify.create({ type: 'negative', message: 'Something went wrong, Please try again' })
          }
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
        .catch((error) => console.error(error))
        .finally(() => (this._isLoading = false))
    },

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
      }).finally(() => (this._isLoading = false))
    },

    async updateRole(user) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'users', user.uid), user)
      }).finally(() => (this._isLoading = false))
    },

    logout() {
      signOut(auth).then(() => {
        this.$reset()
        LocalStorage.remove('user')
        try {
          this.router.go(0)
        } catch (e) {
          console.log('Error', e)
        }
      })
    },

    setProfileTab(tab) {
      this.$patch({ _profileTab: tab })
    },

    async addAllUsers(users) {
      await fetch(`${baseURL}/add-all-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(users)
      }).catch((error) => console.log(error))
    },

    async getStatsUsers() {
      const allUsers = await layer8.fetch(`${baseURL}/users`, {
        method: 'GET'
      })
      this._statsUsers = await allUsers.json()
    }
  }
})
