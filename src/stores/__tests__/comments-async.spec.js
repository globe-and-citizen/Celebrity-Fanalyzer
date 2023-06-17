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

  beforeEach(async () => {
    setActivePinia(createPinia())
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

  it('Should fetch async the comment using then', async () => {
    const entryStore = useEntryStore()
    const commentStore = useCommentStore()
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    await waitUntil(()=>{return entryStore.getEntries.length>0})
    firstEntry.value = entryStore.getEntries[0]

    // Step 2: Check the starting number of comments.
    await commentStore.fetchComments('entries', firstEntry.value.id)

    // Example usage
    waitUntil(getCommentLength(commentStore)).then(() => {
      const startingNumberOfComments = commentStore.getComments.length
      expect(startingNumberOfComments).toBeGreaterThan(0)
    })
  })

  /**
   * Better way to use it
   */
  it('Should fetch async the comment using await ', async () => {
    const entryStore = useEntryStore()
    const commentStore = useCommentStore()
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    // Step 2: Check the starting number of comments.
    await commentStore.fetchComments('entries', firstEntry.value.id)

    // Example usage
    await waitUntil(getCommentLength(commentStore))

    const startingNumberOfComments = commentStore.getComments.length
    expect(startingNumberOfComments).toBeGreaterThan(0)
  })
})
