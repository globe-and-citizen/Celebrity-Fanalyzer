import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from '../todos.js'
import { beforeEach, describe, expect, it, test } from 'vitest'

describe('todoAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should not be loading in the beginning', () => {
    const todoStore = useTodoStore()
    expect(todoStore._isLoading).toBe(false)
  })

  it('should return data from the mocked database', async () => {
    const todoStore = useTodoStore()
    const data = await todoStore.fetchData()
    expect(data[0]).toMatchObject({
      id: 1,
      text: 'Run unit tests on a store',
      completed: true
    })
  })
})
