//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useCommentStore, useEntryStore, useUserStore } from 'src/stores'
import { ref, reactive } from 'vue'
import { waitUntil } from 'src/utils/waitUntil'

describe('Comments Store', () => {

  beforeEach(async () => {
    // Put setActivePinia in beforeEach because we need a fresh store
    setActivePinia(createPinia())
    // In the Pinia store user.js, the call to fetch to get the user IP breaks. This is a mock to prevent breaking.
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })

    // Login the test@test.com user
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
  })


  it('Create and then delete a fake comment in here', async () => {
    // Step 1: Retrieve an entry to comment on.

    const entryStore = useEntryStore()
    const commentStore = useCommentStore()
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    await waitUntil(() => {
      // TODO : Default state : find a better way to test it. Should use undefined for default state
      return entryStore.getEntries.length > 0
    })
    firstEntry.value = entryStore.getEntries[0]

    // Step 2: Check the starting number of comments.
    await commentStore.fetchComments('entries', firstEntry.value.id)
    await waitUntil(() => {
      return commentStore.isLoaded
    })
    const startingNumberOfComments = commentStore.getComments.length

    // 3) Add a fake comment & test it was added successfully added
    let myComment = reactive({ text: 'Branch feature/delete-comment-preserve-replies' })
    await commentStore.addComment('entries', myComment, firstEntry.value)

    // Example usage
    await waitUntil(() => {
      return commentStore.getComments.length === startingNumberOfComments + 1
    })

    expect(commentStore.getComments.length).toBe(startingNumberOfComments + 1)

    // 5): Delete fake comment. Start by retrieving it.
    let comments = commentStore.getComments
    let commentsOrdered = comments.sort((a, b) => b.created - a.created)
    await commentStore.deleteComment('entries', firstEntry.value.id, commentsOrdered[0].id)
    comments = commentStore.getComments
    commentsOrdered = comments.sort((a, b) => b.created - a.created)

    await waitUntil(() => {
      return commentStore.getComments.sort((a, b) => b.created - a.created)[0].text === 'Comment Deleted'
    })

    // 6) Check to see that the comments has reduced back to the original value.
    expect(commentStore.getComments.sort((a, b) => b.created - a.created)[0].text).toBe('Comment Deleted')

    // 7) remove the comment from the Firebase Store
    await commentStore.removeCommentFromFirestore('entries', firstEntry.value.id, commentsOrdered[0].id)

    await waitUntil(() => {
      return commentStore.getComments.length === startingNumberOfComments
    })

    expect(commentStore.getComments.length).toBe(startingNumberOfComments)
  })
})

afterAll(async () => {
  // clean up logic.
})
