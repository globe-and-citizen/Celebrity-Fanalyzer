<template>
  <q-table
    class="fixed q-px-lg"
    :columns="columns"
    flat
    hide-bottom
    :loading="errorStore.isLoading"
    :pagination="pagination"
    :rows="errorStore.getErrors"
    style="left: 0; right: 0"
    title="Manage Errors"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="createdAt" :props="props">{{ shortMonthDayTime(props.row.createdAt) }}</q-td>
        <q-td key="user" :props="props">{{ props.row.user?.displayName || props.row.user }}</q-td>
        <q-td key="error" :props="props">
          {{ props.row.error.split('\n')[0] }}
        </q-td>
        <q-td key="action" :props="props">
          <q-btn color="negative" :disable="errorStore.isLoading" flat icon="delete" round size="sm" @click="confirmDelete(props.row)" />
        </q-td>
        <q-tooltip style="font-size: 0.8rem; white-space: pre">
          {{ props.row.error }}
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
import { useErrorStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { onMounted, ref } from 'vue'

const errorStore = useErrorStore()

const columns = [
  { name: 'createdAt', align: 'left', label: 'Created At', field: 'createdAt', sortable: true },
  { name: 'user', align: 'left', label: 'User', field: 'user', sortable: true },
  { name: 'error', align: 'left', label: 'Error', field: 'error', sortable: true },
  { name: 'action', label: 'Action', field: 'action' }
]
const deleteDialog = ref({})
const pagination = { sortBy: 'createdAt', descending: true, rowsPerPage: 0 }

onMounted(async () => {
  await errorStore.fetchErrors()
})

function confirmDelete(error) {
  deleteDialog.value.show = true
  deleteDialog.value.id = error.id
}

function onDeleteError(id) {
  errorStore.deleteError(id).catch((error) => errorStore.throwError(error, 'Failed to delete error'))
  deleteDialog.value.show = false
}
</script>
