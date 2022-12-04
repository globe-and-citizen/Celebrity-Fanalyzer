<template>
  <q-header class="bg-white" elevated>
    <q-toolbar class="q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Search in Month Entries Archive</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
    <q-toolbar>
      <q-toolbar-title>
        <q-input class="q-pb-lg q-px-lg" dense label="Search" rounded standout v-model="search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md">
    <h2 class="q-my-auto text-bold text-h5">{{year}}, {{month}} entries</h2>
    <q-separator class="q-mb-none q-mt-xs" />
    <section v-if="!entries.length && entryStore.isLoading">
      <ArticleSkeleton v-for="index in [0, 1, 2, 3]" :key="index" />
    </section>
    <section>
      <PromptItemCard v-for="entry in entries" :key="entry?.id" :item="entry" :link="`/entry/${entry.slug}`"></PromptItemCard>
    </section>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import PromptItemCard from 'src/components/ItemCard.vue'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useEntryStore } from 'src/stores'

const entryStore = useEntryStore()
const monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const entries = ref(entryStore.getEntries)
const router = useRouter()
const year = ref('')
const month = ref('')

if (monthList.includes(router.currentRoute.value.params.month)) {
  month.value = router.currentRoute.value.params.month
}
year.value = router.currentRoute.value.params.year

onMounted(async () => {
  await entryStore.fetchEntries()
  entries.value = entryStore.getEntries
})
</script>

<style scoped></style>
