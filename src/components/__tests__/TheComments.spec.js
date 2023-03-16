//Firebase
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth, db } from 'src/firebase'

//Testing Frameworks
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount, shallowMount, config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vitest, vi, afterAll } from 'vitest'

// Necessary Components
import { useUserStore } from 'src/stores/user'
import { useCommentStore, useEntryStore } from 'src/stores'
import commentCard from '../TheComments.vue'
import { ref, reactive } from 'vue'

import { VueRouterMock, createRouterMock, injectRouterMock } from 'vue-router-mock'
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

  it('create fake comment in here', async () => {
    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return '255.255.255.255'
        }
      }
    })
    // 2) Create fake comment
    const commenStore = useCommentStore()
    const entryStore = useEntryStore()
    const entry = ref({})

    const userStore = useUserStore()
    const user = userStore.getUser

    await commenStore.fetchComments("/2023/03/pompt-entry-3")
    await entryStore.fetchEntryBySlug("/2023/03/pompt-entry-3")

    await entryStore
      .fetchEntryBySlug("/2023/03/pompt-entry-3")
      .then((res) => (
        entry.value = res
      ))
      .catch(() => (entry.value = null))

    const startingNumberOfComments = commenStore.getComments.length
    console.log("Length of original comments", startingNumberOfComments);
    const fakeCommentId = `${2000 + Math.round(Math.random() * 100)}-01`
    const fakeComment = shallowMount(commentCard, {
      global: {
        mocks: {
          testMock: vi.fn(() => {
            console.log('This mock is just a dummy')
          }),
          addComment: vi.fn(()=>{
            console.log("I'm fake!")
            commenStore.addComment(fakeComment.vm.myComment, entry.value)
          }),
          // editComment: vi.fn(()=>{
          //   console.log("Edited fake comment!")
          //   // commenStore.editComment(entry.value.id, fakeCommentId, fakeComment.vm.editedComment, user.uid)
          // }),
          deleteComment: vi.fn(()=>{
            console.log("Deleted fake comment")
            commenStore.deleteComment(entry.value.id, fakeCommentId, user.uid)
          })
        }
      },
      props: {
        comments: [],
        entry: { slug: '/2023/03/pompt-entry-3' }
      }
    })


    fakeComment.vm.myComment.text = 'test my comment'
    fakeComment.vm.editedComment = 'test child comment'
    fakeComment.vm.myComment.id = fakeCommentId

    // 3) Trigger submission programatically
    await fakeComment.vm.addComment(fakeComment.vm.myComment, entry.value) //Mocked

    // 4) Test
    await commenStore.fetchComments("/2023/03/pompt-entry-3")
    expect(commenStore.getComments.length).toBe(startingNumberOfComments + 1)
    console.log("After adding comment", commenStore.getComments.length);

    // 5) Edit test
    // fakeComment.vm.editComment(entry.value.id, fakeCommentId, fakeComment.vm.editedComment, user.uid)
    // expect(fakeComment.vm.myComment.text).toBe('test child comment')

    // 5) Delete fake comment
    await fakeComment.vm.deleteComment(entry.value.id, fakeCommentId, user.uid)

    await commenStore.fetchComments("/2023/03/pompt-entry-3")
    expect(commenStore.getComments.length).toBe(startingNumberOfComments)
    console.log("After deleting comment", startingNumberOfComments);
  })

  afterAll(async () => {
    localStorage.clear()
  })
})
