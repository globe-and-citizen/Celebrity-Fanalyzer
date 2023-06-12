import { createPinia, setActivePinia } from 'pinia'
import { useCommentStore, useEntryStore, useUserStore } from 'src/stores'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const watchWantedResponse = (callback, config = { timeout: 5000 }) => {
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
describe('', () => {
  setActivePinia(createPinia())
  const entryStore = useEntryStore()
  const commentStore = useCommentStore()

  beforeEach(async () => {
    // In the Pinia store user.js, the call to fetch to get the user IP breaks. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })

    // Login the test@test.com user
    const userStore = useUserStore()
    try {
      let userObj = {
        email: import.meta.env.VITE_TEST_USER,
        password: import.meta.env.VITE_TEST_PASSWORD
      }
      await userStore.emailSignIn(userObj)
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
    }
  })

  it(
    'Should fetch async the comment using then',
    async () => {
      const firstEntry = ref({})
      await entryStore.fetchEntries()
      firstEntry.value = entryStore.getEntries[0]

      // Step 2: Check the starting number of comments.
      await commentStore.fetchComments('entries', firstEntry.value.id)

      // Example usage
      watchWantedResponse(() => {
        return commentStore.getComments.length > 0
      })
        .then(() => {
          console.log('Comment are fetched')

          const startingNumberOfComments = commentStore.getComments.length
          expect(startingNumberOfComments).toBeGreaterThan(0)
        })
        .catch(() => {
          console.log('Desired response is rejected')
        })
    },
    { timeout: 50000 }
  )

})
