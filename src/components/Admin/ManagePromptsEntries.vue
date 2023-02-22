<template>
  <q-table
    :columns="columns"
    flat
    hide-bottom
    :loading="promptStore.isLoading || entryStore.isLoading"
    :pagination="pagination"
    :rows="prompts"
    title="Manage Prompts & Entries"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn color="red" dense flat :icon="props.expand ? 'expand_less' : 'expand_more'" round @click="props.expand = !props.expand" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">{{ col.value }}</q-td>
        <q-td>
          <q-btn color="warning" flat icon="edit" round size="sm" @click="$emit('openPromptDialog', props.row)" />
          <q-btn color="negative" flat icon="delete" round size="sm" @click="openDeleteDialog(props.row)" />
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" style="padding: 0 !important">
          <p v-if="!entryStore.isLoading && !props.row.entries?.length" class="q-ma-sm text-body1">NO ENTRIES</p>
          <TableEntry v-else :rows="props.row.entries" @editEntry="$emit('openEntryDialog', $event)" />
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <q-dialog v-model="deleteDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Delete Prompt?</h6>
      </q-card-section>
      <q-card-section>
        <span class="q-ml-sm">
          Are you sure you want to delete the prompt:
          <b>{{ deleteDialog.prompt.title }}</b>
          ?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="negative" @click="onDeletePrompt(deleteDialog.prompt.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import TableEntry from 'src/components/TableEntry.vue'
import { useEntryStore, useErrorStore, usePromptStore } from 'src/stores'
import { ref } from 'vue'

defineEmits(['openPromptDialog', 'openEntryDialog'])
defineProps({
  prompts: { type: Array, required: true }
})

const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()

const columns = [
  {},
  { name: 'date', align: 'center', label: 'Date', field: (row) => row.date, sortable: true },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author.displayName, sortable: true },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]
const deleteDialog = ref({})
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }

function openDeleteDialog(prompt) {
  deleteDialog.value.show = true
  deleteDialog.value.prompt = prompt
}

function onDeletePrompt(id) {
  promptStore
    .deletePrompt(id)
    .then(() => $q.notify({ message: 'Prompt successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Prompt deletion failed'))

  deleteDialog.value.show = false
  deleteDialog.value.prompt = {}
}
</script>
