<template>
  <q-table
    v-if="prompts && userStore.isEditorOrAbove"
    flat
    bordered
    hide-bottom
    class="q-ma-md custom-table"
    virtual-scroll
    title="Manage Prompts & Entries"
    :columns="columns"
    :filter="filter"
    :loading="isLoading"
    :pagination="pagination"
    :rows="prompts"
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
            dense
            flat
            round
            color="red"
            data-test="button-expand"
            :disable="isLoading"
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            @click="toggleExpand(props)"
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
            flat
            round
            color="warning"
            data-test="button-edit"
            icon="edit"
            size="sm"
            :disable="promptStore.isLoading"
            @click="$emit('openPromptDialog', props.row)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn
            v-if="userStore.isEditorOrAbove"
            flat
            round
            color="negative"
            data-test="button-delete-prompt"
            size="sm"
            icon="delete"
            :disable="promptStore.isLoading"
            @click="openDeleteDialog(props.row)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" style="padding: 0 !important" :data-test="props.row.entries ? 'entriesFetched' : ''">
          <p v-if="!entryStore.isLoading && !props.row.entries?.length" class="q-ma-sm text-body1">NO ENTRIES</p>
          <TableEntry
            v-else
            :filter="filter"
            :rows="getEntriesForPrompt(props.row.id)"
            :currentPrompt="props.row"
            :loaded-entries="entryStore._loadedEntries"
            @update-entry="handleUpdateEntry"
            @delete-entry="handleDeleteEntry"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <TableEntry v-else :filter="filter" :rows="entryStore.getUserRelatedEntries" />

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
import { computed, onMounted, watchEffect, ref } from 'vue'

defineEmits(['openPromptDialog', 'openAdvertiseDialog'])

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

const prompts = ref([])

onMounted(() => {
  if (userStore.isEditorOrAbove) {
    entryStore._loadedEntries = []
    promptStore.fetchPrompts()
  } else {
    entryStore.fetchUserRelatedEntries(userStore.getUserId)
  }
})

const isLoaded = computed(() => promptStore.getPrompts)
const isLoading = computed(() => promptStore.isLoading || (entryStore.isLoading && !isLoaded.value))

watchEffect(async () => {
  prompts.value = promptStore.getPrompts
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

async function handleUpdateEntry({ _entry, _prompt }) {
  const promptIndex = prompts.value.findIndex((p) => p.id === _prompt.id)
  if (promptIndex !== -1) {
    const entryIndex = prompts.value[promptIndex].entries.findIndex((e) => e.id === _entry.id)
    if (entryIndex !== -1) {
      const { author, ...restOfEntry } = _entry
      // Merge the existing entry with the incoming _entry data
      const updatedEntry = { ...prompts.value[promptIndex].entries[entryIndex], ...restOfEntry }
      prompts.value[promptIndex].entries.splice(entryIndex, 1, updatedEntry)
    }

    // Update other properties of the prompt if necessary
    const { entries, ...restOfPrompt } = _prompt
    Object.assign(prompts.value[promptIndex], restOfPrompt)

    // This reassignment ensures Vue's reactivity system is aware of the update
    prompts.value = [...prompts.value]
  }
}

function toggleExpand(props) {
  props.expand = !props?.expand
  if (props.expand && !entryStore._loadedEntries.some((el) => el?.promptId === props?.row?.id)) {
    fetchEntriesForPrompt(props.row.entries, props.row.id)
  }
}

async function fetchEntriesForPrompt(entriesIds, promptId) {
  try {
    const res = await entryStore.fetchPromptsEntries(entriesIds)
    entryStore._loadedEntries.push({ promptId, entries: res })
  } catch (error) {
    await errorStore.throwError(error, 'Failed to fetch entries')
  }
}

function getEntriesForPrompt(promptId) {
  const loadedPrompt = entryStore._loadedEntries.find((el) => el?.promptId === promptId)
  return loadedPrompt ? loadedPrompt?.entries : []
}

function handleDeleteEntry(entryId, promptId) {
  entryStore._loadedEntries = entryStore._loadedEntries.map((prompt) => {
    if (prompt?.promptId === promptId) {
      return {
        ...prompt,
        entries: prompt?.entries.filter((entry) => entry.id !== entryId)
      }
    }
    return prompt
  })

  prompts.value = prompts.value.map((prompt) => {
    if (prompt.id === promptId) {
      return {
        ...prompt,
        entries: prompt?.entries.filter((entry) => entry.id !== entryId)
      }
    }
    return prompt
  })

  promptStore.fetchPrompts()
}
</script>
