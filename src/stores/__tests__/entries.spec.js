//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import fs from 'fs'
import { useEntryStore, usePromptStore, useStorageStore, useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'

//Load an image to use
// Mock Firebase Storage
vi.mock('firebase/storage', async () => {
  const actual = vi.importActual('firebase/storage')
  return {
    ...actual,
    getStorage: vi.fn(),
    ref: vi.fn(),
    uploadBytes: vi.fn(async () => ({ metadata: { fullPath: 'images/entry-2024-05' } })),
    getDownloadURL: vi.fn(async () => 'https://mockstorage.gooleapis.com/v0/b/mocktest/o/images%2Fentry-2024-05?alt=media&token=mocktoken'),
    deleteObject: vi.fn(async () => {})
  }
})

describe('Entry Store', async () => {
  // By declaring the various stores within the "describe" block,
  // you can avoid redeclaring the stores within each "it" block.

  beforeEach(async () => {
    setActivePinia(createPinia())
    const userStore = useUserStore()

    /* Login test@test.com:
     * If you will be using only a logged in user to run the tests,
     * it makes sense to log in once before running any other code.
     * Alternatively, you can run a log in / log out script within
     * each "it" block.
     */
    try {
      const userObj = {
        email: import.meta.env.VITE_TEST_USER,
        password: import.meta.env.VITE_TEST_PASSWORD
      }
      await userStore.emailSignIn(userObj)
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
    }
    // In the store user.js, the call to fetch to get the user IP address breaks without this mock. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })
  })

  it('Creates and then deletes a fake entry.', async () => {
    const promptStore = usePromptStore()
    const entryStore = useEntryStore()
    const storageStore = useStorageStore()
    const userStore = useUserStore()

    // 1) Load entries & prompts into the store
    await promptStore.fetchPrompts()
    await entryStore.fetchEntries()

    await waitUntil(() => {
      // TODO : Default state
      return promptStore.getPrompts
    })
    await waitUntil(() => {
      return entryStore.getEntries
    })

    // 3) Create a mock entry & test it was successfully added
    const prompts = promptStore.getPrompts
    const aPrompt = prompts[1]
    // Load and image to use
    const bitmap = fs.readFileSync('src/assets/cypress.jpg')
    const imgAddress = await storageStore.uploadFile(bitmap, `images/entry-${aPrompt.date}`)
    const id = `${aPrompt.date}T${Date.now()}`
    const fakeEntry = {
      id: id,
      author: { label: userStore.getUser.displayName, value: userStore.getUser.uid },
      description: 'The description of a fake entry',
      image: imgAddress,
      title: 'Fake Entry',
      prompt: { label: `${aPrompt.date} - ${aPrompt.title}`, value: aPrompt.date },
      slug: `/${aPrompt.date.replace(/-/g, '/')}/fake-entry`
    }

    await entryStore.addEntry(fakeEntry)
    await entryStore.fetchEntries()
    await waitUntil(() => {
      return entryStore.getEntries?.find((entry) => entry.id === id)
    })
    expect(entryStore.getEntries?.find((entry) => entry.id === id)?.id).toBe(fakeEntry.id)
    expect(entryStore.getEntries?.find((entry) => entry.id === id)?.title).toBe(fakeEntry.title)

    // 4) Edit the fake entry
    fakeEntry.title = 'Edited Fake Entry'
    fakeEntry.description = 'Edited description of a fake entry'
    await entryStore.editEntry(fakeEntry)

    await entryStore.fetchEntries()
    await waitUntil(() => {
      return entryStore.getEntries?.find((entry) => entry.id === id)?.title === 'Edited Fake Entry'
    }).catch(() => console.log("can't 'Have Edited Fake Entry'"))
    expect(entryStore.getEntries?.find((entry) => entry.id === id)?.title).toBe('Edited Fake Entry')

    // 5) Delete fake entry and check
    await entryStore.deleteEntry(fakeEntry.id)
    await entryStore.fetchEntries()
    await waitUntil(() => {
      return !entryStore.getEntries?.find((entry) => entry.id === id)
    }).catch(() => console.log('Entry Still exist'))
    expect(entryStore.getEntries?.find((entry) => entry.id === id)?.id).toBe(undefined)
  })
})
