<template>
  <q-table
    v-if="reportStore.getReports.length > 0"
    :columns="columns"
    flat
    hide-bottom
    :loading="reportStore.isLoading"
    :pagination="pagination"
    :rows="reportStore.getReports"
    style="left: 0; right: 0"
    title="Manage Reports"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="createdAt" :props="props">{{ props.row.createdAt }}</q-td>
        <q-td key="author" :props="props">{{ props.row.author?.id || props.row.author }}</q-td>
        <q-td key="comment" :props="props">{{ props.row.comment }}</q-td>
        <q-td key="action" :props="props">
          <q-btn color="negative" :disable="reportStore.isLoading" flat icon="delete" round size="sm" @click="confirmDelete(props.row)" />
        </q-td>
        <q-tooltip style="font-size: 0.8rem; white-space: pre">
          {{ props.row.comment }}
        </q-tooltip>
      </q-tr>
    </template>
  </q-table>

  <q-dialog v-model="deleteDialog.show" persistent>
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Delete Error?</h6>
      </q-card-section>
      <q-card-section>Are you sure you want to delete this error?</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="negative" @click="onDeleteError(deleteDialog.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useReportStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { onMounted, ref } from 'vue'

const reportStore = useReportStore()

const columns = [
  { name: 'createdAt', align: 'left', label: 'Created At', field: 'createdAt', sortable: true },
  { name: 'comment', align: 'left', label: 'Comment', field: 'comment', sortable: true },
  { name: 'action', label: 'Action', field: 'action' }
]
const deleteDialog = ref({})
const pagination = { sortBy: 'createdAt', descending: true, rowsPerPage: 0 }

onMounted(async () => {
  await reportStore.read()
  console.log(reportStore.getReports)
})
</script>
