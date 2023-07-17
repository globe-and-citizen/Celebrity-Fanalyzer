//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useEntryStore, usePromptStore, useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

describe('Users Store', () => {
  // Create a router instance using the `createRouter()` function
  const router = createRouter({
    history: createWebHistory(),
    routes: []
  })

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
  })
  it('Should Access the store initial state with the getter as an anonymous user', ()=>{
    const userStore = useUserStore()
    expect(userStore.getAdmins).toEqual([])
    expect(userStore.getAdminsAndWriters).toEqual([])
    expect(userStore.getProfileTab).toEqual("profile")
    expect(userStore.getSubscriptions).toEqual(undefined)
    expect(userStore.getUser).toEqual({})
    expect(userStore.getUserById('abcd')).toEqual(undefined)
    expect(userStore.getUserIp).toEqual('')
    expect(userStore.getUserIpHash).toEqual("da39a3ee5e6b4b0d3255bfef95601890afd80709")
    expect(userStore.getUserRef).toEqual(undefined)
    expect(userStore.getUsers).toEqual(undefined)
    expect(userStore.isAdmin).toEqual(false)
    expect(userStore.isEditorOrAbove).toEqual(false)
    expect(userStore.isWriterOrAbove).toEqual(false)
    expect(userStore.isAnonymous).toEqual(undefined)
    expect(userStore.isLoading).toEqual(false)
    expect(userStore.isAuthenticated).toEqual(false)
  })

  it('Access a non-existing public profile', async () => {
    const userStore = useUserStore()
    // 1) Attempt to get the user
    const user = ref()
    await userStore.getUserByUidOrUsername('abc123').then((res) => (user.value = res))

    // 2) Check if the user exists, redirect to the corresponding page; otherwise, redirect to the Index Page.
    if (user.value) {
      await router.push('/fan/abc123')
    } else {
      await router.push('/')
    }

    // 3) Verify that the user is redirected to the Index Page.
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('Access a existing public profile', async () => {
    const entryStore = useEntryStore()
    const promptStore = usePromptStore()
    const userStore = useUserStore()

    // 1) Attempt to get the user
    const user = ref()
    await userStore.getUserByUidOrUsername('arnonrdp').then((res) => (user.value = res))

    // 2) Check if the user exists, redirect to the corresponding page; otherwise, redirect to the Index Page.
    if (user.value) {
      await router.push('/fan/arnonrdp') // TODO: remove 'arnonrdp' and replace by a generic username
    } else {
      await router.push('/')
    }

    // 3) Verify that the user is redirected to the Index Page.
    expect(router.currentRoute.value.path).toBe('/fan/arnonrdp')

    await userStore.fetchAdminsAndWriters()

    // 4) Get the user's prompts and entries
    await promptStore.fetchPrompts()
    await waitUntil(() => {
      // TODO : Default state
      return promptStore.getPrompts.length > 0
    })
    const filteredPrompts = promptStore.getPrompts.filter((prompt) => prompt.author?.uid === user.value.uid)

    await entryStore.fetchEntries().catch((error) => errorStore.throwError(error))

    await waitUntil(() => {
      // TODO : Default state
      return entryStore.getEntries.length > 0
    })
    const filteredEntries = entryStore.getEntries.filter((entry) => entry.author?.uid === user.value.uid)

    // 5) Verify that the user has at least one prompt or one entry
    expect(filteredPrompts.length > 0 || filteredEntries.length > 0).toBe(true)
  })

  it('Should fetch all user', async () => {
    const userStore = useUserStore()
    await userStore.fetchUsers()
    expect(userStore.getUsers.length).toBeGreaterThan(0)
  })

  // it('Should Sign up with email then remove the acount', async () => {
  //   await userStore.emailSignUp({ email: 'newTest@test.com', name: 'NewName', password: '123456' })
  //   await userStore.emailSignIn({ email: 'newTest@test.com', password: '123456' })
  // })
})

afterAll(async () => {
  // clean up logic.
})
