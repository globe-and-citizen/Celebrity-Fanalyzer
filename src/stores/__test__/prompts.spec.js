import { setActivePinia, createPinia } from 'pinia'
import { usePromptStore } from '../prompts.js'
import { beforeEach, describe, expect, it, test } from 'vitest'

describe('promptsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have the correct initial state', () => {
    const promptStore = usePromptStore()
    expect(promptStore._isLoading).toBe(false)
    expect(promptStore._monthPrompt).toBe(null)
    expect(promptStore._prompts).toHaveLength(0)
  })

  it('should have all store actions working', async () => {
    const promptStore = usePromptStore()

    await promptStore.fetchMonthPrompt()
    const propertiesExpected = ['id', 'date', 'image', 'created', 'description', 'title', 'entries', 'categories', 'slug', 'info']
    for (let prop of propertiesExpected) {
      expect(promptStore._monthPrompt).toHaveProperty(prop)
    }

    const januaryPrompt = await promptStore.fetchPromptById('2023-01')
    expect(januaryPrompt).toHaveProperty('date', '2023-01')
    expect(januaryPrompt.entries).toHaveLength(2)

    const promptBySlug = await promptStore.fetchPromptBySlug('jan-20-prompt-2')
    expect(promptBySlug.entries).toHaveLength(2)
    expect(promptBySlug.entries[0].id).toMatch(/(\d){4}-(\w){16}/)

    const promptByYear = await promptStore.fetchPromptsByYear('2023')
    //Should this not be three?
    expect(promptByYear).toHaveLength(3)
  })
})
