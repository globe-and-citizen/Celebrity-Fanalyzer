export const waitUntil = (callback, config = {timeout: 5000}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Try To reject after timout
      reject()
    }, config.timeout)
    if (callback()) {
      resolve()
    } else {
      const intervalId = setInterval(() => {
        if (callback()) {
          clearInterval(intervalId)
          resolve()
        }
      }, 1000)
    }
  })
}
