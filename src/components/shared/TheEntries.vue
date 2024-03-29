<template>
  <section
    class="bg-white q-mb-xl q-pa-md q-page-container entries-page-container"
    :data-test="props.entries ? 'entries' : ''"
    style="padding-bottom: 7rem"
  >
    <h2 class="q-my-auto text-bold text-h5 q-pa-md">Entries</h2>
    <div class="card-items-wrapper">
      <ItemCard v-for="entry in entries" :item="entry" :key="entry?.id" :link="entry.slug" data-test="entry" />
    </div>
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

<style lang="scss" scoped>
.entries-page-container {
  max-width: 100%;
}

.card-items-wrapper {
  display: grid;
  margin: 0;
  justify-items: center;
  row-gap: 16px;
  column-gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(619px, 1fr));

  @media (max-width: 1440px) {
    grid-template-columns: repeat(auto-fill, minmax(590px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(470px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(361px, 1fr));
  }

  @media (max-width: 425px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
