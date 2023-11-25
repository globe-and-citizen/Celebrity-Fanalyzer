<template>
  <TheHeader feedbackButton title="Stats" />
  <q-page-container style="max-width: none">
    <q-page>
      <q-table class="q-ma-md" :columns="columnsSummary" hide-bottom :pagination="pagination" :rows="rowSummary" :title="visitors" />
      <q-table class="q-ma-md" :columns="columnsDetailed" hide-bottom :pagination="pagination" :rows="statStore.getStats" :title="visits" />
    </q-page>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, useStatStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()
const statStore = useStatStore()

const fields = {
  clicks: { label: 'Clicks' },
  keypresses: { label: 'Keypresses' },
  mousemovements: { label: 'Mouse Movements', field: (row) => row.mousemovements + 'px' },
  scrolls: { label: 'Scrolls', field: (row) => row.scrolls + 'px' },
  totaltime: { label: 'Time Spent', field: (row) => row.totaltime + 's' }
}

const columnsDetailed = [
  { name: 'created', align: 'center', label: 'Date', field: (row) => shortMonthDayTime(row.created), sortable: true },
  ...Object.keys(fields).map((field) => ({ name: field, label: fields[field].label, field: fields[field].field || field, sortable: true }))
]
const columnsSummary = [
  { name: 'type', align: 'center', label: '', field: 'type', sortable: true },
  ...Object.keys(fields).map((field) => ({ name: field, label: fields[field].label, field: fields[field].field || field, sortable: true }))
]
const entry = computed(() => entryStore.getEntries?.find((entry) => router.currentRoute.value.href.includes(entry.slug)))
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }

const visits = computed(() => {
  const visits = statStore.getStats || 0
  const anonymous = visits.filter((stat) => stat.author.length === 40).map((stat) => stat.author)

  return `Detailed Data: ${visits.length === 1 ? '1 visit' : `${visits.length} visits`} (${anonymous.length} anonymous)`
})

const visitors = computed(() => {
  const authors = new Set(statStore.getStats?.map((stat) => stat.author))
  const anonymous = new Set(statStore.getStats?.filter((stat) => stat.author.length === 40).map((stat) => stat.author))

  return `Summary Data: ${authors.size === 1 ? '1 visitor' : `${authors.size} visitors`} (${anonymous.size} anonymous)`
})

const rowSummary = computed(() => {
  const stats = statStore.getStats
  if (!stats || stats.length === 0) {
    return []
  }

  const averageRow = { type: 'Average' }
  const totalRow = { type: 'Total' }

  Object.keys(fields).forEach((field) => {
    averageRow[field] = (stats.reduce((acc, stat) => acc + stat[field], 0) / stats.length).toFixed(1)
    totalRow[field] = stats.reduce((acc, stat) => acc + stat[field], 0)
  })

  return [averageRow, totalRow]
})

onMounted(async () => {
  if (!entryStore.getEntries.length) {
    await entryStore.fetchEntries()
  }

  await statStore.fetchStats('entries', entry.value.id)
})
</script>
