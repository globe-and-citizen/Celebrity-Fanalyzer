//Firebase
//import { signInWithEmailAndPassword } from 'firebase/auth'
//import { auth, db } from 'src/firebase'

//Testing Frameworks
import { config, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import TheComments from 'src/components/Posts/TheComments.vue'
import { useCommentStore, useEntryStore } from 'src/stores'
import { useUserStore } from 'src/stores/user'
import { ref } from 'vue'

import { createRouterMock, injectRouterMock, VueRouterMock } from 'vue-router-mock'
config.plugins.VueWrapper.install(VueRouterMock)

describe('TheComment Component', () => {
  const router = createRouterMock({
    spy: {
      create: (fn) => vi.fn(fn),
      reset: (spy) => spy.mockReset()
    }
  })
  beforeEach(async () => {
    setActivePinia(createPinia())
    injectRouterMock(router)
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

  // FIRST TEST
  it('Creates fake comment in here', async () => {
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })

    // Step 1: Get user data and entry data to shallow mount "TheComments" component.
    const userStore = useUserStore()
    const user = userStore.getUser
    const entryStore = useEntryStore()
    const firstEntry = ref({})
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    const componentShallowMount = shallowMount(TheComments, {
      global: {
        mocks: {
          addComment: vi.fn(() => {
            commentStore.addComment('entries', componentShallowMount.vm.myComment, firstEntry.value)
          }),
          editComment: vi.fn(() => {
            commentStore.editComment('entries', firstEntry.value.id, componentShallowMount.vm.commentId, editedComment, user.uid)
          }),
          deleteComment: vi.fn(() => {
            commentStore.deleteComment('entries', firstEntry.value.id, componentShallowMount.vm.commentId)
          })
        }
      },
      props: {
        collectionName: 'entries',
        post: firstEntry.value
      }
    })

    // Step 2: Check the starting number of comments.
    const commentStore = useCommentStore()
    await commentStore.fetchComments('entries', firstEntry.value.id)

    await new Promise((res, rej) => {
      //Because the realtime updates invoke a separate listener, 150ms must be given for this listener to work.
      setTimeout(() => {
        res()
      }, 150)
    })

    const startingNumberOfComments = commentStore.getComments.length

    // 3) Add a fake comment & test it was added successfully
    componentShallowMount.vm.myComment.text = 'test my comment'
    await componentShallowMount.vm.addComment() //Mocked
    await commentStore.fetchComments('entries', firstEntry.value.id)
    await new Promise((res, rej) => {
      //Once again, we must await the realtime listener to run.
      setTimeout(() => {
        res()
      }, 1000)
    })
    expect(commentStore.getComments.length).toBe(startingNumberOfComments + 1)

    // Delete fake comment
    //Tomorrows labour: I will need to get the commentId and likely manually set it on the componentShallowMount.

    console.log('is this anythign? : ', componentShallowMount.vm.commentId)
    await componentShallowMount.vm.deleteComment()

    // Test deleted comment
    await commentStore.fetchComments('entries', firstEntry.value.id)
    await new Promise((res, rej) => {
      //Once again, we must await the realtime listener to run.
      setTimeout(() => {
        res()
      }, 1000)
    })
    expect(commentStore.getComments.length).toBe(startingNumberOfComments - 1)
  })
  // SECOND TEST
  // it('Deletes the fake comment added in the first test', async () => {
  //   const commentStore = useCommentStore()
  //   const entryStore = useEntryStore()
  //   const firstEntry = ref({})

  //   await entryStore.fetchEntries()
  //   firstEntry.value = entryStore.getEntries[0]

  //   const userStore = useUserStore()
  //   const user = userStore.getUser

  //   await commentStore.fetchComments('entries', firstEntry.value.id)
  //   await new Promise((res, rej) => {
  //     //Once again, we must await the realtime listener to run.
  //     setTimeout(() => {
  //       res()
  //     }, 150)
  //   })
  //   const startingNumberOfComments = commentStore.getComments.length

  //   /** */
  //   const fakeCommentId = localStorage.getItem('id')
  //   console.log(fakeCommentId, startingNumberOfComments)
  //   const deleteComment = shallowMount(TheComments, {
  //     global: {
  //       mocks: {
  //         deleteComment: vi.fn(() => {
  //           commentStore.deleteComment('entries', firstEntry.value.id, fakeCommentId, user.uid)
  //         })
  //       }
  //     },
  //     props: {
  //       collectionName: 'entries',
  //       post: firstEntry.value
  //     }
  //   })

  //   // Delete fake comment
  //   await deleteComment.vm.deleteComment()

  //   // Test deleted comment
  //   await commentStore.fetchComments('entries', firstEntry.value.id)
  //   await new Promise((res, rej) => {
  //     //Once again, we must await the realtime listener to run.
  //     setTimeout(() => {
  //       res()
  //     }, 150)
  //   })
  //   expect(commentStore.getComments.length).toBe(startingNumberOfComments - 1)
  // })
})

afterAll(async () => {
  localStorage.clear()
})
