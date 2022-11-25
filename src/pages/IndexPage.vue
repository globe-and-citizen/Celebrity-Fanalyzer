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
    <section v-if="currentPrompt">
      <a :href="`prompt/${currentPrompt.slug}`">
        <q-img :src="currentPrompt.image" spinner-color="primary" style="border: 3px solid #e54757; border-radius: 12px" />
      </a>

      <TheEntries :promptId="currentPrompt.id" />
    </section>
    <section v-else>
      <!-- TODO: Add a spinner here -->
      <h5>Loading...</h5>
    </section>
  </q-page>
</template>

<script setup>
import TheEntries from 'src/components/TheEntries.vue'
import { usePromptStore } from 'src/stores'
import { ref, watchEffect } from 'vue'

const promptStore = usePromptStore()

const currentPrompt = ref(promptStore.getCurrentPrompt)

watchEffect(async () => {
  await promptStore.fetchCurrentPrompt()
  currentPrompt.value = promptStore.getCurrentPrompt
})
</script>
