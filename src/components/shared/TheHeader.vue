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
        <span class="float-right text-secondary">{{ subtitle }}</span>
      </q-toolbar-title>
      <NotificationBubble v-if="notificationButton && userStore.isAuthenticated" />
      <q-btn
        v-if="feedbackButton"
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
    </q-toolbar>
    <q-toolbar v-if="searchInput">
      <q-toolbar-title>
        <q-input
          class="q-pb-lg text-black"
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
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'src/stores'
import { useRouter } from 'vue-router'
import NotificationBubble from './NotificationBubble.vue'

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

const router = useRouter()

const userStore = useUserStore()

function goBack() {
  router.go(-1)
}

function goToFeedback() {
  router.push('/profile/feedback')
}
</script>
