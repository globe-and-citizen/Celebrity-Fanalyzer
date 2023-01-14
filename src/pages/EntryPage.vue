<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />

  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="entry" style="padding: 0">
      <q-page class="bg-white">
        <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="entry?.image" />
        <section class="q-pa-md" style="margin-top: 100%">
          <h1 class="q-mt-none text-bold text-h5">{{ entry.title }}</h1>
          <p class="text-body1" v-html="entry.description"></p>
          <div class="q-mb-md">
            <q-badge v-for="(category, index) of entry.categories" class="q-mx-xs" :key="index" rounded>
              {{ category }}
            </q-badge>
          </div>
          <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="countLikes" @click="like()">
            <q-tooltip>Like</q-tooltip>
          </q-btn>
          <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="countDislikes" @click="dislike()">
            <q-tooltip>Dislike</q-tooltip>
          </q-btn>
          <q-btn flat rounded icon="chat_bubble_outline" :label="entry.info?.comments" @click="toggleComments()">
            <q-tooltip>Comments</q-tooltip>
          </q-btn>
          <ShareComponent :count="0"></ShareComponent>
        </section>
        <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate />
        <TheComments :comments="comments" v-show="showComments" />
        <q-separator />
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="stats" class="bg-white">
      <q-page>
        <BarGraph :data="chartData" title="Likes & Dislikes" />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import BarGraph from 'src/components/BarGraph.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import TheComments from 'src/components/TheComments.vue'
import { useEntryStore, useLikeStore, usePromptStore, useCommentStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const commentStore = useCommentStore()

const chartData = ref([])
const comments = ref([])
const countLikes = ref(0)
const countDislikes = ref(0)
const entry = ref({})
const showComments = ref(false)
const tab = ref('entry')

onMounted(async () => {
  if (router.currentRoute.value.params.id) {
    await entryStore
      .fetchEntryBySlug(router.currentRoute.value.href)
      .then((res) => (entry.value = res))
      .catch(() => (entry.value = null))
  }

  await commentStore
    .fetchComments(router.currentRoute.value.href)
    .then((res) => (comments.value = res))
    console.log(comments.value)

  await likeStore.countEntryLikes(entry.value.id).then((res) => {
    countLikes.value = res.likes
    countDislikes.value = res.dislikes
  })

  chartData.value = [
    { value: countLikes, name: 'Likes' },
    { value: countDislikes, name: 'Dislikes' }
  ]
})

commentStore.$subscribe((_mutation, state) => {
  comments.value = state._comments
  if (!entry.value) {
    router.push('/404')
    return
  }
})

likeStore.$subscribe((_mutation, state) => {
  countLikes.value = state._likes
  countDislikes.value = state._dislikes
})

function like() {
  likeStore.likeEntry(entry.value.id)
}

function dislike() {
  likeStore.dislikeEntry(entry.value.id)
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
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
