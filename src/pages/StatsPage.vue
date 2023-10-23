<template>
  <TheHeader feedbackButton title="Stats" />
  <q-page-container style="max-width: none">
    <q-page>
      <q-table
        class="q-ma-md"
        :columns="columnsSummary"
        hide-bottom
        :pagination="pagination"
        :rows="rowSummary"
        :title="`Summary Data: ${visitors} visitors`"
      />
      <q-table
        class="q-ma-md"
        :columns="columnsDetailed"
        hide-bottom
        :pagination="pagination"
        :rows="statStore.getStats"
        :title="`Detailed Data: ${visits} visits`"
      />
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
  mouseMovements: { label: 'Mouse Movements' },
  scrolls: { label: 'Scrolls' },
  totalTime: { label: 'Time Spent' }
}

const columnsDetailed = [
  { name: 'created', align: 'center', label: 'Date', field: (row) => shortMonthDayTime(row.created), sortable: true },
  ...Object.keys(fields).map((fieldName) => ({ name: fieldName, label: fields[fieldName].label, field: fieldName, sortable: true }))
]
const columnsSummary = [
  { name: 'type', align: 'center', label: '', field: 'type', sortable: true },
  ...Object.keys(fields).map((fieldName) => ({ name: fieldName, label: fields[fieldName].label, field: fieldName, sortable: true }))
]
const entry = computed(() => entryStore.getEntries?.find((entry) => router.currentRoute.value.href.includes(entry.slug)))
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }

const visits = computed(() => statStore.getStats?.length || 0)
const visitors = computed(() => {
  const authorIds = new Set(statStore.getStats?.map((stat) => stat.author.id))
  return authorIds.size
})

const rowSummary = computed(() => {
  const stats = statStore.getStats
  if (!stats || stats.length === 0) {
    return []
  }

  const averageRow = { type: 'Average' }
  const totalRow = { type: 'Total' }

  Object.keys(fields).forEach((field) => {
    averageRow[field] = stats.reduce((acc, stat) => acc + stat[field], 0) / stats.length
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
