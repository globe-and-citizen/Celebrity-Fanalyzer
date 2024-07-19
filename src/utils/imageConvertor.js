import { useStorageStore, useErrorStore } from 'src/stores'

export async function uploadAndSetImage(imageFile, filePathAndName) {
  const storageStore = useStorageStore()
  const errorStore = useErrorStore()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      const imageDataURL = event?.target?.result
      const img = new Image()

      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width > 2560 ? img.width / 2 : img.width
        canvas.height = img.height > 1440 ? img.height / 2 : img.height
        ctx.drawImage(img, 0, 0, img.width > 2560 ? img.width / 2 : img.width, img.height > 1440 ? img.height / 2 : img.height)

        canvas.toBlob(async (blob) => {
          try {
            const imageUrl = await storageStore.uploadFile(blob, filePathAndName)
            resolve(imageUrl)
          } catch (error) {
            await errorStore.throwError(error, 'Image upload failed')
            reject(error)
          }
        }, 'image/webp')
      }
      img.src = imageDataURL
    }

    reader.readAsDataURL(imageFile)
  })
}
