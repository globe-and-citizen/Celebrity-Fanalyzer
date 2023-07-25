export const waitUntil = (callback) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!callback()) {
        reject()
      }
    }, 5000)
    if (callback()) {
      resolve()
    } else {
      const intervalId = setInterval(() => {
        if (callback()) {
          clearInterval(intervalId)
          resolve()
        }
      }, 10)
    }
  })
}
