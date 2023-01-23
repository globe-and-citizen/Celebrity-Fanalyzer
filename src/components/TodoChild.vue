<template>
  <div id="div1">
    <h1 class="heading1">{{ title }}</h1>
    <div id="div2" v-for="(val, i) of data" :key="i">
      <p>Value at index {{ i }} is {{ val }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: false },
  data: { type: Array, required: false }
})

const clickCount = ref(0)

const title = ref(props.title)
const data = ref(props.data)
</script>
