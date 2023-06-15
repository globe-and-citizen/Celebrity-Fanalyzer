//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import {useFeedbackStore, usePromptStore, useStorageStore, useUserStore} from 'src/stores'

describe('Test FeedBacks Store', async () => {
  setActivePinia(createPinia())
  const feedbackStore = useFeedbackStore()
  const userStore = useUserStore()

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
  it('should Fetch Feedback then add a feedBack then delete It', async () => {
    // Check initial state
    expect(feedbackStore.isLoading).toBe(false)
    expect(feedbackStore.getFeedbacks).toBeTruthy([])

    // 1 Fetch feedback
    await feedbackStore.fetchFeedbacks()

    expect(feedbackStore.getFeedbacks.length).toBeGreaterThan(0)
    const initialFeedbacks = feedbackStore.getFeedbacks

    // 2 Add feedback
    const newFeedback = { subject: 'sujet', message: 'Message' }
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
