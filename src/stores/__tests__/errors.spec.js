//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import fs from 'fs'
import { useErrorStore, useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'
import { reactive } from 'vue'

//Load an image to use

describe('Errors Store', async () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    const userStore = useUserStore()

    // In the store user.js, the call to fetch to get the user IP address breaks without this mock. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return 'ip=255.255.255.255'
        }
      }
    })
  })

  it('Should test for unauthenticated ', async () => {
    const errorStore = useErrorStore()
    const userStore = useUserStore()
    /* Login test@test.com:
     * If you will be using only a logged in user to run the tests,
     * it makes sense to log in once before running any other code.
     * Alternatively, you can run a log in / log out script within
     * each "it" block.
     */
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
    expect(errorStore.isLoaded).toBe(false)
    // 1) Load entries & prompts into the store
    await errorStore.fetchErrors()
    await waitUntil(() => {
      return errorStore.getErrors
    }).catch((e)=>{
      console.log("errorStore.getErrors", e)
    })
    const initialLength=errorStore.getErrors.length
    try{
      throw new Error('Error number')
    } catch (e){
      await errorStore.throwError(e)
    }
    await waitUntil(() => {
      return errorStore.getErrors?.length > initialLength
    }).catch((e)=>{
      console.log("errorStore.getErrors?.length > initialLength", e)
    })

    expect(errorStore.getErrors.length).toBeGreaterThan(initialLength)
    await errorStore.deleteError(errorStore.getErrors[0].id)
    await waitUntil(() => {
      return errorStore.isLoading === initialLength
    }).catch((e)=>{
      console.log("errorStore.getErrors?.length === initialLength", e)
    })
    expect(errorStore.isLoading).toBe(false)
    expect(errorStore.getErrors.length).toBe(initialLength)

  })
})

afterAll(async () => {
  // clean up logic.
})
