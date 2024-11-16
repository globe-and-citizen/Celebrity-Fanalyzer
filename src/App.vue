<template>
  <VueQueryDevtools />
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Layer8Init } from 'src/utils/layer8Init'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

onMounted(async () => {
  await Layer8Init()
})
</script>
