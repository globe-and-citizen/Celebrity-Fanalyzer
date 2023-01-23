<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom bg-white" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />

  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="entry" style="padding: 0">
      <q-page class="bg-white">
        <q-header>
          <q-toolbar class="bg-white q-px-lg shadow-1">
            <q-toolbar-title>
              <b class="text-secondary">Entry Page</b>
            </q-toolbar-title>
          </q-toolbar>
        </q-header>
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
          <q-btn flat rounded icon="chat_bubble_outline" :label="comments.length" @click="tab = 'comments'">
            <q-tooltip>Comments</q-tooltip>
          </q-btn>
          <ShareComponent :label="countShares" @share="onShare($event)" />
        </section>
        <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate />

        <q-separator />
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="stats" class="bg-white">
      <q-header>
        <q-toolbar class="bg-white q-px-lg shadow-1">
          <q-toolbar-title>
            <b class="text-secondary">Stats Page</b>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page>
        <BarGraph :data="chartData" title="Likes & Dislikes" />
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="comments" class="bg-white">
      <q-header>
        <q-toolbar class="bg-white q-px-lg shadow-1">
          <q-toolbar-title>
            <b class="text-secondary">Comments</b>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page>
        <TheComments :comments="comments" :entry="entry" />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import BarGraph from 'src/components/BarGraph.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import TheComments from 'src/components/TheComments.vue'
import { useCommentStore, useEntryStore, useLikeStore, usePromptStore, useShareStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const commentStore = useCommentStore()
const entryStore = useEntryStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()

const chartData = ref([])
const comments = ref([])
const countLikes = ref(0)
const countDislikes = ref(0)
const countShares = ref(0)
const entry = ref({})
const tab = ref('entry')

onMounted(async () => {
  if (router.currentRoute.value.params.id) {
    await entryStore
      .fetchEntryBySlug(router.currentRoute.value.href)
      .then((res) => (entry.value = res))
      .catch(() => (entry.value = null))
  }

  if (!entry.value) {
    router.push('/404')
    return
  }

  await commentStore.fetchComments(router.currentRoute.value.href)
  comments.value = commentStore.getComments

  await likeStore.countEntryLikes(entry.value.id).then((res) => {
    countLikes.value = res.likes
    countDislikes.value = res.dislikes
  })
  await shareStore.countEntryShares(entry.value.id)
  countShares.value = shareStore.getShares

  chartData.value = [
    { value: countLikes, name: 'Likes' },
    { value: countDislikes, name: 'Dislikes' }
  ]
})

commentStore.$subscribe((_mutation, state) => {
  comments.value = state._comments
})

likeStore.$subscribe((_mutation, state) => {
  countLikes.value = state._likes
  countDislikes.value = state._dislikes
})

shareStore.$subscribe((_mutation, state) => {
  countShares.value = state._shares
})

function like() {
  likeStore.likeEntry(entry.value.id)
}

function dislike() {
  likeStore.dislikeEntry(entry.value.id)
}

function onShare(socialNetwork) {
  shareStore.shareEntry(entry.value.id, socialNetwork)
}
</script>

<style scoped lang="scss">
.parallax {
  position: fixed;
  top: 65px;
  z-index: -1;
}
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
