<template>
  <q-table
    v-if="prompts"
    :columns="columns"
    :filter="filter"
    flat
    hide-bottom
    :loading="isLoading"
    :pagination="pagination"
    :rows="prompts"
    style="left: 0; right: 0"
    title="Manage Prompts & Entries"
  >
    <template v-slot:top-right>
      <q-input :data-test="isLoading ? '' : 'input-search'" debounce="300" dense placeholder="Search" v-model="filter">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr class="new" :data-test="props.key" :props="props">
        <q-td auto-width>
          <q-btn
            color="red"
            data-test="button-expand"
            dense
            flat
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            round
            @click="props.expand = !props.expand"
          >
            <q-tooltip>
              {{ props.expand ? 'Collapse' : 'Expand' }}
            </q-tooltip>
          </q-btn>
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">{{ col.value }}</q-td>
        <q-td class="text-right">
          <q-btn
            v-if="userStore.isEditorOrAbove"
            color="warning"
            data-test="button-edit"
            :disable="promptStore.isLoading"
            flat
            icon="edit"
            round
            size="sm"
            @click="$emit('openPromptDialog', props.row)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn
            v-if="userStore.isEditorOrAbove"
            color="negative"
            data-test="button-delete-prompt"
            :disable="promptStore.isLoading"
            flat
            icon="delete"
            round
            size="sm"
            @click="openDeleteDialog(props.row)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" style="padding: 0 !important" :data-test="props.row.entries ? 'entriesFetched' : ''">
          <p v-if="!entryStore.isLoading && !props.row.entries?.length" class="q-ma-sm text-body1">NO ENTRIES</p>
          <TableEntry v-else :filter="filter" :rows="props.row.entries" />
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
        <q-btn color="primary" flat label="Cancel" v-close-popup />
        <q-btn color="negative" data-test="confirm-delete-prompt" flat label="Delete" @click="onDeletePrompt(deleteDialog.prompt.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import TableEntry from 'src/components/Admin/TableEntry.vue'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'

defineEmits(['openPromptDialog'])

const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()

const columns = [
  {},
  { name: 'date', align: 'center', label: 'Date', field: (row) => row.date, sortable: true },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author?.displayName, sortable: true },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  {}
]
const deleteDialog = ref({})
const filter = ref('')
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }

onMounted(() => {
  promptStore.fetchPrompts()
  entryStore.fetchEntries()
})
/**
 * @description computed property that returns if prompts and entries are loaded
 * @type {ComputedRef<Boolean>}
 */
const isLoaded = computed(() => promptStore.getPrompts && entryStore.getEntries)
/**
 * @description computed property that returns if prompts and entries are loading
 * @type {ComputedRef<Boolean>}
 */
const isLoading = computed(() => promptStore.isLoading || (entryStore.isLoading && !isLoaded.value))

const prompts = computed(() => {
  return promptStore.getPrompts?.map((prompt) => ({
    ...prompt,
    entries: entryStore.getEntries?.filter((entry) => [entry.prompt, entry.prompt?.id].includes(prompt.id))
  }))
})

function openDeleteDialog(prompt) {
  deleteDialog.value.show = true
  deleteDialog.value.prompt = prompt
}

function onDeletePrompt(id) {
  promptStore
    .deletePrompt(id)
    .then(() => $q.notify({ type: 'negative', message: 'Prompt successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Prompt deletion failed'))

  deleteDialog.value.show = false
  deleteDialog.value.prompt = {}
}
</script>
