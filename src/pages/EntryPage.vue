<template>
  <section v-if="entryStore.isLoading" class="q-my-xl text-center">
    <q-spinner color="primary" size="3em" />
  </section>
  <q-page v-else>
    <q-img :ratio="21 / 9" :src="article?.image" spinner-color="primary" spinner-size="82px" />
    <section class="q-pa-md">
      <h1 class="q-mt-none text-bold text-h5">{{ article.title }}</h1>
      <p class="text-body1" v-html="article.description"></p>
      <div class="q-mb-md">
        <q-badge v-for="(category, index) of article.categories" class="q-mx-xs" :key="index" rounded>
          {{ category }}
        </q-badge>
      </div>
      <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="article.info?.likes">
        <q-tooltip>Like</q-tooltip>
      </q-btn>
      <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="article.info?.dislikes">
        <q-tooltip>Dislike</q-tooltip>
      </q-btn>
      <q-btn flat rounded icon="chat_bubble_outline" :label="article.info?.comments" @click="toggleComments()">
        <q-tooltip>Comments</q-tooltip>
      </q-btn>
      <q-btn flat rounded icon="share" :label="article.info?.shares">
        <q-tooltip>Share</q-tooltip>
      </q-btn>
    </section>
    <q-separator />
    <TheComments :comments="comments" v-show="showComments" />
    <q-separator />
  </q-page>
</template>

<script setup>
import TheComments from 'src/components/TheComments.vue'
import { useEntryStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()

const article = ref({})
const comments = ref([])
const showComments = ref(false)

onMounted(async () => {
  if (!entryStore.getEntries?.length) {
    await entryStore.fetchEntries() // TODO: Missing ID here
  }
  article.value = entryStore.getEntries.find((entry) => entry.slug === router.currentRoute.value.params.id)
})

function toggleComments() {
  showComments.value = !showComments.value
}
</script>
