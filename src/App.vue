<template>
  <router-view />
</template>

<script setup>
import layer8 from 'layer8_interceptor'
import { onMounted } from 'vue'

const asciiLogo = `
@@@@@@@@@@@@@@@@@@@(((@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@(((((((((((((((((((@@@@@@@@@@
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

onMounted(() => {
  try {
    layer8.initEncryptedTunnel(
      {
        providers: ['https://stats-api.up.railway.app/v1'],
        proxy: 'https://layer8proxy.net'
      },
      'dev'
    )
  } catch (err) {
    console.log('.initEncryptedTunnel error: ', err)
  }

  // Replace for dev environment and testing with stats-api
  // try {
  //   layer8.initEncryptedTunnel(
  //     {
  //       providers: ['http://localhost:6001/v1'], // An array of service providers you want to connect to
  //       proxy: 'http://localhost:5001' // Your local proxy instance. Necessary only if the mode is "dev".
  //     },
  //     'dev'
  //   ) // If omitted, the default is production mode.
  // } catch (err) {
  //   console.log('.initEncryptedTunnel error: ', err)
  // }
})

console.log(asciiLogo)
</script>
