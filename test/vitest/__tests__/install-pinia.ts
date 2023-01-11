import { createTestingPinia } from '@pinia/testing'
import { config } from '@vue/test-utils'
import { cloneDeep } from 'lodash-es'
import { afterAll, beforeAll, vi } from 'vitest'

export function installPinia() {
  const globalConfigBackup = cloneDeep(config.global)

  beforeAll(() => {
    config.global.plugins.unshift(
      // This is needed because typescript will complain othwerwise
      // Probably due to this being a monorepo as this same setup inside a test project did work correctly
      createTestingPinia({ createSpy: vi.fn })
    )
  })

  afterAll(() => {
    config.global = globalConfigBackup
  })
}
