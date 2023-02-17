<template>
  <TheHeader title="Admin Panel">
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
  </TheHeader>
  <section class="q-pa-md">
    <q-page padding>
      <q-tabs v-model="tab" class="text-secondary">
        <q-tab name="posts" icon="view_list" label="Prompts & Entries" />
        <q-tab name="users" icon="people" label="Users" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated swipeable>
        <q-tab-panel name="posts">
          <ManagePromptsEntries
            :prompts="prompts"
            @openPromptDialog="openPromptDialog($event)"
            @openEntryDialog="openEntryDialog($event)"
            @onDeleteDialog="onDeleteDialog($event)"
          />
        </q-tab-panel>

        <q-tab-panel name="users">
          <q-table
            :columns="[
              { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
              { name: 'email', label: 'email', field: 'email', sortable: true, align: 'left' },
              { name: 'actions', field: 'actions' }
            ]"
            :rows="users"
            flat
            hide-bottom
            :pagination="pagination"
            row-key="name"
            title="Manage Users"
          />
        </q-tab-panel>
      </q-tab-panels>
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
import ManagePromptsEntries from 'src/components/ManagePromptsEntries.vue'
import PromptCard from 'src/components/PromptCard.vue'
import TableEntry from 'src/components/TableEntry.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const $q = useQuasar()
const errorStore = useErrorStore()
const entryStore = useEntryStore()
const promptStore = usePromptStore()
const userStore = useUserStore()

const columns = [
  {},
  { name: 'date', align: 'center', label: 'Date', field: (row) => row.date, sortable: true },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author.displayName, sortable: true },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]
const deleteDialog = ref({})
const entry = ref({})
const pagination = { sortBy: 'email', descending: false, rowsPerPage: 0 }
const prompts = ref([])
const prompt = ref({})
const promptFilter = ref('')
const tab = ref('posts')
const users = ref([])

onMounted(async () => {
  await promptStore.fetchPromptsAndEntries()
  prompts.value = promptStore.getPrompts

  await userStore.fetchUsers()
  users.value = userStore.getUsers
})

promptStore.$subscribe((_mutation, state) => {
  prompts.value = state._prompts
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
    .catch((error) => errorStore.throwError(error, 'Prompt deletion failed'))

  deleteDialog.value.show = false
  deleteDialog.value.prompt = {}
}

function openEntryDialog(props) {
  if (props?.id) {
    entry.value = props
    entry.value.prompt = prompts.value.find((prompt) => prompt.id === props.prompt.id)
  } else {
    entry.value = {}
  }
  entry.value.dialog = true
}
</script>
