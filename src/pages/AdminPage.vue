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
        <q-item clickable @click="openPromptDialog()" :data-test="promptStore.isLoading || entryStore.isLoading ? '' : 'prompt-dropdown'">
          <q-item-section>New Prompt</q-item-section>
        </q-item>
        <q-item clickable @click="openEntryDialog()" :data-test="promptStore.isLoading || entryStore.isLoading ? '' : 'entry-dropdown'">
          <q-item-section>New Entry</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </TheHeader>
  <section class="absolute-center window-width">
    <q-page padding>
      <q-tabs align="justify" v-model="tab" class="text-secondary">
        <q-tab v-if="userStore.isAdminOrWriter" name="posts" icon="view_list" label="Prompts & Entries" />
        <q-tab v-if="userStore.isAdmin" name="users" icon="people" label="Users" />
        <q-tab v-if="userStore.isAdminOrWriter" name="feedbacks" icon="feedback" label="Feedbacks" />
        <q-tab v-if="userStore.isAdmin" name="errors" icon="error" label="Errors" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated swipeable>
        <q-tab-panel v-if="userStore.isAdminOrWriter" name="posts">
          <ManagePromptsEntries @openPromptDialog="openPromptDialog" />
        </q-tab-panel>

        <q-tab-panel v-if="userStore.isAdmin" name="users">
          <ManageUsers :users="users" />
        </q-tab-panel>

        <q-tab-panel v-if="userStore.isAdminOrWriter" name="feedbacks">
          <ManageFeedbacks />
        </q-tab-panel>

        <q-tab-panel v-if="userStore.isAdmin" name="errors">
          <ManageErrors />
        </q-tab-panel>
      </q-tab-panels>
    </q-page>

    <q-dialog full-width position="bottom" v-model="prompt.dialog">
      <PromptCard v-bind="prompt" @hideDialog="prompt = {}" />
    </q-dialog>

    <q-dialog full-width position="bottom" v-model="entry.dialog">
      <EntryCard v-bind="entry" @hideDialog="entry = {}" />
    </q-dialog>
  </section>
</template>

<script setup>
import EntryCard from 'src/components/Admin/EntryCard.vue'
import ManageErrors from 'src/components/Admin/ManageErrors.vue'
import ManageFeedbacks from 'src/components/Admin/ManageFeedbacks.vue'
import ManagePromptsEntries from 'src/components/Admin/ManagePromptsEntries.vue'
import ManageUsers from 'src/components/Admin/ManageUsers.vue'
import PromptCard from 'src/components/Admin/PromptCard.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const userStore = useUserStore()

const entry = ref({})
const prompt = ref({})
const tab = ref('posts')
const users = ref([])
const entryStore = useEntryStore()
const promptStore = usePromptStore()

onMounted(() => {
  userStore.fetchUsers()
})

userStore.$subscribe((_mutation, state) => {
  users.value = state._users.map((user) => {
    user.role = user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'
    return user
  })
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
