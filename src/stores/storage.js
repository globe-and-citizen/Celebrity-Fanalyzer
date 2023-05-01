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
    async uploadFile(file, filePathAndName) {
      const storageRef = ref(storage, filePathAndName)

      this._isLoading = true
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(storageRef).then((url) => url)
    },

    async deleteFile(filePathAndName) {
      const storageRef = ref(storage, filePathAndName)

      this._isLoading = true
      await deleteObject(storageRef).finally(() => (this._isLoading = false))
    }
  }
})
