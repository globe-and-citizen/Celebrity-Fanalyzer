export function processFile(file) {
  if (!file) {
    return
  }

  // Load the data into an image
  new Promise(function (resolve, reject) {
    let rawImage = new Image()

    rawImage.addEventListener('load', function () {
      resolve(rawImage)
    })

    rawImage.src = URL.createObjectURL(file)
  })
    .then(function (rawImage) {
      // Convert image to webp ObjectURL via a canvas blob
      return new Promise(function (resolve, reject) {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')

        canvas.width = rawImage.width
        canvas.height = rawImage.height
        ctx.drawImage(rawImage, 0, 0)

        canvas.toBlob(function (blob) {
          resolve(URL.createObjectURL(blob))
        }, 'image/webp')
      })
    })
    .then(function (imageURL) {
      // Load image for display on the page
      return new Promise(function (resolve, reject) {
        let scaledImg = new Image()

        scaledImg.addEventListener('load', function () {
          resolve({ imageURL, scaledImg })
        })

        scaledImg.setAttribute('src', imageURL)
      })
    })
    .then(function (data) {
      // Inject into the DOM
      let imageLink = document.createElement('a')

      imageLink.setAttribute('href', data.imageURL)
      imageLink.setAttribute('download', `${file.name}.webp`)
      imageLink.appendChild(data.scaledImg)

      imageBox.innerHTML = ''
      imageBox.appendChild(imageLink)
    })
}
