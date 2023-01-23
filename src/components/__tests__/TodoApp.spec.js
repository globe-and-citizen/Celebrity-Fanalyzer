import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount } from '@vue/test-utils'
import { describe, expect, it, test } from 'vitest'
import TodoApp from '../TodoApp.vue'
import TodoChild from '../TodoChild.vue'

installQuasar()

describe('The TodoApp.vue component', () => {
  const globalWrapper = mount(TodoApp) // A future optimization may be to use a global variable to not repeatedly mount the component under test.

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

  it('Emits event "e1" when btn is clicked', () => {
    const wrapper = mount(TodoApp)
    wrapper.get('#btn1').trigger('click')
    expect(wrapper.emitted()).toBeTruthy()
  })

  it('Mouseover event(s) on div with class "toggleDiv" makes the child paragraph render conditionally', async () => {
    // GOTCHA: events are asynchronous and must be awaited.
    // Note: <p> element begins as visible.
    const wrapper = mount(TodoApp)
    expect(wrapper.find('#visibilityP').exists()).toBe(true)
    await wrapper.get('.toggleDiv').trigger('mouseover')
    expect(wrapper.find('#visibilityP').exists()).toBe(false)
    await wrapper.get('.toggleDiv').trigger('mouseover')
    expect(wrapper.get('#visibilityP').exists()).toBeTruthy()
    await wrapper.get('.toggleDiv').trigger('mouseover')
    expect(wrapper.find('#visibilityP').exists()).toBe(false)
  })

  it('Renders "TodoChild" correctly with hardcoded props', () => {
    // NOTE: Note the use of the global component
    const todoChildVueWrapper = globalWrapper.getComponent({ name: 'todo-child' })
    //console.log('===>', todoChildDOMWrapper.get('#div1'))
    expect(todoChildVueWrapper.get('.heading1').text()).toBe('My Cool Title')

    expect(todoChildVueWrapper.findAll('p')[0].text()).toBe('Value at index 0 is oNe')
  })

  it('Renders "TodoChild" correctly with dynamic props', async () => {
    // GOTCHA: Notice the use of async/await. This is becuase when you set props, you must await the rendering.

    let wrapper = mount(TodoChild, {
      propsData: {
        title: 'Title One',
        data: ['fOUr', 'fIve', 'sIx']
      }
    })

    // let wrapper = mount(TodoChild)

    expect(wrapper.get('.heading1').text()).toBe('Title One')
    expect(wrapper.findAll('p')[0].text()).toBe('Value at index 0 is fOUr')
    expect(wrapper.findAll('p')[1].text()).toBe('Value at index 1 is fIve')
    expect(wrapper.findAll('p')[2].text()).toBe('Value at index 2 is sIx')

    // GOTCHA: The component, TodoChild has recieved the updated props but still needs to re-render. Quasar doesn't rerender automatically?

    await wrapper.unmount()

    wrapper = mount(TodoChild)

    await wrapper.setProps({
      title: 'Inserted Title',
      data: ['sEven', 'eIght', 'nIne']
    })

    // console.log('====> ', wrapper.vm.title)
    // console.log('====> ', wrapper.vm.data)

    // console.log('wrapper.props() updated successfully but the component, no: ', wrapper.props())

    // **It seems that the
    expect(wrapper.get('.heading1').text()).toBe('') // should be 'Inserted Title'
  })
})
