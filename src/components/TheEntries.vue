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
    <article
      v-for="entry in entries"
      class="q-pt-md relative-position row"
      :key="entry?.id"
      v-ripple:primary
      @click="goToEntry(entry.slug)"
    >
      <div class="col-8">
        <div class="flex items-center">
          <q-avatar size="2rem">
            <q-img :src="entry.author.photoURL" />
          </q-avatar>
          <p class="q-mb-none q-ml-sm text-body1">
            {{ entry.author.displayName.length > 20 ? entry.author.displayName.substring(0, 20) + '...' : entry.author.displayName }}
          </p>
        </div>
        <h2 class="q-mb-none text-body1 text-bold">
          {{ entry.title.length > 40 ? entry.title.substring(0, 40) + '...' : entry.title }}
        </h2>
        <p class="q-my-none text-body2 text-secondary">
          {{ entry.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }} &nbsp;•&nbsp; 9 min read
        </p>
      </div>
      <q-img class="col-4" :ratio="1" :src="entry.image" spinner-color="primary" spinner-size="3rem" style="border-radius: 24px" />
      <q-separator class="full-width q-mt-md" />
    </article>
    <h6 v-if="!entries.length" class="text-center">NO ENTRIES</h6>
  </section>
</template>

<script setup>
import { useEntryStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const props = defineProps(['promptId'])
const entryStore = useEntryStore()

const entries = ref([])
const subject = ref('Multinational Support')
const subjects = [
  { label: 'Multinational Support', value: 'Multinational Support' },
  { label: 'Bipartisanship', value: 'Bipartisanship' },
  { label: 'Likes', value: 'Likes' },
  { label: 'Dislikes', value: 'Dislikes' },
  { label: 'Comments', value: 'Comments' },
  { label: 'Shares', value: 'Shares' }
]

onMounted(async () => {
  await props.promptId
  await entryStore.fetchEntries(props.promptId)
  entries.value = entryStore.getEntries
})
</script>
