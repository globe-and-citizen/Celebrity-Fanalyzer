<template>
  <TheHeader :backButton="false" feedbackButton title="Stats" />
  <q-page-container style="max-width: none">
    <q-page padding>
      <h6 class="q-my-md">Select a prompt to check its stats</h6>
      <q-select
        label="Prompts"
        optionLabel="title"
        optionValue="id"
        :options="promptStore.getPrompts"
        outlined
        v-model="prompt"
        @update:modelValue="onFetchSummary"
      />
      <Transition name="slide-fade">
        <q-table
          v-if="statStore.getSummary.length"
          class="q-my-md"
          :columns="colums"
          hide-bottom
          :loading="statStore.isLoading"
          :pagination="pagination"
          :rows="statStore.getSummary"
        />
      </Transition>
    </q-page>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, usePromptStore, useStatStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const entryStore = useEntryStore()
const promptStore = usePromptStore()
const statStore = useStatStore()

const colums = ref([
  { name: 'post_id', align: 'center', label: 'Entry', field: (row) => row.post_id, sortable: true },
  { name: 'clicks', label: 'Clicks', field: 'clicks', sortable: true },
  { name: 'keypresses', label: 'Keypresses', field: 'keypresses', sortable: true },
  { name: 'mousemovements', label: 'Mouse Movements', field: (row) => row.mousemovements + 'px', sortable: true },
  { name: 'scrolls', label: 'Scrolls', field: (row) => row.scrolls + 'px', sortable: true },
  { name: 'totaltime', label: 'Time Spent', field: (row) => row.totaltime + 's', sortable: true }
])
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }
const prompt = ref(null)

onMounted(async () => {
  if (!promptStore.getPrompts.length) {
    await promptStore.fetchPrompts()
  }
  if (!entryStore.getEntries.length) {
    await entryStore.fetchEntries()
  }
})

async function onFetchSummary() {
  if (prompt.value) {
    await statStore.fetchSummary(prompt.value.id)
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
