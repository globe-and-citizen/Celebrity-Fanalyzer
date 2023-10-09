import { defineStore } from 'pinia'
import { SiweMessage } from 'siwe'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    isLoading: (state) => state._isLoading
  },

  actions: {
    async signInWithEthereum(address) {
      const message = new SiweMessage({
        domain: 'localhost:8080',
        address: address,
        statement: 'This is a test statement',
        uri: 'http://localhost:8080',
        version: '1',
        chainId: '1'
      })

      const siweMessage = message.prepareMessage()

      console.log(siweMessage)
    }
  }
})
