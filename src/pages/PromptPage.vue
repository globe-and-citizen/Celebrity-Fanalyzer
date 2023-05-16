<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" data-test="prompt-tab" icon="fiber_manual_record" name="prompt" :ripple="false" />
    <q-tab content-class="q-pb-md" data-test="graph-tab" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!Object.keys(prompt).length && promptStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Prompt -->
    <q-tab-panel name="prompt" style="padding: 0">
      <ThePost collectionName="prompts" :post="prompt" title="Prompt Page" @clickComments="tab = 'comments'" />
      <TheEntries :entries="prompt?.entries" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="stats" class="bg-white">
      <TheHeader title="Anthrogram" />
      <q-page>
        <section>
          <h1 class="q-mt-none text-bold text-h5">{{ prompt?.title }}</h1>
          <div v-if="prompt?.author" class="flex no-wrap items-center q-mb-xl">
            <q-avatar size="4rem">
              <img :src="prompt.author.photoURL" alt="" />
            </q-avatar>
            <p class="q-mb-none q-ml-md text-h6 text-weight-light">{{ prompt.author.displayName }}</p>
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
        <TheComments collection="prompts" :comments="comments" :data="prompt" />
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
import TheEntries from 'src/components/TheEntries.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, usePromptStore, useShareStore, useUserStore } from 'src/stores'
import { currentYearMonth, getStats, previousYearMonth } from 'src/utils/date'
import { formatAllStats, formatDayStats, formatWeekStats } from 'src/utils/stats'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const commentStore = useCommentStore()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()
const userStore = useUserStore()

const chartData = ref({})
const comments = ref([])
const countComments = ref(0)
const prompt = ref({})
const shares = ref([])
const tab = ref('prompt')
const type = ref('all')
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

function graphData(type) {
  if (type === 'day') {
    return formatDayStats(chartData.value.dayStats)
  }
  if (type === 'week') {
    return formatWeekStats(chartData.value.weekStats)
  }
  return formatAllStats(chartData.value.allStats)
}

onMounted(async () => {
  if (!promptByRoute()) {
    await promptStore.fetchPrompts().catch((error) => errorStore.throwError(error))
  }

  prompt.value = promptByRoute()

  if (!prompt.value) {
    router.push('/404')
    return
  }

  if (!entryStore.getEntries.length) {
    await entryStore.fetchEntries().catch((error) => errorStore.throwError(error))
  }

  prompt.value.entries = entryStore.getEntries.filter((entry) => entry.prompt === prompt.value?.id)

  await commentStore.fetchComments('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))
  comments.value = commentStore.getComments
  countComments.value = comments.value.filter((comment) => comment.parentId === undefined).length

  await likeStore.getAllLikesDislikes('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))

  shareIsLoading.value = true
  await shareStore
    .fetchShares('prompts', prompt.value.id)
    .then(() => (shares.value = shareStore.getShares))
    .catch((error) => errorStore.throwError(error))
    .finally(() => {
      shareIsLoading.value = false
      shareIsLoaded.value = true
    })
})

const promptByRoute = () => {
  const route = router.currentRoute.value
  const currentMonth = currentYearMonth()
  const previousMonth = previousYearMonth()

  return promptStore.getPrompts.find((prompt) => {
    switch (route.href) {
      case '/month':
        return [currentMonth, previousMonth].includes(prompt.date)
      case `/${route.params.year}/${route.params.month}`:
        return prompt.date === route.params.year + '-' + route.params.month
      case `/${route.params.slug}`:
        return prompt.slug === route.params.slug
      default:
        return false
    }
  })
}

commentStore.$subscribe((_mutation, state) => {
  comments.value = state._comments
})

likeStore.$subscribe((_mutation, state) => {
  const { weekStats, dayStats } = getStats(state, prompt.value.created)
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
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
