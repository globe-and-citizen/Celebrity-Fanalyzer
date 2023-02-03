import { beforeEach, describe, expect, it, test } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.js'

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should load and work', () => {
    const authStore = useAuthStore()

    const a = 7
    const b = 10
    expect(a + b).toEqual(17)
    expect(authStore).toBeDefined()
  })
})
