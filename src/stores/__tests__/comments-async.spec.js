import { createPinia, setActivePinia } from 'pinia'
import { useCommentStore, useEntryStore, useUserStore } from 'src/stores'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { waitUntil } from 'src/waitUntil'

function getCommentLength(commentStore) {
  return () => {
    return commentStore.getComments.length > 0
  }
}

describe('Async watcher ', () => {
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
      waitUntil(getCommentLength(commentStore)).then(() => {
        console.log('Comment are fetched')

        const startingNumberOfComments = commentStore.getComments.length
        expect(startingNumberOfComments).toBeGreaterThan(0)
      })
    },
    { timeout: 50000 }
  )
  it(
    'Should fetch async the comment using await ',
    async () => {
      const firstEntry = ref({})
      await entryStore.fetchEntries()
      firstEntry.value = entryStore.getEntries[0]

      // Step 2: Check the starting number of comments.
      await commentStore.fetchComments('entries', firstEntry.value.id)

      // Example usage
      await waitUntil(getCommentLength(commentStore))

      console.log('Comment are fetched')
      const startingNumberOfComments = commentStore.getComments.length
      expect(startingNumberOfComments).toBeGreaterThan(0)
    },
    { timeout: 50000 }
  )

  it(
    'Should fail fetch async the comment using await ',
    async () => {
      const firstEntry = ref({})
      await entryStore.fetchEntries()
      firstEntry.value = entryStore.getEntries[0]

      // Step 2: Check the starting number of comments.
      await commentStore.fetchComments('entries', firstEntry.value.id)

      // Example usage
      await waitUntil(getCommentLength(commentStore)).catch(() => {
        console.log('Desired response is rejected')
        expect(1 + 1).toBe(2)
      })

      expect(commentStore.getComments.length).toBeGreaterThan(0)
    },
    { timeout: 50000 }
  )

  it('user of done callback', () =>
    new Promise(async (resolve, reject) => {
      const firstEntry = ref({})
      await entryStore.fetchEntries()
      firstEntry.value = entryStore.getEntries[0]

      setTimeout(() => {
        // Try To reject after timout
        reject()
      }, 5000)
      if (commentStore.getComments.length > 0) {
        resolve()
      } else {
        const intervalId = setInterval(() => {
          if (commentStore.getComments.length > 0) {
            clearInterval(intervalId)
            resolve()
          }
        }, 1000)
      }
    }))
})
