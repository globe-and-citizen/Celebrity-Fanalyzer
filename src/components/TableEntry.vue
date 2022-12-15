<template>
  <q-table :columns="columns" dense flat hide-bottom hide-header :rows="items" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { shortMonthDayTime } from 'src/utils/date'

const router = useRouter()
const props = defineProps({
  items: { type: Array, required: true }
})
const columns = [
  { name: 'created', align: 'center', label: 'Created', field: (row) => shortMonthDayTime(row.created) },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author.displayName },
  { name: 'title', align: 'left', label: 'Title', field: 'title' },
  { name: 'actions', field: 'actions' }
]

function goToUrl() {
  // router.push(props.link)
}
</script>
