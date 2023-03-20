//Testing Frameworks
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { describe, expect, it } from 'vitest'

// Necessary Components
import { shallowMount } from '@vue/test-utils'
import { doc } from 'firebase/firestore'
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import { db } from 'src/firebase'

installQuasar()

describe('Mounting Pie Graph', () => {
  it('should be able to mount the SharesPie', async () => {
    const wrapper = shallowMount(SharesPie, {
      props: {
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
    expect(wrapper).toBeDefined()
  })
})
