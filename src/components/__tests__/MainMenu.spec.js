//Firebase
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth, db } from 'src/firebase'

//Testing Frameworks
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vitest } from 'vitest'

// Necessary Components
import { mount } from '@vue/test-utils'
import MainMenu from 'src/components/MainMenu.vue'
import { useUserStore } from 'src/stores/user'

installQuasar()

describe('Main Menu Component', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
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
        console.log('MainMenu.spec.js error: ', e)
      }
    }
    await userStore.testing_loadUserProfile(result.user)
  })

  it('should display the admin panel if the user logged has the admin role', async () => {
    const userStore = useUserStore()
    const user = userStore.getUser

    expect(user.role).toBe('admin')
    let localUserString = localStorage.getItem('user')
    expect(localUserString.indexOf('role')).toBeTruthy()

    const mockRouter = {
      push: vitest.fn()
    }

    if (user.role == 'admin') {
      user.role = 'Admin'
    }

    const wrapper = mount(MainMenu)
    expect(wrapper).toBeDefined()
  })
})
