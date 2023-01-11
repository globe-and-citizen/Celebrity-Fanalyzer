<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo" :class="[todo.completed ? 'completed' : '']">
      {{ todo.text }}
      <input type="checkbox" v-model="todo.completed" data-test="todo-checkbox" />
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newTodo = ref('')

const todos = ref([
  {
    id: 1,
    text: 'Learn Vue.js 3',
    completed: false
  }
])

function createTodo() {
  console.log('yup clicked')
  todos.value.push({
    id: 2,
    text: newTodo.value,
    completed: false
  })
  console.log(todos.value)
}
</script>
