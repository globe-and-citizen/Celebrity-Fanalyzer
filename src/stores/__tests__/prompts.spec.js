//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useCommentStore, useEntryStore, useUserStore, usePromptStore, useStorageStore } from 'src/stores'
import { ref, reactive } from 'vue'
import fs from 'fs'

describe('Prompt Store', async () => {
  // By declaring the various stores within the "describe" block,
  // you can avoid redeclaring the stores within each "it" block.
  setActivePinia(createPinia())
  const userStore = useUserStore()
  const promptStore = usePromptStore()
  const storageStore = useStorageStore()

  //Load an image to use
  var bitmap = fs.readFileSync('src/assets/cypress.jpg')
  console.log('a node buffer: ', bitmap)

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

  beforeEach(async () => {
    // In the store user.js, the call to fetch to get the user IP address breaks without this mock. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })
  })

  it('Creates and then deletes a fake prompt.', async () => {
    // 1) Load prompts into the store
    await promptStore.fetchPrompts()

    // Step 2: Check the starting number of comments.
    let prompts = promptStore.getPrompts
    const startingNumberOfPrompts = prompts.length

    // 3) Add a fake prompt & test it was added successfully added
    const fakeDate = '1991-01'
    let user = userStore.getUser
    let imgAddress

    //const aBuffer = Buffer.from('A fake picture', 'utf-8')
    imgAddress = await storageStore.uploadFile(bitmap, `images/prompt-${fakeDate}`)

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
    await promptStore.fetchPrompts()
    let expandedPrompts = promptStore.getPrompts
    let newNumberOfPrompts = expandedPrompts.length
    expect(newNumberOfPrompts).toBe(startingNumberOfPrompts + 1)

    // 4) Edit the fake prompt

    // 5) Delete fake prompt and check
    await promptStore.deletePrompt(fakePrompt.id)
    await promptStore.fetchPrompts()
    expect(promptStore.getPrompts.length).toBe(startingNumberOfPrompts)
  })
})

afterAll(async () => {
  // clean up logic.
})
