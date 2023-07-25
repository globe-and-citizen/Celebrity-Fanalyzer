import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {useEntryStore, useLikeStore, useUserStore} from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'
import {createPinia, setActivePinia} from "pinia";

describe('Likes Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())

    // /* Login test@test.com:
    //  * If you will be using only a logged in user to run the tests,
    //  * it makes sense to log in once before running any other code.
    //  * Alternatively, you can run a log in / log out script within
    //  * each "it" block.
    //  */
    // try {
    //   let userObj = {
    //     email: import.meta.env.VITE_TEST_USER,
    //     password: import.meta.env.VITE_TEST_PASSWORD
    //   }
    //   await userStore.emailSignIn(userObj)
    // } catch (error) {
    //   const errorCode = error.code
    //   const errorMessage = error.message
    //   console.log(errorCode, errorMessage)
    // }
    // // In the store user.js, the call to fetch to get the user IP address breaks without this mock. This is a mock to prevent breaking.
    // global.fetch = vi.fn(async () => {
    //   return {
    //     text: () => {
    //       return '255.255.255.255'
    //     }
    //   }
    // })
  })

  it('', async () => {
    const likeStore = useLikeStore()
    const entryStore = useEntryStore()

    await entryStore.fetchEntries()

    await waitUntil(() => {
      return entryStore.getEntries
    })
    expect(likeStore.getLikes).toBe(undefined)
    expect(likeStore.getDislikes).toBe(undefined)
    await likeStore.getAllLikesDislikes('entries', entryStore.getEntries[0].id)

    expect(likeStore.getLikes?.length).not.toBe(undefined)
    expect(likeStore.getDislikes?.length).not.toBe(undefined)
  })
})
