<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Entry -->
    <q-tab-panel name="entry" style="padding: 0">
      <ThePost collectionName="entries" :post="entry" title="Entry Page" @clickComments="tab = 'comments'" />
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
      <q-page :data-test="!commentStore.isLoading ? 'comment-loaded' : 'comment-loading'">
        <TheComments collection="entries" :comments="comments" :data="entry" />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { Timestamp } from 'firebase/firestore'
import LikesBar from 'src/components/Graphs/LikesBar.vue'
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useShareStore, useUserStore } from 'src/stores'
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
const userStore = useUserStore()

const chartData = ref({})
const comments = ref([])
const entry = ref({})
const shares = ref([])
const tab = ref('entry')
const type = ref('day')

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

  await commentStore.fetchComments('entries', entry.value.id).catch((error) => errorStore.throwError(error))
  comments.value = commentStore.getComments

  await likeStore.getAllLikesDislikes('entries', entry.value.id).catch((error) => errorStore.throwError(error))

  await shareStore
    .fetchShares('entries', entry.value.id)
    .then(() => (shares.value = shareStore.getShares))
    .catch((error) => errorStore.throwError(error))
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
  if (!entry.value.created) return
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
