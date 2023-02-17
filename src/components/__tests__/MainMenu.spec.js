//Firebase
import { auth, db } from '../../firebase'
import { signInWithCredential, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth'

//Testing Frameworks
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vitest } from 'vitest'
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'

// Necessary Components
import MainMenu from '../MainMenu.vue'
import { useUserStore } from '../../stores/user'
import { mount } from '@vue/test-utils'

installQuasar()

describe('Main Menu Component', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    const userStore = useUserStore()
    const userString = '{"sub": "whatSubout?", "email": "algae.peach.153@example.com", "email_verified": true}'
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
    await userStore.fetchUserProfile(result.user)
  })

  it('should display the admin panel if the user logged has the admin role', async () => {
    const userStore = useUserStore()
    const admin = userStore.isAdmin

    expect(admin).toBe(true)
    let localUserString = localStorage.getItem('user')
    expect(localUserString.indexOf('role')).toBeTruthy()

    const mockRouter = {
      push: vitest.fn()
    }

    const wrapper = mount(MainMenu)

    expect(wrapper.find('[to="/admin"]').exists()).toEqual(true)
  })
})
