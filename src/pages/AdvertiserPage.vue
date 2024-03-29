<template>
  <TheHeader feedbackButton notificationButton title="Advertiser">
  <q-btn v-if="userStore.isAdvertiser" color="primary" @click="open=true" >Add </q-btn>
  </TheHeader>

  <q-spinner v-if="userStore.isLoading" class="absolute-center z-fab" color="primary" size="3em" />
  <q-page-container>
    <q-page >
     <q-dialog class="min-" position="bottom" v-model="open">
        <AdvertiseCard v-bind="advertise" @hideDialog="prompt = {}" />
      </q-dialog>
    </q-page>
  </q-page-container>
</template>
<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import AdvertiseCard from "../components/Advertiser/AdvertiseCard.vue"
import { useUserStore } from 'src/stores'
import { ref } from 'vue'

const open=ref(false)
const advertise =ref({})

const userStore = useUserStore()
</script>
