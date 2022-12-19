<template>
  <q-header class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">This Month</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <section v-if="monthPrompt">
      <a :href="monthPrompt.slug">
        <q-img :src="monthPrompt.image" spinner-color="primary" style="border: 3px solid #e54757; border-radius: 12px" />
      </a>

      <TheEntries :entries="monthPrompt.entries" />
    </section>
    <section v-else class="q-my-xl text-center">
      <q-spinner color="primary" size="3em" />
    </section>
  </q-page>
</template>

<script setup>
import TheEntries from 'src/components/TheEntries.vue'
import { useEntryStore, usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const entryStore = useEntryStore()
const promptStore = usePromptStore()

const monthPrompt = ref(promptStore.getMonthPrompt)

onMounted(async () => {
  await promptStore.fetchMonthPrompt()
  monthPrompt.value = promptStore.getMonthPrompt

  if (!monthPrompt.value.entries.length) {
    await entryStore.fetchEntries(monthPrompt.value.date)
    monthPrompt.value.entries = entryStore.getEntries
  }
})
</script>
