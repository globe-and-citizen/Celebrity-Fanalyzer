//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useEntryStore, usePromptStore, useUserStore } from 'src/stores'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// Snapshot Listener Helper -- A Shameless Hack
async function letSnapshotListenerRun(delay) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res()
    }, delay)
  })
}

describe('Users Store', () => {
  setActivePinia(createPinia())
  const entryStore = useEntryStore()
  const promptStore = usePromptStore()
  const userStore = useUserStore()

  // Create a router instance using the `createRouter()` function
  const router = createRouter({
    history: createWebHistory(),
    routes: []
  })

  beforeEach(async () => {
    // In the Pinia store user.js, the call to fetch to get the user IP breaks. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })
  })

  it('Access a non-existing public profile', async () => {
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

    // 4) Get the user's prompts and entries
    await promptStore.fetchPrompts()
    const filteredPrompts = promptStore.getPrompts.filter((prompt) => prompt.author.uid === user.value.uid)

    await entryStore.fetchEntries().catch((error) => errorStore.throwError(error))
    const filteredEntries = entryStore.getEntries.filter((entry) => entry.author.uid === user.value.uid)

    // 5) Verify that the user has at least one prompt or one entry
    expect(filteredPrompts.length > 0 || filteredEntries.length > 0).toBe(true)
  })

  it('Should fetch all user', async () => {
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
