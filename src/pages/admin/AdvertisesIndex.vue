<template>
  <div><AdvertiserTable :advertises="advertises" @openAdvertiseDialog="openDialog" /></div>
</template>
<script setup>
import { useAdvertiseStore } from 'src/stores'
import { computed, defineEmits } from 'vue'
import AdvertiserTable from 'src/components/Advertiser/AdvertiserTable.vue'

const emit = defineEmits(['openAdvertiseDialog'])

const advertiseStore = useAdvertiseStore()

const advertises = computed(() => {
  return advertiseStore.getAdvertises
})

function openDialog(item) {
  emit('openAdvertiseDialog', item)
}
</script>
