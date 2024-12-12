<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Layer8Init } from 'src/utils/layer8Init'
onMounted(async () => {
  await Layer8Init()
})
</script>
