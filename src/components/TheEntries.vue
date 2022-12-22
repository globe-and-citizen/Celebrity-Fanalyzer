<template>
  <section class="q-pa-md">
    <q-scroll-area :thumb-style="{ display: 'none' }" style="height: 3.8rem">
      <q-btn-toggle
        class="q-my-sm"
        color="white"
        no-caps
        no-wrap
        :options="subjects"
        rounded
        unelevated
        text-color="secondary"
        v-model="subject"
      />
    </q-scroll-area>
    <h2 class="q-my-auto text-bold text-h5">Entries</h2>
    <q-separator />
    <ItemCard v-for="entry in entries" :item="entry" :key="entry?.id" :link="entry.slug" />
    <div v-if="entryStore.isLoading" class="q-my-xl text-center">
      <q-spinner color="primary" size="3em" />
    </div>
    <h6 v-else-if="!entries?.length" class="text-center">NO ENTRIES</h6>
  </section>
</template>

<script setup>
import ItemCard from 'src/components/ItemCard.vue'
import { useEntryStore } from 'src/stores'
import { ref } from 'vue'

const props = defineProps(['entries'])

const entryStore = useEntryStore()

const subject = ref('Multinational Support')
const subjects = [
  { label: 'Multinational Support', value: 'Multinational Support' },
  { label: 'Bipartisanship', value: 'Bipartisanship' },
  { label: 'Likes', value: 'Likes' },
  { label: 'Dislikes', value: 'Dislikes' },
  { label: 'Comments', value: 'Comments' },
  { label: 'Shares', value: 'Shares' }
]
</script>
