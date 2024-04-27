<template>
  <div>
    <AdvertiserTable
      :advertises="advertises"
      @openAdvertiseDialog="openDialog"
    />
  </div>
</template>

<script setup>
import { useAdvertiseStore } from 'src/stores'
import { ref, computed, defineEmits } from 'vue'
import AdvertiserTable from './AdvertiserTable.vue'

const emit = defineEmits(['openAdvertiseDialog'])

const advertiseStore = useAdvertiseStore()

const category = ref('All')
const search = ref('')

const advertises = computed(() => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  // let data = advertiseStore.getAdvertises
  // if (category.value !== 'All') {
  //   data = data.filter((item) => item.categories.includes(category.value))
  // }
  return advertiseStore.getAdvertises
})
// console.log(advertises.value)
const computedCategories = computed(() => {
  const allAdvertiseCategories = advertiseStore.getAdvertises?.flatMap(({ categories }) => categories)
  const uniqueCategories = Array.from(new Set(allAdvertiseCategories), (category) => ({ label: category, value: category }))
  const allCategory = { label: 'All', value: 'All' }
  return [allCategory, ...uniqueCategories]
})

function openDialog(item){
  emit('openAdvertiseDialog', item)
}

</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}
</style>
