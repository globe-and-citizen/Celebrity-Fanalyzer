import { installQuasar } from '@quasar/'
import { mount, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vitest } from 'vitest'
import ArticleSkeleton from '../ArticleSkeleton.vue'

installQuasar()

describe('Testing ArticleSkeleton', async () => {
  it('should be able to mount the ArticleSkeleton', () => {
    const wrapper = shallowMount(ArticleSkeleton)
    expect(wrapper).toBeDefined()
  })
})
