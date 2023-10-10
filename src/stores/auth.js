import { BrowserProvider } from 'ethers'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { generateNonce, SiweMessage } from 'siwe'

const provider = new BrowserProvider(window.ethereum)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    _isLoading: false,
    _message: null,
    _signature: null,
    _wallets: null
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    message: (state) => state._message,
    signature: (state) => state._signature,
    wallets: (state) => state._wallets
  },

  actions: {
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
      const signer = await provider.getSigner()

      this._message = await this.createSiweMessage(signer.address)

      this._signature = await signer.signMessage(this._message)
    }
  }
})
