<template>
  <TheHeader :backButton="false" feedbackButton title="Stats" />
  <q-page-container style="max-width: none">
    <q-page padding>
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
          title="Data on average for each user"
          wrap-cells
        />
      </Transition>
    </q-page>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, usePromptStore, useStatStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'

const entryStore = useEntryStore()
const promptStore = usePromptStore()
const statStore = useStatStore()

const colums = ref([
  {
    name: 'post_id',
    align: 'left',
    label: 'Entry',
    field: (row) => entries.value?.find((entry) => entry.id === row.post_id)?.title ?? 'Deleted',
    sortable: true
  },
  { name: 'visits', label: 'Visits', field: 'visits', sortable: true },
  { name: 'visitors', label: 'Visitors', field: 'visitors', sortable: true },
  { name: 'clicks', label: 'Clicks', field: 'clicks', sortable: true },
  { name: 'keypresses', label: 'Keypresses', field: 'keypresses', sortable: true },
  { name: 'mousemovements', label: 'Mouse Movements', field: (row) => row.mousemovements + 'px', sortable: true },
  { name: 'scrolls', label: 'Scrolls', field: (row) => row.scrolls + 'px', sortable: true },
  { name: 'totaltime', label: 'Time Spent', field: (row) => row.totaltime + 's', sortable: true }
])
const entries = computed(() => {
  return (
    entryStore.getEntries
      ?.filter((entry) => entry.prompt === prompt.value?.id)
      ?.map((entry) => ({ id: entry.id, title: entry.title, author: entry.author.username, slug: entry.slug })) ?? []
  )
})
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }
const prompt = ref(null)

onMounted(async () => {
  if (!promptStore.getPrompts?.length) {
    await promptStore.fetchPrompts()
  }

  prompt.value = promptStore.getPrompts[0]
  onFetchSummary()

  if (!entryStore.getEntries?.length) {
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
