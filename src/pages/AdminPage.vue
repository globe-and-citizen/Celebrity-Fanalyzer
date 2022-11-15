<template>
  <q-header>
    <q-toolbar class="bg-white q-px-lg shadow-1">
      <q-toolbar-title>
        <b class="text-secondary">Admin Panel</b>
      </q-toolbar-title>
      <DialogPrompt v-bind="prompt" @hideDialog="prompt = {}" />
    </q-toolbar>
  </q-header>
  <section class="q-pa-md">
    <q-page padding>
      <q-table :columns="columns" flat hide-bottom :loading="isLoading" :rows="prompts" title="Manage Prompts">
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn color="warning" flat icon="edit" round size="sm" @click="prompt = props.row" />
            <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeleteDialog(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-page>

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
          <q-btn flat label="Delete" color="negative" @click="ondeletePrompt(deleteDialog.prompt.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import DialogPrompt from 'src/components/PromptDialog.vue'
import { usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'

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
const prompts = ref([])
const prompt = ref({})

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

function ondeletePrompt(id) {
  promptStore
    .deletePrompt(id)
    .then(() => $q.notify({ message: 'Prompt successfully deleted' }))
    .catch(() => $q.notify({ message: 'Prompt deletion failed' }))

  deleteDialog.value.show = false
  deleteDialog.value.prompt = {}
}
</script>
