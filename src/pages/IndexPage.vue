<template>
  <q-header class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <q-img src="~assets/logo.svg" width="1.7rem" />
        <span class="q-ml-sm inline row text-secondary">
          <b>Celebrity</b>
          Fanalyzer
        </span>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md">
    <section v-if="monthPrompt">
      <a :href="`prompt/${monthPrompt.slug}`">
        <q-img :src="monthPrompt.image" spinner-color="primary" style="border: 3px solid #e54757; border-radius: 12px" />
      </a>

      <TheEntries :promptId="monthPrompt.id" />
    </section>
    <section v-else class="q-my-xl text-center">
      <q-spinner color="primary" size="3em" />
    </section>
  </q-page>
</template>

<script setup>
import TheEntries from 'src/components/TheEntries.vue'
import { usePromptStore } from 'src/stores'
import { ref, watchEffect } from 'vue'

const promptStore = usePromptStore()

const monthPrompt = ref(promptStore.getMonthPrompt)

watchEffect(async () => {
  await promptStore.fetchMonthPrompt()
  monthPrompt.value = promptStore.getMonthPrompt
})
</script>
