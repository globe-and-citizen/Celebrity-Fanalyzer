import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { storage } from 'src/firebase'

export const useStorageStore = defineStore('storage', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    isLoading: (state) => state._isLoading
  },

  actions: {
    async uploadArtistPhoto(file, filename) {
      const storageRef = ref(storage, `images/prompt-${filename}-artist`)

      await uploadBytes(storageRef, file)

      return getDownloadURL(storageRef).then((url) => url)
    },

    async uploadArts(index, file, filename) {
      const storageRef = ref(storage, `images/prompt-${filename}-art-${index}`)

      this._isLoading = true
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(storageRef).then((url) => url)
    }
  }
})
