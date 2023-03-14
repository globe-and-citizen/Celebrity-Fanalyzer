//Testing Frameworks
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { describe, expect, it } from 'vitest'

// Necessary Components
import { shallowMount } from '@vue/test-utils'
import BarGraph from 'src/components/BarGraph.vue'

installQuasar()

describe('Mounting Bar Graph', () => {
  it('should be able to mount the Bargraph', async () => {
    const wrapper = shallowMount(BarGraph, {
      props: {
        data: [{
          "date": {"seconds": 1676764800, "nanoseconds": 0},
          "likes": 1,
          "dislikes": 0,
          "label": "19/2"
        }, {
          "date": {"seconds": 1676851200, "nanoseconds": 0},
          "likes": 0,
          "dislikes": 0,
          "label": "20/2"
        }, {
          "date": {"seconds": 1676937600, "nanoseconds": 0},
          "likes": 0,
          "dislikes": 0,
          "label": "21/2"
        }, {"date": {"seconds": 1677024000, "nanoseconds": 0}, "likes": 0, "dislikes": 0, "label": "22/2"}]
      }
    })
    expect(wrapper).toBeDefined()
  })
})
