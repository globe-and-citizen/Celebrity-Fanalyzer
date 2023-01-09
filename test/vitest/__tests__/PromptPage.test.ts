import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount } from '@vue/test-utils'
import StoreComponent from 'pages/PromptPage.vue'
import { describe, it } from 'vitest'
import { installPinia } from './install-pinia'

// Documentation: https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store

installQuasar()
installPinia({ stubActions: false })

describe('prompt store', () => {
  it('should fetch all the prompts', async () => {
    const wrapper = mount(StoreComponent)
    console.log(wrapper)

    // TODO: Figure out how to work with Firebase environment variables

    // const store = usePromptStore()
    // expect(wrapper.text()).toContain(0)
    // const btn = wrapper.get('button')
    // expect(store.fetchPrompts).toBeUndefined()
  })
})
