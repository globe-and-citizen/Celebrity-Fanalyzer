<template>
  <!--  <q-spinner v-if="!article && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />-->
  <q-page class="bg-white">
    <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="article?.image" />
    <section class="q-pa-md" style="margin-top: 100%">
      <h1 class="q-mt-none text-bold text-h5">{{ article.title }}</h1>
      <p class="text-body1" v-html="article.description"></p>
      <div class="q-mb-md">
        <q-badge v-for="(category, index) of article.categories" class="q-mx-xs" :key="index" rounded>
          {{ category }}
        </q-badge>
      </div>
      <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="article.likesCount" @click="like()">
        <q-tooltip>Like</q-tooltip>
      </q-btn>
      <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="article.dislikesCount" @click="dislike()">
        <q-tooltip>Dislike</q-tooltip>
      </q-btn>
      <q-btn flat rounded icon="chat_bubble_outline" :label="article.info?.comments" @click="toggleComments()">
        <q-tooltip>Comments</q-tooltip>
      </q-btn>
      <ShareComponent :count="0"></ShareComponent>
    </section>
    <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate />
    <TheComments :comments="comments" v-show="showComments" />
    <q-separator />
  </q-page>
</template>

<script setup>
import TheComments from 'src/components/TheComments.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import { useEntryStore, usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from 'src/firebase'

const router = useRouter()

const entryStore = useEntryStore()
const promptStore = usePromptStore()

const article = ref({})
const comments = ref([])
const showComments = ref(false)

onMounted(async () => {
  const promptDate = `${router.currentRoute.value.params.year}-${router.currentRoute.value.params.month}`
  await promptStore.fetchPromptById(promptDate)
  const prompt = promptStore.getPromptById(promptDate)
  await promptStore.fetchPromptEntry(prompt.id)
  // Fetch his entries
  // And use his entries.
  const entrySlug = router.currentRoute.value.href
  if (!prompt) {
    await router.push('/404')
  }
  article.value = prompt.entries.find((entry) => entry.slug === entrySlug)

  if (!article.value) {
    await router.push('/404')
  }

  await reloadLikesDislikesCount()
})

async function like() {
  const id = article.value.id
  await entryStore
    .addLike(id)
    .then(async () => {
      await reloadLikesDislikesCount()
    })
    .catch((error) => {
      console.error('Error on like', error)
    })
}

async function reloadLikesDislikesCount() {
  const likeQuery_ = query(collection(db, 'entries', article.value.id, 'opinions'), where('liked', '==', true))
  const dislikeQuery_ = query(collection(db, 'entries', article.value.id, 'opinions'), where('liked', '==', false))

  const likeSnapshot = await getCountFromServer(likeQuery_)
  const dislikeSnapshot = await getCountFromServer(dislikeQuery_)

  const likesCount = likeSnapshot.data().count
  const dislikesCount = dislikeSnapshot.data().count
  article.value = { ...article.value, likesCount, dislikesCount }
}

function dislike() {
  const id = article.value.id
  console.log(id)
  entryStore
    .addDislike(id)
    .then(async () => {
      await reloadLikesDislikesCount()
    })
    .catch((error) => {
      console.error('Error on like', error)
    })
}

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
