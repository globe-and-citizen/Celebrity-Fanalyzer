<template>
  <q-header class="bg-white" elevated reveal>
    <q-toolbar>
      <q-toolbar-title>
        <q-btn v-if="backBtn" color="secondary" flat icon="arrow_back_ios" round size="sm" @click="goBack" />
        <b class="text-secondary">{{ title }}</b>
      </q-toolbar-title>
      <q-btn v-if="notificationBtn" flat icon="notifications" round size="1rem" text-color="secondary" />
      <slot />
    </q-toolbar>
    <q-toolbar v-if="isSearch">
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
import { useRouter } from 'vue-router'

defineProps({
  backBtn: { type: Boolean, required: false, default: true },
  notificationBtn: { type: Boolean, required: false, default: false },
  isSearch: { type: Boolean, required: false, default: false },
  title: { type: String, required: false },
  modelValue: { required: false }
})

const router = useRouter()

function goBack() {
  router.go(-1)
}
</script>
