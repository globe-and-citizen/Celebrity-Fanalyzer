import { defineStore } from 'pinia'
import { generateNonce, SiweMessage } from 'siwe'

const provider = new BrowserProvider(window.ethereum)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    isLoading: (state) => state._isLoading
  },

  actions: {
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

      console.log(siweMessage)
    }
  }
})
