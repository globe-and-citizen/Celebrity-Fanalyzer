<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom bg-white" dense indicator-color="transparent"
          v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false"/>
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false"/>
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false"/>
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em"/>

  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="entry" style="padding: 0">
      <q-page class="bg-white">
        <TheHeader title="Entry Page"/>
        <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px"
               :src="entry?.image"/>
        <section class="q-pa-md" style="margin-top: 100%; margin-bottom: 10%">
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
          <q-btn flat rounded icon="chat_bubble_outline" :label="count" @click="tab = 'comments'">
            <q-tooltip>Comments</q-tooltip>
          </q-btn>
          <ShareComponent :label="countShares" @share="onShare($event)"/>
        </section>
        <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate/>

        <q-separator/>
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="stats" class="bg-white">
      <TheHeader title="Anthrogram"/>
      <q-page>
        <section>
          <h1 class="q-mt-none text-bold text-h5">{{ entry?.title }}</h1>
          <div class="flex no-wrap items-center q-mb-xl">
            <q-avatar size="4rem">
              <img :src="entry.author.photoURL" alt="Author Image" />
            </q-avatar>
            <p class="q-mb-none q-ml-md text-h5">{{ entry.author.displayName }}</p>
          </div>
          <q-tabs
            v-model="type"
            dense
            class="text-grey q-mb-xl"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="day" label="Days"/>
            <q-tab name="week" label="Week"/>
            <q-tab name="all" label="All"/>
          </q-tabs>
          <BarGraph :data="graphData(type)" title="Likes & Dislikes"/>
        </section>
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="comments" class="bg-white">
      <TheHeader title="Comments"/>
      <q-page>
        <TheComments :comments="comments" :entry="entry"/>
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import {Timestamp} from 'firebase/firestore'
import BarGraph from 'src/components/BarGraph.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import TheComments from 'src/components/TheComments.vue'
import TheHeader from 'src/components/TheHeader.vue'
import {useCommentStore, useEntryStore, useErrorStore, useLikeStore, usePromptStore, useShareStore} from 'src/stores'
import {getStats} from 'src/utils/date'
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {formatAllStats, formatDayStats, formatWeekStats} from "src/utils/stats";

const router = useRouter()

const commentStore = useCommentStore()
const errorStore = useErrorStore()
const entryStore = useEntryStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()

const chartData = ref({})
const comments = ref([])
const countLikes = ref(0)
const countDislikes = ref(0)
const countShares = ref(0)
const entry = ref({})
const tab = ref('entry')
const type = ref('day')
const count = ref(0)

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

  await likeStore.getAllEntryLikesDislikes(entry.value.id).catch((error) => errorStore.throwError(error))

  await shareStore.countEntryShares(entry.value.id).catch((error) => errorStore.throwError(error))
  countShares.value = shareStore.getShares

  for (const comment of comments.value) {
    if (comment.parentId === undefined) {
      count.value++
    } else {
      continue
    }
  }
})

function graphData(type) {
  if (type === "day") {
    return formatDayStats(chartData.value.dayStats)
  }
  if (type === "week") {
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

  const {weekStats, dayStats} = getStats(state, entry.value.created)
  const allStats = [
    {
      date: Timestamp.fromDate(new Date()),
      likes: state._likes.length,
      dislikes: state._dislikes.length
    }
  ]
  chartData.value = {
    weekStats, dayStats, allStats
  }
})

shareStore.$subscribe((_mutation, state) => {
  countShares.value = state._shares
})

async function like() {
  await likeStore.likeEntry(entry.value.id).catch((error) => errorStore.throwError(error))
}

async function dislike() {
  await likeStore.dislikeEntry(entry.value.id).catch((error) => errorStore.throwError(error))
}

function onShare(socialNetwork) {
  shareStore.shareEntry(entry.value.id, socialNetwork).catch((error) => errorStore.throwError(error))
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
