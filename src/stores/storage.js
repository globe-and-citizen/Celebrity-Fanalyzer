import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
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
    // TODO: Refactor this to be more generic (prompts, entries and users)
    async uploadFile(file, filename) {
      const storageRef = ref(storage, `images/prompt-${filename}`)

      this._isLoading = true
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(storageRef).then((url) => url)
    },

    async deleteFile(filename) {
      const storageRef = ref(storage, `images/prompt-${filename}`)

      this._isLoading = true
      await deleteObject(storageRef).finally(() => (this._isLoading = false))
    }
  }
})
