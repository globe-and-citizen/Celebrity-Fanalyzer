import {describe, expect, it} from 'vitest'
import {mount} from '@vue/test-utils'

import ArticleSkeleton from "../ArticleSkeleton.vue";

describe('Testing ArticleSkeleton', () => {
  it('should be able to mount the ArticleSkeleton', () => {
    const wrapper = mount(ArticleSkeleton)
    expect(wrapper).toBeDefined()
  })
})
