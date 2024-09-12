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

const asciiLogo = `
@@@@@@@@@@@@@@@@@@@(((@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@(((((((((((((((((((@@@@@@@@@@s
@@@@@@@(((((((((((((((((((((((((((@@@@@@
@@@@@((((((((((((((( (((((((((((((((@@@@
@@@((((((((((((((((   ((((((((((((((((@@
@@(((((((((((((((       (((((((((((((((@
@(((((((((((((((         (((((((((((((((
@(((((((                         (((((((
(((((((((((                   ((((((((((
@((((((((((((               ((((((((((((
@(((((((((((((             (((((((((((((
@@(((((((((((      (((      (((((((((((@
@@@(((((((((     (((((((     (((((((((@@
@@@@@((((((( *(((((((((((((. (((((((@@@@
@@@@@@@(((((((((((((((((((((((((((@@@@@@
@@@@@@@@@@@(((((((((((((((((((@@@@@@@@@@

Don't hack us, contribute with us:
https://github.com/globe-and-citizen/Celebrity-Fanalyzer`

console.log(asciiLogo)
onMounted(async () => {
  await Layer8Init()
})
</script>
