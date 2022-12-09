<template>
  <section class="q-pa-md">
    <q-scroll-area :thumb-style="{ display: 'none' }" style="height: 3.8rem">
      <q-btn-toggle
        v-model="subject"
        class="q-my-sm"
        color="white"
        no-caps
        no-wrap
        rounded
        unelevated
        text-color="secondary"
        :options="subjects"
      />
    </q-scroll-area>
    <h2 class="q-my-auto text-bold text-h5">Entries</h2>
    <q-separator />
    <ItemCard v-for="entry in entries" :key="entry?.id" :item="entry" :link="`/entry/${entry.slug}`"></ItemCard>
    <div v-if="entryStore.isLoading" class="q-my-xl text-center">
      <q-spinner color="primary" size="3em" />
    </div>
    <h6 v-else-if="!entries?.length" class="text-center">NO ENTRIES</h6>
  </section>
</template>

<script setup>
import { useEntryStore } from 'src/stores'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemCard from 'components/ItemCard.vue'

const props = defineProps(['entries'])

const router = useRouter()
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
