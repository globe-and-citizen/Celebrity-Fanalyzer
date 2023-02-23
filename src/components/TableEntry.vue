<template>
  <q-table :columns="columns" dense flat hide-bottom hide-header :pagination="pagination" :rows="rows">
    <template v-slot:body-cell-actions="props">
      <td class="text-right">
        <q-btn color="warning" flat icon="edit" round size="sm" @click="$emit('editEntry', props.row)" />
        <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeleteDialog(props.row)" />
      </td>
    </template>
  </q-table>

  <q-dialog v-model="deleteDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Delete Entry?</h6>
      </q-card-section>
      <q-card-section>
        <span class="q-ml-sm">
          Are you sure you want to delete the entry:
          <b>{{ deleteDialog.entry.title }}</b>
          ?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="negative" @click="onDeleteEntry(deleteDialog.entry.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { ref } from 'vue'

defineEmits(['editEntry'])
defineProps({
  rows: { type: Array, required: true }
})

const $q = useQuasar()
const errorStore = useErrorStore()
const entryStore = useEntryStore()

const columns = [
  { name: 'created', align: 'center', label: 'Created', field: (row) => shortMonthDayTime(row.created) },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author.displayName },
  { name: 'title', align: 'left', label: 'Title', field: 'title' },
  { name: 'actions', field: 'actions' }
]
const deleteDialog = ref({})
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 10 }

function onDeleteDialog(entry) {
  deleteDialog.value.show = true
  deleteDialog.value.entry = entry
}

function onDeleteEntry(id) {
  entryStore
    .deleteEntry(id)
    .then(() => $q.notify({ message: 'Entry deleted' }))
    .catch((error) => errorStore.throwError(error, 'Error deleting entry'))
  deleteDialog.value.show = false
}
</script>
