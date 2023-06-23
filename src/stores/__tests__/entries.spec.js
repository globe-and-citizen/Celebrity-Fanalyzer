//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import fs from 'fs'
import { useEntryStore, usePromptStore, useStorageStore, useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'
import { reactive } from 'vue'

//Load an image to use

describe('Entry Store', async () => {
  // By declaring the various stores within the "describe" block,
  // you can avoid redeclaring the stores within each "it" block.
  //Load and image to use
  let bitmap = fs.readFileSync('src/assets/cypress.jpg')

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
      return promptStore.getPrompts.length > 0
    })
    await waitUntil(() => {
      // TODO : Default state : find a better way to test it. Should use undefined for default state
      return entryStore.getEntries.length > 0
    })
    // Step 2: Check the starting number of entries.
    let entries = entryStore.getEntries
    const startingNumberOfEntries = entries.length

    // 3) Create a mock entry & test it was successfully added
    const prompts = promptStore.getPrompts
    const aPrompt = prompts[0]
    let imgAddress = await storageStore.uploadFile(bitmap, `images/entry-${aPrompt.date}`)

    const fakeEntry = reactive({
      id: `${aPrompt.date}T${Date.now()}`,
      author: { label: userStore.getUser.displayName, value: userStore.getUser.uid },
      description: 'The description of a fake entry',
      image: imgAddress,
      title: 'Fake Entry',
      prompt: { label: `${aPrompt.date} - ${aPrompt.title}`, value: aPrompt.date },
      slug: `/${aPrompt.date.replace(/\-/g, '/')}/fake-entry`
    })

    await entryStore.addEntry(fakeEntry)
    await waitUntil(() => {
      // TODO : Default state : find a better way to test it. Should use undefined for default state
      return entryStore.getEntries.length === startingNumberOfEntries + 1
    })
    expect(entryStore.getEntries.length).toBe(startingNumberOfEntries + 1)

    // 4) Edit the fake entry

    // 5) Delete fake entry and check
    // await entryStore.deleteEntry(fakeEntry.id)
    // await entryStore.fetchEntries()
    // let entryArrayAfterDelete = entryStore.getEntries
    // let endingNumberOfEntries = entryArrayAfterDelete.length
    // expect(endingNumberOfEntries).toBe(startingNumberOfEntries)
  })
})

afterAll(async () => {
  // clean up logic.
})
