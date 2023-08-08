export const waitUntil = (callback, timeout=5000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!callback()) {
        reject("waitUntil Timeout after" + timeout)
        console.log("waitUntil Timeout after" + timeout)
        console.log("Try to increase you default timeout")
      }
    }, timeout)
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
