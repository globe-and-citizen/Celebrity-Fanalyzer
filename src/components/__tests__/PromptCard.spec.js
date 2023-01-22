import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import PromptCard from '../PromptCard.vue'

import { date, useQuasar } from 'quasar'
import { usePromptStore } from 'src/stores'
//import { shortMonthDay } from 'src/utils/date'
//import { reactive, ref, watchEffect } from 'vue'

installQuasar()

describe('PromptCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should load/ reload', () => {
    const ONE = 1
    expect(ONE).toBe(1)
  })

  it('should be able to mount', () => {
    console.log(PromptCard)

    let propsObject = {
      author: {
        data1: '',
        data2: '',
        displayName: '',
        email: '',
        photoUrl: null,
        role: '',
        uid: ''
      },
      categories: null,
      created: Date.now,
      date: date.formatDate(Date.now(), 'YYYY-MM'),
      description: '',
      id: '',
      image: '',
      info: { dislikes: [], likes: [], shares: 0 },
      title: ''
    }

    // const promptStore = usePromptStore()
    const promptCard = shallowMount(PromptCard, {
      propsData: propsObject
    })
  })
})
