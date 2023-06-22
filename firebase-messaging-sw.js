import { getToken } from 'firebase/messaging'
import { messaging } from './src/firebase'

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.

getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
  .then((currentToken) => {
    if (currentToken) {
      console.log('currentToken', currentToken)
    } else {
      console.log('No registration token available. Request permission to generate one.')
    }
  })
  .catch((err) => {
    console.log('An error occurred while retrieving token. ', err)
  })
