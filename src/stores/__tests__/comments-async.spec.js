import { createPinia, setActivePinia } from 'pinia'
import { useCommentStore, useEntryStore, useUserStore } from 'src/stores'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { waitUntil } from 'src/waitUntil'

function getCommentLength(commentStore) {
  return () => {
    return commentStore.getComments.length > 0
  }
}

describe('Async watcher ', () => {
  setActivePinia(createPinia())
  const userStore = useUserStore()
  const entryStore = useEntryStore()
  const commentStore = useCommentStore()
  const userId = userStore.isAuthenticated ? userStore.getUserRef?.id : userStore.getUserIpHash

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

  it('Should fetch async the comment using then', async () => {
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    // Step 2: Check the starting number of comments.
    await commentStore.fetchComments('entries', firstEntry.value.id)

    // Example usage
    waitUntil(getCommentLength(commentStore)).then(() => {
      const startingNumberOfComments = commentStore.getComments.length
      expect(startingNumberOfComments).toBeGreaterThan(0)
    })
  })

  /**
   * Better way to use it
   */
  it('Should fetch async the comment using await ', async () => {
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    // Step 2: Check the starting number of comments.
    await commentStore.fetchComments('entries', firstEntry.value.id)

    // Example usage
    await waitUntil(getCommentLength(commentStore))

    const startingNumberOfComments = commentStore.getComments.length
    expect(startingNumberOfComments).toBeGreaterThan(0)
  })
  /*
  TODO: Comment for Prompt or entry

  BeforeAll Add loading
  AfterAll Remove loading

  Fetch Comments for a document
  Add Comment
  Edit Comment
  Delete Comment
  Like Comment
  Dislike Comment
  Delete Comment Collection
  Add Reply


   */
  it('should test full comment store', async function () {
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    function getCommentLength(commentStore) {
      return () => {
        return commentStore.getComments.length > 0
      }
    }

    function getLastComment() {
      return commentStore.getComments.sort((a, b) => b.created - a.created)[0]
    }

    // 1- Check initial state
    expect(commentStore.getComments.length).toBe(0)
    expect(commentStore.isLoading).toBe(false)

    // 2- Check Fetch Comment
    await commentStore.fetchComments('entries', firstEntry.value.id)

    // await waitUntil(getCommentLength(commentStore))
    const startingNumberOfComments = commentStore.getComments.length
    // expect(startingNumberOfComments).toBeGreaterThan(0)

    // 3- Check Add comment
    let myComment = { text: 'Test comment' }
    commentStore.addComment('entries', myComment, firstEntry.value)

    // Check Loading state variation false =>true => false
    await waitUntil(() => {
      return commentStore.isLoading === true
    })
    expect(commentStore.isLoading).toBe(true)
    await waitUntil(() => {
      return commentStore.isLoading === false
    })
    expect(commentStore.isLoading).toBe(false)

    // Validate of add
    expect(commentStore.getComments.length).toBeGreaterThan(startingNumberOfComments)
    const createdComment = getLastComment()

    // 4- Check edit Comment
    commentStore.editComment(
      'entries',
      firstEntry.value.id,
      createdComment.id,
      'Edited comment',
      userStore.isAuthenticated ? userStore.getUserRef?.id : userStore.getUserIpHash
    )

    // Check Loading state variation false =>true => false
    await waitUntil(() => {
      return commentStore.isLoading === true
    })
    expect(commentStore.isLoading).toBe(true)
    await waitUntil(() => {
      return commentStore.isLoading === false
    })
    expect(commentStore.isLoading).toBe(false)

    await waitUntil(() => {
      return getLastComment().text === 'Edited comment'
    })
    expect(getLastComment().text).toBe('Edited comment')

    // 6- Check deleteComment
    await commentStore.deleteComment('entries', firstEntry.value.id, getLastComment().id)

    expect(commentStore.isLoading).toBe(false)
    await waitUntil(() => {
      return getLastComment().text === 'Comment Deleted'
    })
    expect(getLastComment().text).toBe('Comment Deleted')
    // 6- Check deleteCommentsCollection
    // addReply
    // removeCommentFromFirestore
  })
})
