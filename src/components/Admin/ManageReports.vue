<template>
  <h5 v-if="!reportStore.getReports" class="text-center">There are no reports yet.</h5>
  <q-table
    v-else
    :columns="columns"
    data-test="reports-table"
    grid
    hide-header
    :loading="reportStore.isLoading"
    :pagination="pagination"
    row-key="created"
    :rows="reportStore.getReports"
    style="left: 0; right: 0"
    title="Manage Reports"
  >
    <template v-slot:item="props">
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 q-pa-sm">
        <q-card class="report">
          <q-card-section class="text-center">
            <div class="text-body1" data-test="user-div">{{ props.row.author.displayName }}</div>
            <q-btn color="negative" data-test="trash-button" icon="delete" round size="sm" @click="confirmDelete(props.row)" />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <p class="text-body2 text-bold" data-test="feedback-subject">
              {{ shortMonthDayTime(props.row.created) }}
            </p>
            <span data-test="feedback-message" style="white-space: pre-line">{{ props.row.reportMessage }}</span>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-table>

  <q-dialog v-model="deleteDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Delete Report?</h6>
      </q-card-section>
      <q-card-section>Are you sure you want to delete this report from {{ deleteDialog.author.displayName }}?</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn data-test="delete-button" flat label="Delete" color="negative" @click="onDeleteReport(deleteDialog.commentId)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useErrorStore, useReportStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { onMounted, ref } from 'vue'

const $q = useQuasar()
const errorStore = useErrorStore()
const reportStore = useReportStore()

const columns = [
  { name: 'created', align: 'left', label: 'Created At', field: 'created', sortable: true },
  { name: 'message', align: 'left', label: 'Reports', field: 'message', sortable: true },
  { name: 'action', label: 'Action', field: 'action' }
]
const deleteDialog = ref({})
const pagination = { sortBy: 'created', descending: true, rowsPerPage: 0 }

onMounted(async () => {
  await reportStore.fetchReports()
})

function confirmDelete(report) {
  deleteDialog.value = report
  deleteDialog.value.show = true
}

function onDeleteReport(id) {
  reportStore
    .deleteComment(id)
    .then(() => $q.notify({ color: 'positive', message: 'Report deleted successfully' }))
    .catch((error) => errorStore.throwError(error, 'Failed to delete report'))
  deleteDialog.value.show = false
}
// function onDeleteReport(id) {
//   reportStore
//     .deleteReport(id)
//     .then(() => $q.notify({ color: 'positive', message: 'Report deleted successfully' }))
//     .catch((error) => errorStore.throwError(error, 'Failed to delete report'))
//   deleteDialog.value.show = false
// }
</script>

<style scoped>
.report .q-btn {
  opacity: 0;
  position: absolute;
  right: -0.8rem;
  top: -0.8rem;
  transition: all 0.2s ease;
  z-index: 1;
}
.report:hover .q-btn {
  opacity: 1;
}
</style>
