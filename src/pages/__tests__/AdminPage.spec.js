import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, test } from 'vitest'
import AdminPage from '../AdminPage.vue'
import PromptCard from '../../components/PromptCard.vue'

installQuasar()

describe('adminPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should load/ reload', () => {
    const ONE = 1
    expect(ONE).toBe(1)
  })

  it('should be able to mount the AdminPage', async () => {
    console.log(AdminPage)
    const adminPageWrapper = mount(AdminPage)
    expect(adminPageWrapper).toBeDefined()
    //adminPageWrapper.get
    // const PromptCard = mount(PromptCard)
    // expect(PromptCard).toBeDefined()
  })

  // it('should be able to mount the PromptCard', () => {
  //   const PromptCard = mount(PromptCard)
  //   expect(PromptCard).toBeDefined()
  // })
})
