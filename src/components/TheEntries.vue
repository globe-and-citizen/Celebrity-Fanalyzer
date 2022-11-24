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
  </section>
</template>

<script setup>
// import { useEntryStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const props = defineProps(['promptId'])

// onMounted(async () => {
// TODO: obtain prompt id from props
// await entryStore.fetchEntries()
// })

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
