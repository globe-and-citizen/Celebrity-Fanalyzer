//Testing Frameworks
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Necessary Components
import { usePromptStore, useVisitorStore } from 'src/stores'
import { waitUntil } from 'src/utils/waitUntil'

describe('Users Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())

    global.fetch = vi.fn(async () => {
      return {
        text: () => {
          return `ip=Vitest-${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}` // Vitest-245.256
        }
      }
    })
  })

  it('Should read visitors and add a new one', async () => {
    const promptStore = usePromptStore()
    const visitorStore = useVisitorStore()

    await promptStore.fetchPrompts()
    await waitUntil(() => promptStore.getPrompts.length)
    const firstPrompt = promptStore.getPrompts[0]

    await visitorStore.readVisitors('prompts', firstPrompt.id)
    await waitUntil(() => visitorStore.getVisitors)
    const visitorsBefore = visitorStore.getVisitors.length

    await visitorStore.addVisitor('prompts', firstPrompt.id)
    await waitUntil(() => visitorStore.getVisitors.length > visitorsBefore)
    const visitorsAfter = visitorStore.getVisitors.length

    expect(visitorsAfter).toBeGreaterThan(visitorsBefore)
  })
})
