import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount } from '@vue/test-utils'
import { describe, expect, it, test } from 'vitest'
import TodoApp from '../TodoApp.vue'

installQuasar()

describe('Todo', () => {
  it('Renders / mounts TodoApp.vue', () => {
    const wrapper = mount(TodoApp)
    expect(wrapper).toBeTruthy()
  })

  test('loads custom ref()s from the setup script', () => {
    const wrapper = mount(TodoApp)
    expect(wrapper.get('[data-test="todo"]').text()).toBe('Learn Vue.js 3')
  })

  it('creates a todo', async () => {
    const wrapper = mount(TodoApp)
    expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1)

    wrapper.get('[data-test="new-todo"]').setValue('New todo')

    await wrapper.get('[data-test="form"]').trigger('submit')

    expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
  })

  test('completes a todo', async () => {
    const wrapper = mount(TodoApp)

    await wrapper.get('[data-test="todo-checkbox"]').setValue(true)

    expect(wrapper.get('[data-test="todo"]').classes()).toContain('completed')
  })
})
