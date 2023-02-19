//Testing Frameworks
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vitest } from 'vitest'

// Necessary Components
import { mount, shallowMount } from '@vue/test-utils'
import BarGraph from 'src/components/BarGraph.vue'

installQuasar()

describe('Mounting Bargraph', () => {
  it('should be able to mount the Bargraph', async () => {
    const wrapper = shallowMount(BarGraph)
  })
})
