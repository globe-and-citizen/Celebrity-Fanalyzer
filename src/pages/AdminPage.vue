<template>
  <TheHeader title="Admin Panel">
    <q-btn-dropdown
      auto-close
      data-test="button-dropdown"
      color="primary"
      dropdown-icon="control_point"
      flat
      rounded
      transition-show="jump-down"
      transition-hide="jump-up"
    >
      <q-list style="min-width: 100px">
        <q-item
          v-if="userStore.isEditorOrAbove"
          clickable
          :data-test="promptStore.isLoading || entryStore.isLoading ? '' : 'prompt-dropdown'"
          @click="openPromptDialog()"
        >
          <q-item-section>New Prompt</q-item-section>
        </q-item>
        <q-item
          v-if="userStore.isWriterOrAbove"
          clickable
          :data-test="promptStore.isLoading || entryStore.isLoading ? '' : 'entry-dropdown'"
          @click="openEntryDialog()"
        >
          <q-item-section>New Entry</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </TheHeader>
  <q-page-container>
    <q-page class="absolute q-pt-sm q-pb-xl window-width" style="left: 0">
      <q-tabs align="justify" v-model="tab" class="text-secondary">
        <q-tab v-if="userStore.isWriterOrAbove" data-test="posts-tab" name="posts" icon="view_list" label="Prompts & Entries" />
        <q-tab v-if="userStore.isAdmin" data-test="users-tab" name="users" icon="people" label="Users" />
        <q-tab v-if="userStore.isEditorOrAbove" data-test="feedbacks-tab" name="feedbacks" icon="feedback" label="Feedbacks" />
        <q-tab v-if="userStore.isAdmin" data-test="errors-tab" name="errors" icon="error" label="Errors" />
      </q-tabs>

      <q-tab-panels animated style="padding-bottom: 2rem" swipeable v-model="tab">
        <q-tab-panel v-if="userStore.isWriterOrAbove" name="posts">
          <ManagePromptsEntries @openPromptDialog="openPromptDialog" />
        </q-tab-panel>

        <q-tab-panel v-if="userStore.isAdmin" name="users">
          <ManageUsers />
        </q-tab-panel>

        <q-tab-panel v-if="userStore.isEditorOrAbove" name="feedbacks">
          <ManageFeedbacks />
        </q-tab-panel>

        <q-tab-panel v-if="userStore.isAdmin" name="errors">
          <ManageErrors />
        </q-tab-panel>
      </q-tab-panels>

      <q-dialog full-width position="bottom" v-model="prompt.dialog">
        <PromptCard v-bind="prompt" @hideDialog="prompt = {}" />
      </q-dialog>

      <q-dialog full-width position="bottom" v-model="entry.dialog">
        <EntryCard v-bind="entry" @hideDialog="entry = {}" />
      </q-dialog>
    </q-page>
  </q-page-container>
</template>

<script setup>
import EntryCard from 'src/components/Admin/EntryCard.vue'
import ManageErrors from 'src/components/Admin/ManageErrors.vue'
import ManageFeedbacks from 'src/components/Admin/ManageFeedbacks.vue'
import ManagePromptsEntries from 'src/components/Admin/ManagePromptsEntries.vue'
import ManageUsers from 'src/components/Admin/ManageUsers.vue'
import PromptCard from 'src/components/Admin/PromptCard.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, usePromptStore, useRequestStore, useUserStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const requestStore = useRequestStore()
const userStore = useUserStore()

const entry = ref({})
const prompt = ref({})
const tab = ref('posts')
const entryStore = useEntryStore()
const promptStore = usePromptStore()

onMounted(() => {
  userStore.fetchUsers()
  requestStore.readRequests()
})

function openPromptDialog(props) {
  prompt.value = props?.id ? props : {}
  prompt.value.dialog = true
}

function openEntryDialog() {
  entry.value = {}
  entry.value.dialog = true
}
</script>
