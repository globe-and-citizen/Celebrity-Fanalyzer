<template>
  <!--  <div v-if="statsStore.getInitializedState">-->
  <router-view />
  <!--  </div>-->
  <!--  <div class="flex" v-else>-->
  <!--    Establishing encrypted tunnel...-->
  <!--    <q-spinner class="q-mx-auto" color="primary" size="3em" style="width: 50%" />-->
  <!--  </div>-->
</template>

<script setup>
import { onMounted } from 'vue'
import { useStatStore } from 'src/stores'
import layer8 from 'layer8_interceptor'

const statsStore = useStatStore()
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

onMounted(async () => {
  try {
    await layer8.initEncryptedTunnel(
      {
        providers: ['https://stats-api.up.railway.app/v1'],
        proxy: 'https://layer8proxy.net'
      },
      'dev'
    )
    statsStore.setInitialized(true)
  } catch (err) {
    console.log('.initEncryptedTunnel error: ', err)
  }
})

console.log(asciiLogo)
</script>
