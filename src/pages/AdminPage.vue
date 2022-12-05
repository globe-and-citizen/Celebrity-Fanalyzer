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
          <q-item clickable @click="prompt.dialog = true">
            <q-item-section>New Prompt</q-item-section>
          </q-item>
          <q-item clickable @click="entry.dialog = true">
            <q-item-section>New Entry</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </q-header>
  <section class="q-pa-md">
    <q-page padding>
      <q-table :columns="columns" :filter="promptFilter" flat :loading="isLoading" :rows="prompts" title="Prompts">
        <template v-slot:top-right>
          <q-input dense v-model="promptFilter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn color="warning" flat icon="edit" round size="sm" @click="prompt = props.row" />
            <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeleteDialog(props.row)" />
          </q-td>
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
            Are you sure you want to delete the prompt
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
import { usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { defineAsyncComponent } from 'vue'

import EntryCard from 'src/components/EntryCard.vue'
import PromptCard from 'src/components/PromptCard.vue'

const $q = useQuasar()
const promptStore = usePromptStore()

const columns = [
  {
    name: 'created',
    label: 'Created at',
    align: 'left',
    field: (row) => row.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    format: (val) => `${val}`,
    sortable: true
  },
  {
    name: 'author',
    align: 'center',
    label: 'Author',
    field: (row) => row.author.displayName,
    sortable: true
  },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]
const deleteDialog = ref({})
const isLoading = ref(false)
const entries = ref([])
const entry = ref({})
const entryFilter = ref({})
const prompts = ref([])
const prompt = ref({})
const promptFilter = ref('')

onMounted(async () => {
  isLoading.value = true
  await promptStore.fetchPrompts()
  prompts.value = promptStore.getPrompts
  isLoading.value = false
})

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
</script>
