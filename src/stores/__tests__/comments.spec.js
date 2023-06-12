//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { useCommentStore, useEntryStore, useUserStore } from 'src/stores'
import { ref, reactive } from 'vue'

// Snapshot Listener Helper -- A Shameless Hack
async function letSnapshotListenerRun(delay) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res()
    }, delay)
  })
}

describe('Comments Store', () => {
  setActivePinia(createPinia())
  const entryStore = useEntryStore()
  const commentStore = useCommentStore()

  beforeEach(async () => {
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
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    // Step 2: Check the starting number of comments.
    await commentStore.fetchComments('entries', firstEntry.value.id)
    await letSnapshotListenerRun(500)
    const startingNumberOfComments = commentStore.getComments.length

    // 3) Add a fake comment & test it was added successfully added
    let myComment = reactive({ text: 'Branch feature/delete-comment-preserve-replies' })
    await commentStore.addComment('entries', myComment, firstEntry.value)

    // 4) Test to see that the number of comments has increased by one
    await commentStore.fetchComments('entries', firstEntry.value.id) // ADD LISTENER

    expect(commentStore.getComments.length).toBe(startingNumberOfComments + 1)

    // 5): Delete fake comment. Start by retrieving it.
    let comments = commentStore.getComments
    let commentsOrdered = comments.sort((a, b) => b.created - a.created)
    commentStore.deleteComment('entries', firstEntry.value.id, commentsOrdered[0].id)
    await letSnapshotListenerRun(500)
    await commentStore.fetchComments('entries', firstEntry.value.id)
    comments = commentStore.getComments
    commentsOrdered = comments.sort((a, b) => b.created - a.created)

    // 6) Check to see that the comments has reduced back to the original value.
    expect(commentsOrdered[0].text).toBe('Comment Deleted')

    // 7) remove the comment from the Firebase Store
    commentStore.removeCommentFromFirestore('entries', firstEntry.value.id, commentsOrdered[0].id)
    await letSnapshotListenerRun(500)
    await commentStore.fetchComments('entries', firstEntry.value.id)
    comments = commentStore.getComments
    commentsOrdered = comments.sort((a, b) => b.created - a.created)
    expect(comments.length).toBe(startingNumberOfComments)
  })
})

afterAll(async () => {
  // clean up logic.
})
