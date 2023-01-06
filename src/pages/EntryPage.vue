<template>
  <q-spinner v-if="entryStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-page v-else class="bg-white">
    <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="article?.image" />
    <section class="q-pa-md" style="margin-top: 100%">
      <h1 class="q-mt-none text-bold text-h5">{{ article.title }}</h1>
      <p class="text-body1" v-html="article.description"></p>
      <div class="q-mb-md">
        <q-badge v-for="(category, index) of article.categories" class="q-mx-xs" :key="index" rounded>
          {{ category }}
        </q-badge>
      </div>
      <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="article.info?.likes.length">
        <q-tooltip>Like</q-tooltip>
      </q-btn>
      <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="article.info?.dislikes.length">
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
    <TheComments :comments="comments" :entry="article" v-show="showComments" />
    <q-separator />
  </q-page>
</template>

<script setup>
import TheComments from 'src/components/TheComments.vue'
import { useEntryStore, usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()
const promptStore = usePromptStore()
const entry = ref({})

const article = ref({})
const comments = ref([])
const showComments = ref(false)

onMounted(async () => {
  if (promptStore.getPrompts?.length) {
    article.value = promptStore.getPrompts
      .find((prompt) => prompt.date === `${router.currentRoute.value.params.year}-${router.currentRoute.value.params.month}`)
      .entries.find((entry) => entry.slug === router.currentRoute.value.href)
    return
  }
  if (!entryStore.getEntries?.length) {
    await entryStore
      .fetchEntryBySlug(router.currentRoute.value.href)
      .then((res) => (article.value = res))
      .catch(() => router.push('/404'))
    return
  }
})

function toggleComments() {
  showComments.value = !showComments.value
}
</script>

<style scoped lang="scss">
.parallax {
  position: fixed;
  top: 0;
  z-index: -1;
}
</style>
