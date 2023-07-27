import { beforeEach, describe, expect, it } from 'vitest'
import { useEntryStore, useLikeStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'
import { createPinia, setActivePinia } from 'pinia'

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

  it('Should Test All Like Store', async () => {
    const likeStore = useLikeStore()
    const entryStore = useEntryStore()

    await entryStore.fetchEntries()

    await waitUntil(() => {
      return entryStore.getEntries
    })
    expect(likeStore.getLikes).toBe(undefined)
    expect(likeStore.getDislikes).toBe(undefined)
    await likeStore.getAllLikesDislikes('entries', entryStore.getEntries[1].id)
    await likeStore.getAllLikesDislikes('entries', entryStore.getEntries[0].id)

    await waitUntil(() => {
      return likeStore.getLikes && likeStore.getDislikes
    })
    expect(likeStore.getLikes).not.toBe(undefined)
    expect(likeStore.getDislikes).not.toBe(undefined)

    const initialLikeLenght = likeStore.getLikes?.length
    const initialDislikeLenght = likeStore.getDislikes?.length

    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    if (initialLikeLenght !== 0 || initialDislikeLenght !== 0) {
      await likeStore.deleteAllLikesDislikes('entries', entryStore.getEntries[0].id)

      await waitUntil(() => {
        return likeStore.getLikes?.length === 0 && likeStore.getDislikes?.length === 0
      }).catch(() => console.log('Initial State'))
      expect(likeStore.getDislikes?.length).toBe(0)
      expect(likeStore.getLikes?.length).toBe(0)
    }

    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    // Should add a like if not exit
    await likeStore.addLike('entries', entryStore.getEntries[0].id)

    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght + 1
    // }).catch(() => console.log('1-First Like'))

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght + 1)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('1')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    // Should remove like if exit
    await likeStore.addLike('entries', entryStore.getEntries[0].id)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght
    // }).catch(() => console.log('2-Second Like'))

    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    // Should add dislike if not exit
    await likeStore.addDislike('entries', entryStore.getEntries[0].id)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght && likeStore.getDislikes?.length === initialDislikeLenght + 1
    // }).catch(() => console.log('3-First Dislike'))

    // After
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    //should remove dislike if exist
    await likeStore.addDislike('entries', entryStore.getEntries[0].id)
    // After
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    // Should add dislike if not exit
    await likeStore.addDislike('entries', entryStore.getEntries[0].id)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght && likeStore.getDislikes?.length === initialDislikeLenght + 1
    // })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    // Should remove dislike after like
    await likeStore.addLike('entries', entryStore.getEntries[0].id)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght + 1 && likeStore.getDislikes?.length === initialDislikeLenght
    // })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('1')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght + 1)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    // Should add like after dislike
    await likeStore.addDislike('entries', entryStore.getEntries[0].id)

    // await waitUntil(() => {
    //   return likeStore.getDislikes?.length === initialDislikeLenght + 1 && likeStore.getLikes?.length === initialLikeLenght
    // })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    await likeStore.deleteAllLikesDislikes('entries', entryStore.getEntries[0].id)

    await waitUntil(() => {
      return likeStore.getLikes?.length === 0 && likeStore.getDislikes?.length === 0
    })
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toBe(0)
    expect(likeStore.getLikes?.length).toBe(0)
  })
})
