import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLikeStore } from '../likes.js'

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have empty likes count', () => {
    const likeStore = useLikeStore()
    expect(likeStore._likes.length).toBe(0)
    expect(likeStore._dislikes.length).toBe(0)
  })
})
