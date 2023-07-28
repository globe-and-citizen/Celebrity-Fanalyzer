import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useEntryStore, useLikeStore, useUserStore} from 'src/stores'
import {waitUntil} from 'src/utils/waitUntil'
import {createPinia, setActivePinia} from 'pinia'

describe('Likes Store', async () => {
  beforeEach(async () => {
    setActivePinia(createPinia())

    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return 'ip=255.255.255.255'
        }
      }
    })
  })
  it('', async () => {

    const userStore = useUserStore()
      // Part 1: Authenticate user
      // Login the test@test.com user
      let userObj = {
        email: import.meta.env.VITE_TEST_USER,
        password: import.meta.env.VITE_TEST_PASSWORD
      }
      try {

        await userStore.emailSignIn(userObj)
        // wait the user to be authenticated
        await waitUntil(() => {
          return userStore.isAuthenticated
        }).catch((e) => console.log('Error : Should be authenticated', e))

      } catch (e) {
        console.log('Error Mean User does not exist', e)
      }
    }
  )

  it.only('Should Test All Like Store', async () => {
    const userStore = useUserStore()
    const likeStore = useLikeStore()
    const entryStore = useEntryStore()

    await entryStore.fetchEntries()

    await waitUntil(() => {
      return entryStore.getEntries
    })
    expect(likeStore.getLikes).toBe(undefined)
    expect(likeStore.getDislikes).toBe(undefined)
    await likeStore.getAllLikesDislikes('entries', entryStore.getEntries[1].id)
    let entyId = entryStore.getEntries[0].id;
    await likeStore.getAllLikesDislikes('entries', entyId)

    await waitUntil(() => {
      return likeStore.getLikes && likeStore.getDislikes
    })
    expect(likeStore.getLikes).not.toBe(undefined)
    expect(likeStore.getDislikes).not.toBe(undefined)

    let initialLikeLenght = likeStore.getLikes?.length
    let initialDislikeLenght = likeStore.getDislikes?.length

    if (initialLikeLenght !== 0 || initialDislikeLenght !== 0) {
      await likeStore.deleteAllLikesDislikes('entries', entyId)

      await waitUntil(() => {
        return likeStore.getLikes?.length === 0 && likeStore.getDislikes?.length === 0
      }).catch(() => console.log('Initial State'))
      expect(likeStore.getDislikes?.length).toBe(0)
      expect(likeStore.getLikes?.length).toBe(0)
    }

    initialLikeLenght = likeStore.getLikes?.length
    initialDislikeLenght = likeStore.getDislikes?.length
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    // Should add a like if not exit
    await likeStore.addLike('entries', entyId)

    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght + 1
    // }).catch(() => console.log('1-First Like'))

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght + 1)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('1')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    // Should remove like if exit
    await likeStore.addLike('entries', entyId)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght
    // }).catch(() => console.log('2-Second Like'))

    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    // Should add dislike if not exit
    await likeStore.addDislike('entries', entyId)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght && likeStore.getDislikes?.length === initialDislikeLenght + 1
    // }).catch(() => console.log('3-First Dislike'))

    // After
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    //should remove dislike if exist
    await likeStore.addDislike('entries', entyId)
    // After
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    // Should add dislike if not exit
    await likeStore.addDislike('entries', entyId)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght && likeStore.getDislikes?.length === initialDislikeLenght + 1
    // })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    // Should remove dislike after like
    await likeStore.addLike('entries', entyId)
    // await waitUntil(() => {
    //   return likeStore.getLikes?.length === initialLikeLenght + 1 && likeStore.getDislikes?.length === initialDislikeLenght
    // })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('1')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght + 1)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght)

    // Should add like after dislike
    await likeStore.addDislike('entries', entyId)

    // await waitUntil(() => {
    //   return likeStore.getDislikes?.length === initialDislikeLenght + 1 && likeStore.getLikes?.length === initialLikeLenght
    // })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    // Part 1: Authenticate user
    // Login the test@test.com user
    let userObj = {
      email: import.meta.env.VITE_TEST_USER,
      password: import.meta.env.VITE_TEST_PASSWORD
    }
    try {

      await userStore.emailSignIn(userObj)
      // wait the user to be authenticated
      await waitUntil(() => {
        return userStore.isAuthenticated
      }).catch((e) => console.log('Error : Should be authenticated', e))

    } catch (e) {
      console.log('Error Mean User does not exist', e)
    }

    // Part 2: Like the entry
    await likeStore.addLike('entries', entyId)
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('1')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('1')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght + 1)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 1)

    // Part 2: Dislike the entry
    await likeStore.addDislike('entries', entyId)
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('2')

    expect(likeStore.getLikes?.length).toBe(initialLikeLenght)
    expect(likeStore.getDislikes?.length).toBe(initialDislikeLenght + 2)

    // Part 2: Delete All Likes && Dislikes
    await likeStore.deleteAllLikesDislikes('entries', entyId)

    await waitUntil(() => {
      return likeStore.getLikes?.length === 0 && likeStore.getDislikes?.length === 0
    })
    expect(likeStore.getLikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getDislikes?.length).toMatchInlineSnapshot('0')
    expect(likeStore.getLikes?.length).toBe(0)
    expect(likeStore.getDislikes?.length).toBe(0)
  })
})
