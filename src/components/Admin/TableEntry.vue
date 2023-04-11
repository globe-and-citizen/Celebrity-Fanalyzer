<template>
  <q-table :columns="columns" dense flat :filter="filter" hide-bottom hide-header :pagination="pagination" :rows="rows">
    <template v-slot:body-cell-actions="props">
      <td class="text-right">
        <q-btn color="warning" :disable="entryStore.isLoading" flat icon="edit" round size="sm" @click="onEditDialog(props.row)" />
        <q-btn
          color="negative"
          data-test="button-delete-entry"
          :disable="entryStore.isLoading"
          flat
          icon="delete"
          round
          size="sm"
          @click="onDeleteDialog(props.row)"
        />
      </td>
    </template>
  </q-table>

  <q-dialog full-width position="bottom" v-model="dialog">
    <EntryCard v-bind="entry" @hideDialog="entry = {}" />
  </q-dialog>

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
        <q-btn color="primary" flat label="Cancel" v-close-popup />
        <q-btn color="negative" data-test="confirm-delete-entry" flat label="Delete" @click="onDeleteEntry(deleteDialog.entry.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore, usePromptStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { ref } from 'vue'
import EntryCard from './EntryCard.vue'

defineProps({
  filter: { type: String, required: false, default: '' },
  rows: { type: Array, required: true, default: () => [] }
})

const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()

const columns = [
  { name: 'created', align: 'center', label: 'Created', field: (row) => shortMonthDayTime(row.created) },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author?.displayName },
  { name: 'title', align: 'left', label: 'Title', field: 'title' },
  { name: 'actions', field: 'actions' }
]
const deleteDialog = ref({})
const dialog = ref(false)
const entry = ref({})
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }

function onEditDialog(props) {
  dialog.value = true
  entry.value = props
  entry.value.prompt = promptStore.getPrompts.find((prompt) => prompt.id === props.id.split('T')[0])
}

function onDeleteDialog(entry) {
  deleteDialog.value.show = true
  deleteDialog.value.entry = entry
}

function onDeleteEntry(id) {
  entryStore
    .deleteEntry(id)
    .then(() => $q.notify({ type: 'negative', message: 'Entry deleted' }))
    .catch((error) => errorStore.throwError(error, 'Error deleting entry'))
  deleteDialog.value.show = false
}
</script>
