//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useUserStore, usePromptStore, useStorageStore } from 'src/stores'
import fs from 'fs'
import { waitUntil } from 'src/waitUntil'

describe('Prompt Store', async () => {
  const fakeDate = '2991-01'

  //Load an image to use
  var bitmap = fs.readFileSync('src/assets/cypress.jpg')

  beforeEach(async () => {

    // By declaring the various stores within the "describe" block,
    // you can avoid redeclaring the stores within each "it" block.
    setActivePinia(createPinia())
    // In the store user.js, the call to fetch to get the user IP address breaks without this mock. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })

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
    const promptStore = usePromptStore()

    // Check if a prompt with the date "2991-01" exists in the firestore. And, if so, delete it
    await promptStore.fetchPrompts()

    await waitUntil(() => {
      // TODO : Default state
      return promptStore.getPrompts.length > 0
    })
    let prompts = promptStore.getPrompts
    if (prompts.some((prompt) => prompt.id === fakeDate)) {

      const startingNumberOfPrompts = promptStore.getPrompts.length
      await promptStore.deletePrompt(fakeDate)

      await waitUntil(() => {
        return (promptStore.getPrompts.length = startingNumberOfPrompts - 1)
      })

      expect(promptStore.getPrompts.length).toBe(startingNumberOfPrompts - 1)
    }
  })

  it('Creates and then deletes a fake prompt.', async () => {
    const promptStore = usePromptStore()
    const storageStore = useStorageStore()
    const userStore = useUserStore()


    // 1) Load prompts into the store
    await promptStore.fetchPrompts()
    await waitUntil(() => {
      // TODO : Default state
      return promptStore.getPrompts.length > 0
    })

    // Step 2: Check the starting number of comments.
    const startingNumberOfPrompts = promptStore.getPrompts.length

    // 3) Add a fake prompt & test it was added successfully added
    let user = userStore.getUser
    let imgAddress = await storageStore.uploadFile(bitmap, `images/prompt-${fakeDate}`)

    const fakePrompt = {
      author: { label: user.displayName, value: user.uid },
      categories: ['1_CategoryFake', '2_CategoryFake', '3_CategoryFake'],
      date: fakeDate,
      description: 'Let it be known: THIS is my fake entry!',
      id: fakeDate,
      image: imgAddress,
      showcase: null,
      title: 'This Be A Fake Prompt',
      created: null
    }

    await promptStore.addPrompt(fakePrompt)
    await waitUntil(() => {
      return promptStore.getPrompts.length > startingNumberOfPrompts
    })

    // Check Prompts length increase
    expect(promptStore.getPrompts.length).toBe(startingNumberOfPrompts + 1)

    // 4) Edit the fake prompt

    // 5) Delete fake prompt and check
    await promptStore.deletePrompt(fakePrompt.id)
    await waitUntil(() => {
      return promptStore.getPrompts.length === startingNumberOfPrompts
    })
    expect(promptStore.getPrompts.length).toBe(startingNumberOfPrompts)
  })
})

afterAll(async () => {
  // clean up logic.
})
