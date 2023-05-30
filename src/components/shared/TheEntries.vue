<template>
  <section class="bg-white q-mb-xl q-pa-md q-page-container" style="padding-bottom: 7rem">
    <h2 class="q-my-auto text-bold text-h5">Entries</h2>
    <q-separator />
    <ItemCard v-for="entry in entries" :item="entry" :key="entry?.id" :link="entry.slug" />
    <q-spinner v-if="entryStore.isLoading" color="primary" size="3em" class="block q-mx-auto q-my-xl" />
    <h6 v-else-if="!entries?.length" class="text-center">NO ENTRIES</h6>
  </section>
</template>

<script setup>
import ItemCard from 'src/components/shared/ItemCard.vue'
import { useEntryStore } from 'src/stores'

const props = defineProps(['entries'])

const entryStore = useEntryStore()
</script>
