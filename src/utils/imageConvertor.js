export async function convertImage(imageFile) {
  return new Promise((resolve, reject) => {
    if (!(imageFile instanceof Blob)) {
      const errorMessage = 'Invalid file type. Expected a Blob or File.'
      console.error(errorMessage, imageFile)
      return reject(new Error(errorMessage))
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageDataURL = event?.target?.result
      const img = new Image()
      img.onload = () => {
        const MAX_WIDTH = 2560
        const MAX_HEIGHT = 1440
        let width = img.width
        let height = img.height

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const widthRatio = MAX_WIDTH / width
          const heightRatio = MAX_HEIGHT / height
          const ratio = Math.min(widthRatio, heightRatio)

          width *= ratio
          height *= ratio
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create Blob from canvas'))
            }
          },
          'image/webp',
          0.95
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'))
      }

      img.src = imageDataURL
    }

    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }

    reader.readAsDataURL(imageFile)
  })
}
