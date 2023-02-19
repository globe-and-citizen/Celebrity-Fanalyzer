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
  })

  it('should run', async () => {
    expect(1).toEqual(1)
  })
})
