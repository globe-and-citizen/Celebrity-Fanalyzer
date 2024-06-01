<template>
  <TheHeader feedbackButton notificationButton title="Advertiser">
    <q-btn v-if="userStore.isAdvertiser" color="primary" @click="openAdvertiseDialog">Add</q-btn>
  </TheHeader>
  <q-page-container>
    <!-- <q-spinner v-if="advertiseStore.getAdvertises.length <= 0" class="absolute-center z-fab" color="primary" size="3em" /> -->
    <q-spinner v-if="advertiseStore.isLoading" class="absolute-center z-fab" color="primary" size="3em" />

    <q-page class="absolute q-pt-sm q-pb-xl window-width" style="left: 0">
      <q-dialog class="min-" position="bottom" v-model="advertise.dialog">
        <AdvertiseCard v-bind="advertise" @hideDialog="advertise = {}" />
      </q-dialog>
      <ManageAdvertises @openAdvertiseDialog="openAdvertiseDialog" />
    </q-page>
  </q-page-container>
</template>
<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import AdvertiseCard from '../components/Advertiser/AdvertiseCard.vue'
import ManageAdvertises from '../components/Advertiser/ManageAdvertises.vue'
import { useUserStore, useAdvertiseStore } from 'src/stores'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const advertise = ref({})
const advertiseStore = useAdvertiseStore()
const userStore = useUserStore()

onMounted(() => {
  advertiseStore.fetchAdvertises().catch((error) => console.log(error))
})

function openAdvertiseDialog(props) {
  advertise.value = props?.id ? props : {}
  advertise.value.dialog = true
}
</script>
