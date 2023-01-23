<template>
  <div id="div1" class="myDiv">
    <div id="div2" v-for="todo in todos" :key="todo.id" data-test="todo" :class="[todo.completed ? 'completed' : '']">
      {{ todo.text }}
      <input type="checkbox" v-model="todo.completed" data-test="todo-checkbox" />
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>

    <button id="btn1" @click="emitEvent">Click-to-Emit!</button>

    <div id="div3">
      <div class="toggleDiv" @mouseover="toggleP = !toggleP">Toggle Div</div>
      <p id="visibilityP" v-if="toggleP">I show when the toggle switch is true. Mouseover "toggleDiv" to toggle me on/off</p>
    </div>

    <todo-child :title="title" :data="dataArray"></todo-child>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TodoChild from './TodoChild.vue'

const title = ref('My Cool Title')
const dataArray = ref(['oNe', 'tWo', 'tHree'])

const toggleP = ref(true)

const newTodo = ref('')
const emit = defineEmits(['e1', 'e2', 'e3'])

const todos = ref([
  {
    id: 1,
    text: 'Learn Vue.js 3',
    completed: false
  }
])

function emitEvent() {
  emit('e1')
}

function createTodo() {
  todos.value.push({
    id: 2,
    text: newTodo.value,
    completed: false
  })
  console.log(todos.value)
}
</script>
