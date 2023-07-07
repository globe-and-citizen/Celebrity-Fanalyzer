//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useFeedbackStore, useUserStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'

describe('Test FeedBacks Store', async () => {
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
  it('should Fetch Feedback then add a feedBack then delete It', async () => {
    const feedbackStore = useFeedbackStore()
    const userStore = useUserStore()
    // Check initial state
    expect(feedbackStore.isLoading).toBe(false)
    expect(feedbackStore.getFeedbacks).toBe(undefined)

    // 1 Fetch feedback
    await feedbackStore.fetchFeedbacks()

    expect(feedbackStore.getFeedbacks).not.toBe(undefined)
    const initialFeedbacks = feedbackStore.getFeedbacks

    // 2 Add feedback
    const newFeedback = { subject: 'sujet', message: 'Message' }
    await waitUntil(() => {
      return userStore.getUser !== {}
    })
    await feedbackStore.addFeedback(newFeedback)
    await feedbackStore.fetchFeedbacks()
    const afterAddFeedbacks = feedbackStore.getFeedbacks

    expect(initialFeedbacks.length).toBe(afterAddFeedbacks.length - 1)

    // 3 Delete feedback
    const lastFeedBack = afterAddFeedbacks[0]
    await feedbackStore.deleteFeedback(lastFeedBack.id)

    await feedbackStore.fetchFeedbacks()
    const afterDelFeedbacks = feedbackStore.getFeedbacks

    expect(initialFeedbacks.length).toBe(afterDelFeedbacks.length)
  })
})
