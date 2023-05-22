import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ArticleSkeleton from '../ArticleSkeleton.vue'

describe('Testing ArticleSkeleton', async () => {
  it('should be able to mount the ArticleSkeleton', () => {
    const wrapper = shallowMount(ArticleSkeleton)
    expect(wrapper).toBeDefined()
  })
})
