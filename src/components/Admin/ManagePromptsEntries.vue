<template>
  <q-table
    :columns="columns"
    flat
    :filter="promptFilter"
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
          <q-btn color="negative" flat icon="delete" round size="sm" @click="$emit('onDeleteDialog', props.row)" />
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
</template>

<script setup>
import TableEntry from 'src/components/TableEntry.vue'
import { useEntryStore, usePromptStore } from 'src/stores'
import { ref } from 'vue'

defineProps({
  prompts: { type: Array, required: true }
})

const entryStore = useEntryStore()
const promptStore = usePromptStore()

const columns = [
  {},
  { name: 'date', align: 'center', label: 'Date', field: (row) => row.date, sortable: true },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author.displayName, sortable: true },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 10 }
const promptFilter = ref('')
</script>
