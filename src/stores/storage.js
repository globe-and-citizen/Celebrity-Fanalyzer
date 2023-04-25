import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { storage } from 'src/firebase'

export const useStorageStore = defineStore('storage', {
  actions: {
    async uploadArtistPhoto(file, filename) {
      const storageRef = ref(storage, `images/prompt-${filename}-artist`)

      await uploadBytes(storageRef, file)

      return getDownloadURL(storageRef).then((url) => url)
    },

    async uploadArts(files, filename) {
      const arts = []

      for (let index in files) {
        const storageRef = ref(storage, `images/prompt-${filename}-art-${index}`)

        await uploadBytes(storageRef, files[index])

        getDownloadURL(storageRef).then((url) => arts.push(url))
      }
      console.log(arts)

      return arts
    }
  }
})
