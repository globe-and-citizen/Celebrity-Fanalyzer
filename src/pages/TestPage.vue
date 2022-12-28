<template>
  <div><h1>Welcome to test page</h1>
  </div>
</template>

<script setup>
import { usePromptStore } from 'src/stores'
import { onMounted, ref } from "vue";

const promptStore = usePromptStore()
const prompts = ref([])

onMounted(async () => {
  await promptStore.fetchPrompts().then(()=>{
    prompts.value = promptStore.getPrompts
    console.log(prompts.value);
  })
})

</script>

<style scoped></style>
