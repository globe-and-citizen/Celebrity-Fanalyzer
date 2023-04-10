<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom bg-white" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />

  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Entry -->
    <q-tab-panel name="entry" style="padding: 0">
      <q-page class="bg-white">
        <TheHeader feedbackButton title="Entry Page" />
        <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="entry?.image" />
        <section class="q-pa-md q-mb-xl" style="margin-top: 100%">
          <h1 class="q-mt-none text-bold text-h5">{{ entry.title }}</h1>
          <p class="text-body1" v-html="entry.description"></p>
          <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="countLikes" @click="like()">
            <q-tooltip>Like</q-tooltip>
          </q-btn>
          <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="countDislikes" @click="dislike()">
            <q-tooltip>Dislike</q-tooltip>
          </q-btn>
          <q-btn
            :data-test="commentStore.isLoading ? '' : 'panel-3-navigator'"
            flat
            rounded
            icon="chat_bubble_outline"
            :label="count"
            @click="tab = 'comments'"
          >
            <q-tooltip>Comments</q-tooltip>
          </q-btn>
          <ShareComponent :label="shares.length" @share="onShare($event)" />
        </section>
        <q-separator inset spaced />
        <section v-if="entry.author" class="flex items-center no-wrap q-pa-md">
          <q-avatar size="6rem">
            <q-img :src="entry.author.photoURL" />
          </q-avatar>
          <div class="q-ml-md">
            <p class="text-body1 text-bold">{{ entry.author.displayName }}</p>
            <p class="q-mb-none" style="white-space: pre-line">{{ entry.author.bio }}</p>
          </div>
        </section>
        <q-separator inset spaced />
        <div class="q-my-xl"></div>
      </q-page>
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="stats" class="bg-white">
      <TheHeader title="Anthrogram" />
      <q-page>
        <section>
          <h1 class="q-mt-none text-bold text-h5">{{ entry?.title }}</h1>
          <div v-if="entry.author" class="flex no-wrap items-center q-mb-xl">
            <q-avatar size="4rem">
              <img :src="entry.author.photoURL" alt="Author Image" />
            </q-avatar>
            <p class="q-mb-none q-ml-md text-h5">{{ entry.author.displayName }}</p>
          </div>
          <q-tabs
            active-color="primary"
            align="justify"
            class="text-grey q-mb-xl"
            dense
            indicator-color="primary"
            narrow-indicator
            v-model="type"
          >
            <q-tab name="day" label="Days" />
            <q-tab name="week" label="Week" />
            <q-tab name="all" label="All" />
          </q-tabs>
          <LikesBar :data="graphData(type)" />
          <SharesPie :data="shares" :interval="type" />
        </section>
      </q-page>
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white">
      <TheHeader title="Comments" />
      <q-page :data-test="!loading ? 'comment-loaded' : 'comment-loading'">
        <TheComments :comments="comments" :entry="entry" />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { Timestamp } from 'firebase/firestore'
import LikesBar from 'src/components/Graphs/LikesBar.vue'
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import TheComments from 'src/components/TheComments.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useShareStore } from 'src/stores'
import { getStats } from 'src/utils/date'
import { formatAllStats, formatDayStats, formatWeekStats } from 'src/utils/stats'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const commentStore = useCommentStore()
const errorStore = useErrorStore()
const entryStore = useEntryStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()

const chartData = ref({})
const comments = ref([])
const countLikes = ref(0)
const countDislikes = ref(0)
const entry = ref({})
const shares = ref([])
const tab = ref('entry')
const type = ref('day')
const count = ref(0)
const loading=ref(true)

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

  await commentStore.fetchComments(router.currentRoute.value.href).catch((error) => errorStore.throwError(error))
  comments.value = commentStore.getComments

  await likeStore.getAllLikesDislikes('entries', entry.value.id).catch((error) => errorStore.throwError(error))

  await shareStore
    .fetchShares('entries', entry.value.id)
    .then(() => (shares.value = shareStore.getShares))
    .catch((error) => errorStore.throwError(error))

  for (const comment of comments.value) {
    if (comment.parentId === undefined) {
      count.value++
    } else {
      continue
    }
  }
  loading.value=false
})

function graphData(type) {
  if (type === 'day') {
    return formatDayStats(chartData.value.dayStats)
  }
  if (type === 'week') {
    return formatWeekStats(chartData.value.weekStats)
  }
  return formatAllStats(chartData.value.allStats)
}

commentStore.$subscribe((_mutation, state) => {
  comments.value = state._comments
})

likeStore.$subscribe((_mutation, state) => {
  countLikes.value = state._likes.length
  countDislikes.value = state._dislikes.length

  const { weekStats, dayStats } = getStats(state, entry.value.created)
  const allStats = [
    {
      date: Timestamp.fromDate(new Date()),
      likes: state._likes.length,
      dislikes: state._dislikes.length
    }
  ]
  chartData.value = { weekStats, dayStats, allStats }
})

shareStore.$subscribe((_mutation, state) => {
  shares.value = state._shares
})

async function like() {
  await likeStore.addLike('entries', entry.value.id).catch((error) => errorStore.throwError(error))
}

async function dislike() {
  await likeStore.addDislike('entries', entry.value.id).catch((error) => errorStore.throwError(error))
}

function onShare(socialNetwork) {
  shareStore.addShare('entries', entry.value.id, socialNetwork).catch((error) => errorStore.throwError(error))
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
