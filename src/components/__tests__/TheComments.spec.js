//Firebase
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth, db } from 'src/firebase'

//Testing Frameworks
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { config, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import commentCard from 'src/components/TheComments.vue'
import { useCommentStore, useEntryStore } from 'src/stores'
import { useUserStore } from 'src/stores/user'
import { ref } from 'vue'

import { createRouterMock, injectRouterMock, VueRouterMock } from 'vue-router-mock'
config.plugins.VueWrapper.install(VueRouterMock)

installQuasar()

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
    const userString = '{"sub": "WCeN1oLBMndoLKzNBCS7RccV9cz1?", "email": "algae.peach.153@example.com", "email_verified": true}'
    const credential = GoogleAuthProvider.credential(userString)
    const result = await signInWithCredential(auth, credential)
    const isNewUser = getAdditionalUserInfo(result)?.isNewUser
    const { email, displayName, photoURL, uid } = result.user

    if (isNewUser) {
      try {
        await setDoc(doc(db, 'users', uid), { email, displayName, photoURL })
      } catch (e) {
        console.error('TheComments.spec.js Error: ', e)
      }
    }
    await userStore.testing_loadUserProfile(result.user)
  })

  // FIRST TEST
  it('create fake comment in here', async () => {
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })

    const commenStore = useCommentStore()
    const entryStore = useEntryStore()
    const firstEntry = ref({})

    // Get slug of first entry,
    // this slug is used for fetching entry and add comment to that entry
    await entryStore.fetchEntries()
    firstEntry.value = entryStore.getEntries[0]

    // User is coming, it is used for getting userId
    const userStore = useUserStore()
    const user = userStore.getUser

    // Getting all comments of first entry
    await commenStore.fetchComments(firstEntry.value.id)

    const startingNumberOfComments = commenStore.getComments.length
    const fakeCommentId = `${2000 + Math.round(Math.random() * 100)}-01`

    const fakeComment = shallowMount(commentCard, {
      global: {
        mocks: {
          addComment: vi.fn(() => {
            commenStore.addComment(fakeComment.vm.myComment, firstEntry.value)
          }),
          editComment: vi.fn(() => {
            commenStore.editComment(firstEntry.value.id, fakeCommentId, editedComment, user.uid)
          })
        }
      },
      props: {
        comments: [],
        entry: { slug: firstEntry.value.slug }
      }
    })

    fakeComment.vm.myComment.text = 'test my comment'
    fakeComment.vm.myComment.id = fakeCommentId

    const editedComment = 'Edited fake comment!'

    // 3) Adding fake comment
    await fakeComment.vm.addComment() //Mocked

    // 4) Test added fake comment
    await commenStore.fetchComments(firstEntry.value.id)
    expect(commenStore.getComments.length).toBe(startingNumberOfComments + 1)

    // 5) Edit test
    await fakeComment.vm.editComment()
    expect(editedComment).toBe('Edited fake comment!')
  }),
    // SECOND TEST
    it('delete fake comment in here', async () => {
      const commenStore = useCommentStore()
      const entryStore = useEntryStore()
      const firstEntry = ref({})

      await entryStore.fetchEntries()
      firstEntry.value = entryStore.getEntries[0]

      const userStore = useUserStore()
      const user = userStore.getUser

      await commenStore.fetchComments(firstEntry.value.id)

      const startingNumberOfComments = commenStore.getComments.length
      const fakeCommentId = localStorage.getItem('id')
      const deleteComment = shallowMount(commentCard, {
        global: {
          mocks: {
            deleteComment: vi.fn(() => {
              commenStore.deleteComment(firstEntry.value.id, fakeCommentId, user.uid)
            })
          }
        },
        props: {
          comments: [],
          entry: { slug: firstEntry.value.slug }
        }
      })

      // Delete fake comment
      await deleteComment.vm.deleteComment()

      // Test deleted comment
      await commenStore.fetchComments(firstEntry.value.id)
      expect(commenStore.getComments.length).toBe(startingNumberOfComments - 1)
    })
})

afterAll(async () => {
  localStorage.clear()
})
