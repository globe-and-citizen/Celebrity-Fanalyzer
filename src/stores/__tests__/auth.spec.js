import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useUserStore } from '../user.js'

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should load and work', () => {
    const userStore = useUserStore()

    const a = 7
    const b = 10
    expect(a + b).toEqual(17)
    expect(userStore).toBeDefined()
  })
})
