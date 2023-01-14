import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { usePromptStore } from 'src/stores'
import { describe, expect, it } from 'vitest'
import { installPinia } from './install-pinia'

// Documentation: https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store

installQuasar()
installPinia()

describe('sum method', () => {
  it('should sum 1 + 1', async () => {
    expect(1 + 1).toBe(2)
  })
})

describe('prompt store', () => {
  it('should fetch all the prompts', async () => {
    const store = usePromptStore()
    await store.fetchPrompts()
    console.log('store._prompts', store._prompts)

    expect(store.getPrompts).not.toBeUndefined()
  })
})
