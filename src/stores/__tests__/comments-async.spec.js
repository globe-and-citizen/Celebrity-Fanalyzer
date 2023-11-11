import { createPinia, setActivePinia } from 'pinia'
import { useCommentStore, useEntryStore, useUserStore } from 'src/stores'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitUntil } from 'src/utils/waitUntil'

describe('Async watcher ', () => {
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
    const userStore = useUserStore()
    const entryStore = useEntryStore()
    const commentStore = useCommentStore()
    await entryStore.fetchEntries()
    await waitUntil(() => {
      return entryStore.getEntries
    }).catch((e) => console.log('Error :  Loading Entry', e))

    // Using a methode kep the reactivity
    const getFirstEntry = () => {
      return entryStore.getEntries?.[0]
    }

    // 1- Check initial state
    expect(commentStore.getComments).toBe(undefined)
    expect(commentStore.isLoaded).toBe(false)

    // 2- Check Fetch Comment
    await commentStore.fetchComments('entries', getFirstEntry().id)

    await waitUntil(() => {
      return commentStore.isLoaded
    }).catch((e) => console.log('Error :  2- Check Fetch Comment', e))

    const startingNumberOfComments = commentStore.getComments.length
    expect(!!commentStore.getComments).toBe(true)

    // 3- Check Add comment
    let myComment = { text: 'Test comment' }
    commentStore.addComment('entries', myComment, getFirstEntry())

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

    // 3.1. Check if the created comment children is empty
    const firstLevelComment = commentStore.getComments.sort((a, b) => b.created - a.created)[0]
    expect(commentStore.getCommentChildren(firstLevelComment.id).length).toBe(0)

    // 3.2. Check reply to the firstLevelComment
    commentStore.setReplyTo(firstLevelComment.id)
    expect(commentStore.getReplyTo).toBe(firstLevelComment.id)

    // 3.3. Add reply

    let reply = { text: 'Test repy', parentId: commentStore.getReplyTo }
    await commentStore.addReply('entries', getFirstEntry().id, reply)
    expect(commentStore.getCommentChildren(firstLevelComment.id).length).toBe(1)

    let comment = commentStore.getCommentById(firstLevelComment.id)
    expect(comment.likes.length).toBe(0)
    expect(comment.dislikes.length).toBe(0)
    // TODO : Like
    await commentStore.likeComment('entries', getFirstEntry().id, firstLevelComment.id)
    comment = commentStore.getCommentById(firstLevelComment.id)
    expect(comment.likes.length).toBe(1)
    expect(comment.dislikes.length).toBe(0)
    // TODO : Dislike

    await commentStore.dislikeComment('entries', getFirstEntry().id, firstLevelComment.id)
    comment = commentStore.getCommentById(firstLevelComment.id)
    expect(comment.dislikes.length).toBe(1)
    expect(comment.likes.length).toBe(0)
    // 4- Check edit Comment
    commentStore.editComment(
      'entries',
      getFirstEntry().id,
      firstLevelComment.id,
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
      return commentStore.getCommentById(firstLevelComment.id)?.text === 'Edited comment'
    }).catch((e) => console.log('Error :  4- Check edit Comment', e))

    comment = commentStore.getCommentById(firstLevelComment.id)
    expect(comment.text).toBe('Edited comment')

    // 6- Check deleteComment
    await commentStore.deleteComment('entries', getFirstEntry().id, firstLevelComment.id)

    expect(commentStore.isLoading).toBe(false)
    await waitUntil(() => {
      return commentStore.getCommentById(firstLevelComment.id)?.text === 'Comment Deleted'
    }).catch((e) => console.log('Error :  6- Check deleteComment', e))

    comment = commentStore.getCommentById(firstLevelComment.id)
    expect(comment.text).toBe('Comment Deleted')

    // 7) remove the comment from the Firebase Store
    await commentStore.removeCommentFromFirestore('entries', getFirstEntry().id, firstLevelComment.id)

    await waitUntil(() => {
      return commentStore.getComments.length === startingNumberOfComments + 1
    }).catch((e) => console.log('Error :  7) remove the comment from the Firebase Store', e))

    expect(commentStore.getComments.length).toBe(startingNumberOfComments + 1)
  })
})
