import { createPinia, setActivePinia } from 'pinia'
import { useEntryStore, useShareStore, useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Unit Test Share Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    const userStore = useUserStore()
    // In the Pinia store user.js, the call to fetch to get the user IP breaks. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return `fl=378f39
            h=www.cloudflare.com
            ip=255.255.255.255
            ts=1686840839.606
            visit_scheme=https
            uag=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36
            colo=LHR
             sliver=none
            http=http/2
            loc=TG
            tls=TLSv1.3
            sni=plaintext
            warp=off
            gateway=off
            rbi=off
            kex=X25519`
        }
      }
    })
    // Login the test@test.com user
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
  it('should fetch all share of an entry add share the remove all share', async () => {
    const entryStore = useEntryStore()
    const shareStore = useShareStore()
    await entryStore.fetchEntries()
    await waitUntil(() => {
      return entryStore.getEntries
    })
    const firstEntry = entryStore.getEntries[0]

    await shareStore.fetchShares('entries', firstEntry.id)
    // await shareStore.fetchShares('entries', entryStore.getEntries[1].id)

    await waitUntil(() => {
      return shareStore.isLoaded === true
    })
    expect(shareStore.isLoaded).toBe(true)

    let initialLength = shareStore.getShares.length
    if (initialLength > 0) {
      // Delete All Share to have an empty share list
      await shareStore.deleteAllShares('entries', firstEntry.id)

      await waitUntil(() => {
        return shareStore.getShares.length === 0
      })
      expect(shareStore.getShares.length).toBe(0)
    }

    initialLength = shareStore.getShares.length

    expect(shareStore.getShares.length).toBe(0)
    shareStore.addShare('entries', firstEntry.id, 'instagram')

    await waitUntil(() => {
      return shareStore.isLoading
    })
    await waitUntil(() => {
      return !shareStore.isLoading
    })
    expect(shareStore.getShares.length).toBe(initialLength + 1)

    await shareStore.deleteAllShares('entries', firstEntry.id)
    await waitUntil(() => {
      return shareStore.getShares.length === 0
    })
    expect(shareStore.getShares.length).toBe(0)

    // Reload fetch Share with another entries
    await shareStore.fetchShares('entries', entryStore.getEntries[1].id)
    expect(shareStore.isLoaded).toBe(true)
  })
})
