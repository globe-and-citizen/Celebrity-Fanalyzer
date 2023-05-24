<template>
  <q-header class="bg-white" elevated reveal>
    <q-toolbar>
      <q-toolbar-title v-if="logo">
        <q-img src="~assets/logo.svg" width="1.7rem" />
        <span class="q-ml-sm inline row text-secondary">
          <b>Celebrity</b>
          Fanalyzer
        </span>
      </q-toolbar-title>
      <q-toolbar-title>
        <q-btn v-if="backButton" color="secondary" flat icon="arrow_back_ios" round size="sm" @click="goBack" />
        <b class="text-secondary">{{ title }}</b>
        <span class="float-right text-secondary">{{ subtitle }}</span>
      </q-toolbar-title>
      <q-btn v-if="feedbackButton" flat icon="feedback" round size="1rem" text-color="secondary" @click="goToFeedback" />
      <slot />
    </q-toolbar>
    <q-toolbar v-if="searchInput">
      <q-toolbar-title>
        <q-input
          class="q-pb-lg text-black"
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

defineProps({
  backButton: { type: Boolean, required: false, default: true },
  logo: { type: Boolean, required: false, default: false },
  modelValue: { required: false },
  feedbackButton: { type: Boolean, required: false, default: false },
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
  router.push('/profile')
  userStore.setProfileTab('feedback')
}
</script>
