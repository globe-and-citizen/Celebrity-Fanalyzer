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

      <q-tabs active-color="primary" align="justify">
        <q-route-tab data-test="posts-tab" name="posts" icon="view_list" label="Prompts & Entries" to="prompts" />
        <q-route-tab
          to="users"
          exact
          v-if="userStore.isAdmin"
          data-test="users-tab"
          name="users"
          icon="people"
          label="Users"
        />
        <q-route-tab
          v-if="userStore.isEditorOrAbove"
          data-test="feedbacks-tab"
          name="feedbacks"
          icon="feedback"
          label="Feedbacks"
          to="feedbacks"
          exact
        />

        <q-route-tab
          v-if="userStore.isAdmin"
          to="errors"
          exact
          data-test="errors-tab"
          name="errors"
          icon="error"
          label="Errors"
        />

        <q-route-tab
          v-if="userStore.isEditorOrAbove"
          data-test="reports-tab"
          name="reports"
          icon="report"
          label="Reports"
          to="/reports"
        />
      </q-tabs>

      <q-dialog full-width position="bottom" v-model="prompt.dialog">
        <PromptCard v-bind="prompt" @hideDialog="prompt = {}" />
      </q-dialog>

      <q-dialog full-width position="bottom" v-model="entry.dialog">
        <EntryCard v-bind="entry" @hideDialog="entry = {}" />
      </q-dialog>

      <router-view @openPromptDialog="openPromptDialog"/>
    </q-page>
  </q-page-container>
</template>

<script setup>
import EntryCard from 'src/components/Admin/EntryCard.vue'
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
