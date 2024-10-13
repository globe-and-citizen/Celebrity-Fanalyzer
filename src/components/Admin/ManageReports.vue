<template>
  <h5 v-if="!reportStore.getReports && reportStore.isLoaded" class="text-center">There are no reports yet.</h5>
  <q-table
    v-else
    :columns="columns"
    data-test="reports-table"
    grid
    hide-header
    :loading="!reportStore.isLoaded || reportStore.isLoading"
    :pagination="pagination"
    row-key="created"
    :rows="reportStore.getReports ?? []"
    style="left: 0; right: 0"
    title="Manage Reports"
  >
    <template v-slot:item="props">
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 q-pa-sm">
        <q-card class="report">
          <q-card-section class="text-center flex justify-between">
            <div class="text-body1 text-left self-center" data-test="user-div">
              <span class="text-bold">Author:</span>
              {{ props.row.author ? props.row.author.displayName : 'Anonymously' }}
            </div>
            <div
              class="text-body1 text-right text-white q-pa-sm q-btn--rounded"
              :class="props.row.status === 'New' ? 'bg-positive' : 'bg-negative'"
            >
              {{ props.row.status }}
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <p data-test="report-message" style="white-space: pre-line">
              <span class="text-body2 text-bold">Created:</span>
              {{ shortMonthDayTime(props.row.created) }}
            </p>
            <p data-test="report-message" style="white-space: pre-line">
              <span class="text-body2 text-bold">Report message:</span>
              {{ props.row.reportMessage }}
            </p>
            <p data-test="report-message" style="white-space: pre-line">
              <span class="text-body2 text-bold">Comment text:</span>
              {{ props.row.commentText }}
            </p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :disable="props.row.status === 'New'"
              label="Delete report"
              color="primary"
              @click="confirmDelete(props.row, 'report')"
            />
            <q-btn
              :disable="props.row.status === 'Deleted'"
              label="Delete comment"
              color="primary"
              @click="confirmDelete(props.row, 'comment')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </template>
  </q-table>

  <q-dialog v-model="deleteDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Delete {{ isComment ? 'comment' : 'report' }}?</h6>
      </q-card-section>
      <q-card-section>Are you sure you want to delete this {{ isComment ? 'comment' : 'report' }}?</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn data-test="delete-button" flat label="Delete" color="negative" @click="onDeleteReport()" />
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
const isComment = ref(false)
const pagination = { sortBy: 'created', descending: true, rowsPerPage: 0 }

onMounted(async () => {
  await reportStore.fetchReports()
})

function confirmDelete(report, value) {
  if (value === 'comment') {
    isComment.value = true
  } else {
    isComment.value = false
  }
  deleteDialog.value = report
  deleteDialog.value.show = true
}

function onDeleteReport() {
  if (isComment.value) {
    reportStore
      .deleteComment(deleteDialog.value.collectionName, deleteDialog.value.documentId, deleteDialog.value.commentId, deleteDialog.value.id)
      .then(() => $q.notify({ color: 'positive', message: 'Comment deleted successfully' }))
      .catch((error) => errorStore.throwError(error, 'Failed to delete comment'))
  } else {
    reportStore
      .deleteReport(deleteDialog.value.id)
      .then(() => $q.notify({ color: 'positive', message: 'Report deleted successfully' }))
      .catch((error) => errorStore.throwError(error, 'Failed to delete report'))
  }
  deleteDialog.value.show = false
}
</script>
