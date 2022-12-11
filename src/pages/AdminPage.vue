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
      <q-table
        title="Manage Prompts"
        :columns="columns"
        :rows="prompts"
        :loading="isLoading"
        flat
        hide-bottom
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn size="sm" color="red" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
            </q-td>
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.value }}
            </q-td>
            <q-td >
              <q-btn color="warning" flat icon="edit" round size="sm" @click="prompt = props.row" />
              <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeleteDialog(props.row)" />
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="text-left">This is the test text. After few days there will be entries text.{{ props.row.author.displayName }}</div>
            </q-td>
          </q-tr>
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
  {},
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
  {
    name: 'title',
    align: 'left',
    label: 'Title',
    field: 'title',
    sortable: true
  },
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
    .then(() => $q.notify({ message: 'Prompt successfully deleted!' }))
    .catch(() => $q.notify({ message: 'Prompt deletion failed!' }))

  deleteDialog.value.show = false
  deleteDialog.value.prompt = {}
}
</script>
