// Third Party Imports
import { auth } from '../../firebase'
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { doc } from 'firebase/firestore'
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { db } from 'src/firebase'
import { shallowMount } from '@vue/test-utils'

// Celebrity Fanalyzer Components
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import { useShareStore } from 'src/stores/shares.js'
import { useUserStore } from 'src/stores/user.js'

installQuasar()

describe('Mounting Pie Graph', () => {
  // Top Level Variables
  const entryId = '2023-01T1674272496522'
  const socialNetworkArray = [
    'Clipboard',
    'Discord',
    'Facebook',
    'LinkedIn',
    'Odnoklassniki',
    'Pinterest',
    'Reddit',
    'Telegram',
    'Twitter',
    'WhatsApp'
  ]

  beforeEach(async () => {
    //Login and then clear the Emulator's shareStore
    setActivePinia(createPinia())
    const userStore = useUserStore()
    const userString = '{"sub": "WCeN1oLBMndoLKzNBCS7RccV9cz1", "email": "algae.peach.153@example.com", "email_verified": true}'
    const credential = GoogleAuthProvider.credential(userString)
    const result = await signInWithCredential(auth, credential)
    await userStore.testing_loadUserProfile(result.user) // sets user in localstroage
    const shareStore = useShareStore()
    const entryId = '2023-01T1674272496522'
    shareStore.deleteAllShares('entries', entryId)
    localStorage.clear()
  })

  it('should be able to shallowMount the SharesPie with props passed in manually.', async () => {
    const wrapper = shallowMount(SharesPie, {
      props: {
        interval: 'all',
        data: [
          {
            author: 'Anonymous',
            createdAt: { nanoseconds: 389000000, seconds: 1678996580 },
            sharedOn: 'clipboard'
          },
          {
            author: doc(db, 'users', 'oz2LqNmNcSPyC6TSVFaiXBBZAeQ2'),
            createdAt: { seconds: 1677509860, nanoseconds: 296000000 },
            sharedOn: 'twitter'
          },
          {
            author: doc(db, 'users', 'r3C28i2x4RUuqn2jrt69A5K6RcC3'),
            createdAt: { seconds: 1677509877, nanoseconds: 5000000 },
            sharedOn: 'linkedin'
          },
          {
            author: 'Anonymous',
            createdAt: { seconds: 1677509869, nanoseconds: 729000000 },
            sharedOn: 'whatsapp'
          }
        ]
      }
    })
    expect(wrapper.vm.sharesCount).toBe(4)
    expect(wrapper.html()).toBeDefined()
  })

  it('should reflect changes to the share store updated programmatically.', async () => {
    const shareStore = useShareStore()

    await shareStore.fetchShares('entries', entryId)

    const wrapper = await shallowMount(SharesPie, {
      props: {
        interval: 'all',
        data: await shareStore.getShares
      }
    })

    expect(wrapper.sharesCount).toBe(undefined)

    //Add More Shares & Re-Fetch to refresh the shareStore
    await shareStore.addShare('entries', entryId, socialNetworkArray[0]).catch((error) => errorStore.throwError(error))
    await shareStore.addShare('entries', entryId, socialNetworkArray[1]).catch((error) => errorStore.throwError(error))
    await shareStore.addShare('entries', entryId, socialNetworkArray[2]).catch((error) => errorStore.throwError(error))
    await shareStore.addShare('entries', entryId, socialNetworkArray[3]).catch((error) => errorStore.throwError(error))
    await shareStore.addShare('entries', entryId, socialNetworkArray[4]).catch((error) => errorStore.throwError(error))
    await shareStore.addShare('entries', entryId, socialNetworkArray[5]).catch((error) => errorStore.throwError(error))
    await shareStore.fetchShares('entries', '2023-01T1674272496522')

    // Remount to trigger the watch effect
    const wrapper2 = await shallowMount(SharesPie, {
      props: {
        interval: 'all',
        data: await shareStore.getShares
      }
    })

    expect(wrapper2.vm.sharesCount).toBe(6)
  })

  it('it should have a working intervalFunction if "data" passed in fits day, week, or all', () => {
    const wrapper = shallowMount(SharesPie, {
      props: {
        interval: 'all',
        data: [
          {
            author: 'Anonymous',
            createdAt: { nanoseconds: 389000000, seconds: 1678996580 },
            sharedOn: 'clipboard'
          },
          {
            author: doc(db, 'users', 'oz2LqNmNcSPyC6TSVFaiXBBZAeQ2'),
            createdAt: { seconds: 1677509860, nanoseconds: 296000000 },
            sharedOn: 'twitter'
          },
          {
            author: doc(db, 'users', 'r3C28i2x4RUuqn2jrt69A5K6RcC3'),
            createdAt: { seconds: 1677509877, nanoseconds: 5000000 },
            sharedOn: 'linkedin'
          },
          {
            author: 'Anonymous',
            createdAt: { seconds: 1677509869, nanoseconds: 729000000 },
            sharedOn: 'whatsapp'
          }
        ]
      }
    })
    //Tests to be written.
    // expect(wrapper.vm.intervalFunctions['day']).toBeDefined()
    // expect(wrapper.vm.intervalFunctions['week']).toBeDefined()
    // expect(wrapper.vm.intervalFunctions['all']).toBeDefined()
  })
})
