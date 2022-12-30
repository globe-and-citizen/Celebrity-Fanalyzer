<template>
  <q-header>
    <q-toolbar class="bg-white q-px-lg shadow-1">
      <q-toolbar-title>
        <b class="text-secondary">Admin Panel</b>
      </q-toolbar-title>
      <q-btn-dropdown
        auto-close
        color="primary"
        dropdown-icon="control_point"
        flat
        rounded
        transition-show="jump-down"
        transition-hide="jump-up"
      >
        <q-list style="min-width: 100px">
          <q-item clickable @click="openPromptDialog()">
            <q-item-section>New Prompt</q-item-section>
          </q-item>
          <q-item clickable @click="openEntryDialog()">
            <q-item-section>New Entry</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </q-header>
  <section class="q-pa-md">
    <q-page padding>
      <q-table
        :columns="columns"
        flat
        :filter="promptFilter"
        hide-bottom
        :loading="promptStore.isLoading"
        :pagination="pagination"
        :rows="prompts"
        title="Manage Prompts & Entries"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                color="red"
                dense
                flat
                :icon="props.expand ? 'expand_less' : 'expand_more'"
                round
                @click="props.expand = !props.expand"
              />
            </q-td>
            <q-td v-for="col in props.cols" :key="col.name" :props="props">{{ col.value }}</q-td>
            <q-td>
              <q-btn color="warning" flat icon="edit" round size="sm" @click="openPromptDialog(props.row)" />
              <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeleteDialog(props.row)" />
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%" style="padding: 0 !important">
              <q-linear-progress v-if="entryStore.isLoading" color="primary" indeterminate />
              <p v-else-if="!props.row.entries?.length" class="q-ma-sm text-body1">NO ENTRIES</p>
              <TableEntry v-else :rows="props.row.entries" @edit-entry="openEntryDialog" />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-page>

    <q-dialog full-width position="bottom" v-model="prompt.dialog">
      <PromptCard v-bind="prompt" @hideDialog="prompt = {}" />
    </q-dialog>

    <q-dialog full-width position="bottom" v-model="entry.dialog">
      <EntryCard v-bind="entry" @hideDialog="entry = {}" />
    </q-dialog>

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
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import EntryCard from 'src/components/EntryCard.vue'
import PromptCard from 'src/components/PromptCard.vue'
import TableEntry from 'src/components/TableEntry.vue'
import { useEntryStore, usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const $q = useQuasar()
const promptStore = usePromptStore()
const entryStore = useEntryStore()

const columns = [
  {},
  { name: 'date', align: 'center', label: 'Date', field: (row) => row.date, sortable: true },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author.displayName, sortable: true },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]
const deleteDialog = ref({})
const entry = ref({})
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 10 }
const prompts = ref([])
const prompt = ref({})
const promptFilter = ref('')

onMounted(async () => {
  if (!promptStore.getPrompts.length) {
    await promptStore.fetchPromptsAndEntries()
  }
  prompts.value = promptStore.getPrompts
})

function openPromptDialog(props) {
  prompt.value = props?.id ? props : {}
  prompt.value.dialog = true
}

function onDeleteDialog(prompt) {
  deleteDialog.value.show = true
  deleteDialog.value.prompt = prompt
}

function onDeletePrompt(id) {
  promptStore
    .deletePrompt(id)
    .then(() => $q.notify({ message: 'Prompt successfully deleted' }))
    .catch(() => $q.notify({ message: 'Prompt deletion failed' }))

  deleteDialog.value.show = false
  deleteDialog.value.prompt = {}
}

function openEntryDialog(props) {
  entry.value = props?.id ? props : {}
  entry.value.dialog = true
}
</script>
