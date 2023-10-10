import { BrowserProvider } from 'ethers'
import { signInAnonymously } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { generateNonce, SiweMessage } from 'siwe'
import { auth, db } from 'src/firebase'
import { useErrorStore, useUserStore } from 'src/stores'

const provider = new BrowserProvider(window.ethereum)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    _address: null,
    _isLoading: false,
    _message: null,
    _signature: null,
    _wallets: null
  }),

  getters: {
    address: (state) => state._address,
    isLoading: (state) => state._isLoading,
    message: (state) => state._message,
    signature: (state) => state._signature,
    wallets: (state) => state._wallets
  },

  actions: {
    onSignInAnonymously() {
      const errorStore = useErrorStore()
      const userStore = useUserStore()

      signInAnonymously(auth)
        .then(async ({ user }) => {
          await this.signInWithEthereum()

          await setDoc(doc(db, 'users', user.uid), { eth: this._address, uid: user.uid })
            .then(() => {
              onSnapshot(doc(db, 'users', user.uid), (doc) => {
                userStore.$patch({ _user: { uid: doc.id, ...doc.data() } })
              })
            })
            .then(() => Notify.create({ color: 'positive', message: 'Account created successfully' }))
            .catch((error) => errorStore.throwError(error, 'Error creating account'))
        })
        .catch((error) => errorStore.throwError(error, 'Error signing in anonymously'))
    },

    connectWallet() {
      provider
        .send('eth_requestAccounts', [])
        .then((res) => (this._wallets = res))
        .then(() => Notify.create({ message: 'Wallet connected', type: 'positive' }))
        .catch(() => console.log('user rejected request'))
    },

    async createSiweMessage(address) {
      const nonce = generateNonce()

      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: '1',
        nonce: nonce
      })

      return message.prepareMessage()
    },

    async signInWithEthereum() {
      this._isLoading = true
      try {
        const signer = await provider.getSigner()

        this._address = signer.address

        this._message = await this.createSiweMessage(this._address)

        this._signature = await signer.signMessage(this._message)

        Notify.create({ message: 'Successfully signed in with Ethereum', type: 'positive' })
      } catch (error) {
        const errorStore = useErrorStore()

        errorStore.throwError(error, 'Error signing in with Ethereum')
      } finally {
        this._isLoading = false
      }
    }
  }
})
