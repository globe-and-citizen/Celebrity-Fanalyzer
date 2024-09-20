<template>
  <q-header class="bg-white" elevated reveal>
    <q-toolbar>
      <q-toolbar-title v-if="logo" class="flex items-center">
        <q-img src="logo.svg" width="1.7rem" />
        <span class="q-ml-sm inline row text-secondary">
          <b>Celebrity</b>
          Fanalyzer
        </span>
      </q-toolbar-title>
      <q-toolbar-title v-if="backButton || title || subtitle">
        <q-btn v-if="backButton" color="secondary" flat icon="arrow_back_ios" round size="sm" @click="goBack" />
        <b class="text-secondary" data-test="title">{{ title }}</b>
        <q-icon v-if="subtitle" name="arrow_forward" color="secondary" class="q-px-sm" />
        <span v-if="subtitle" class="text-secondary">{{ subtitle }}</span>
      </q-toolbar-title>
      <NotificationBubble v-if="notificationButton && userStore.isAuthenticated" />
      <q-btn
        v-if="feedbackButton && userStore.isAuthenticated"
        color="secondary"
        data-test="feedback-button"
        flat
        icon="feedback"
        round
        size="1rem"
        @click="goToFeedback"
      >
        <q-tooltip>Feedback</q-tooltip>
      </q-btn>
      <slot />
      <q-btn-dropdown
        v-if="userStore.isAuthenticated"
        auto-close
        color="secondary"
        dropdown-icon="apps"
        flat
        round
        transition-show="jump-down"
        transition-hide="jump-up"
        size="1rem"
      >
        <q-list style="min-width: 100px">
          <q-item v-if="userStore.isEditorOrAbove" clickable @click="openPromptDialog()">
            <q-item-section>New Prompt</q-item-section>
          </q-item>
          <q-item clickable @click="openEntryDialog()">
            <q-item-section>New Entry</q-item-section>
          </q-item>
          <q-item clickable @click="openAdvertiseDialog()">
            <q-item-section>New Advertise</q-item-section>
          </q-item>
          <q-item v-if="userStore.isAdmin && uniqueUsers?.length" clickable @click="addAllUsersToStatsDb()">
            <q-item-section>Add new users</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
    <q-toolbar v-if="searchInput">
      <q-toolbar-title>
        <q-input
          class="q-pb-lg text-black full-width"
          data-test="search-input"
          dense
          label="Search"
          rounded
          standout="bg-secondary text-white"
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar-title>
      <q-btn
        :color="selectedDate ? 'primary' : 'secondary'"
        class="q-mb-lg"
        data-test="filter-button"
        flat
        icon="tune"
        round
        size="1rem"
        style="height: 100%"
        @click="openFilter = true"
      >
        <q-tooltip>Filter</q-tooltip>
      </q-btn>
    </q-toolbar>

    <q-dialog full-width position="bottom" v-model="prompt.dialog">
      <PromptCard v-bind="prompt" @hideDialog="prompt = {}" />
    </q-dialog>

    <q-dialog full-width position="bottom" v-model="entry.dialog">
      <EntryCard v-bind="entry" @hideDialog="entry = {}" />
    </q-dialog>

    <q-dialog class="min-" position="bottom" v-model="advertise.dialog">
      <AdvertiseCard v-bind="advertise" @hideDialog="advertise = {}" />
    </q-dialog>

    <q-dialog v-model="openFilter" persistent>
      <q-card style="width: 400px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 16px">
        <q-card-section class="row justify-center" style="padding: 10px 0">
          <p style="font-weight: bold; color: #333">Filter by:</p>
          <q-input standard type="date" label="Date" style="width: 100%; margin-top: 10px" v-model="selectedDate" />
        </q-card-section>

        <q-card-actions class="row justify-between">
          <q-btn flat label="Clear" color="primary" style="margin-right: 10px" @click="clearFilters" />
          <div>
            <q-btn flat label="Cancel" color="primary" v-close-popup style="margin-right: 10px" />
            <q-btn flat label="Apply" color="primary" v-close-popup @click="$emit('updateSearchDate', selectedDate)" />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'src/stores'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import NotificationBubble from './NotificationBubble.vue'
import EntryCard from 'src/components/Admin/EntryCard.vue'
import PromptCard from 'src/components/Admin/PromptCard.vue'
import AdvertiseCard from 'src/components/Advertiser/AdvertiseCard.vue'

defineProps({
  backButton: { type: Boolean, required: false, default: true },
  logo: { type: Boolean, required: false, default: false },
  modelValue: { required: false },
  feedbackButton: { type: Boolean, required: false, default: false },
  notificationButton: { type: Boolean, required: false, default: false },
  searchInput: { type: Boolean, required: false, default: false },
  subtitle: { type: String, required: false },
  title: { type: String, required: false }
})
const emit = defineEmits(['updateSearchDate', 'update:modelValue'])

const router = useRouter()

const entry = ref({})
const prompt = ref({})
const advertise = ref({})
const userStore = useUserStore()
const openFilter = ref(false)
const selectedDate = ref('')

const uniqueUsers = computed(() => {
  const firebaseUsers = userStore?.getUsers?.map((user) => user.uid) || []
  const statsUsersIds = userStore.getAllUsers?.usersList.map((user) => user.user_id) || []
  return firebaseUsers.filter((user) => !statsUsersIds.includes(user))
})

onMounted(async () => {
  await userStore.fetchUsers()
  await userStore.getStatsUsers()
})

const addAllUsersToStatsDb = () => {
  const allUsersMap = userStore?.getUsers.map((user) => {
    return { user_id: user.uid }
  })
  userStore.addAllUsers(allUsersMap)
}

function goBack() {
  router.go(-1)
}

function goToFeedback() {
  router.push('/profile/feedback')
}

function openPromptDialog(props) {
  prompt.value = props?.id ? props : {}
  prompt.value.dialog = true
}

function openEntryDialog() {
  entry.value = {}
  entry.value.dialog = true
}

function openAdvertiseDialog(props) {
  advertise.value = props?.id ? props : {}
  advertise.value.dialog = true
}

function clearFilters() {
  selectedDate.value = ''
  emit('updateSearchDate', selectedDate.value)
}
</script>
