//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, it, vi } from 'vitest'

// Necessary Components
import { useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'

describe('Users Store', () => {
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

  it('Should login as a normal user and request to become a writer', async () => {
    const userStore = useUserStore()

    let user = {
      email: import.meta.env.VITE_TEST_USER,
      password: import.meta.env.VITE_TEST_PASSWORD
    }
    await userStore.emailSignIn(user)

    // await waitUntil(() => promptStore.getPrompts.length)
  })
})
