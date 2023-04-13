<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" data-test="prompt-tab" icon="fiber_manual_record" name="prompt" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" data-test="graph-tab" icon="fiber_manual_record" name="stats" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!Object.keys(prompt).length && promptStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="prompt" style="padding: 0">
      <q-page class="bg-white">
        <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="prompt?.image" />
        <section class="q-pa-md" style="margin-top: 100%">
          <div class="flex justify-between">
            <p v-if="prompt?.date" class="text-body2">{{ monthYear(prompt.date) }}</p>
            <div>
              <q-badge v-for="(category, index) of prompt?.categories" class="q-mx-xs" :key="index" rounded>
                {{ category }}
              </q-badge>
            </div>
          </div>
          <h1 class="q-mt-none text-bold text-h5">{{ prompt?.title }}</h1>
          <p class="text-body1" v-html="prompt?.description"></p>
          <q-btn
            color="green"
            data-test="like-button"
            flat
            :icon="likeIconClasses ? 'img:icons/thumbs-up-bolder.svg' : 'img:icons/thumbs-up.svg'"
            :label="countLikes"
            rounded
            size="0.75rem"
            @click="like()"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
          </q-btn>
          <q-btn
            color="red"
            data-test="dislike-button"
            flat
            :icon="dislikeIconClasses ? 'img:icons/thumbs-down-bolder.svg' : 'img:icons/thumbs-down.svg'"
            :label="countDislikes"
            rounded
            size="0.75rem"
            @click="dislike()"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
          </q-btn>
          <q-btn
            flat
            href="https://discord.com/channels/1034461422962360380/1040994839610806343"
            icon="img:/icons/discord.svg"
            rounded
            target="_blank"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Community on Discord</q-tooltip>
          </q-btn>
          <ShareComponent :label="shares?.length" @share="onShare($event)" />
        </section>
        <q-separator inset spaced />
        <section v-if="prompt?.author" class="flex items-center no-wrap q-pa-md">
          <q-avatar size="6rem">
            <q-img :src="prompt.author.photoURL" />
          </q-avatar>
          <div class="q-ml-md">
            <p class="text-body1 text-bold">{{ prompt.author.displayName }}</p>
            <p class="q-mb-none" style="white-space: pre-line">{{ prompt.author.bio }}</p>
          </div>
        </section>
        <q-separator inset spaced />
        <TheEntries :entries="prompt?.entries" />
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="stats" class="bg-white">
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
  </q-tab-panels>
</template>

<script setup>
import { Timestamp } from 'firebase/firestore'
import LikesBar from 'src/components/Graphs/LikesBar.vue'
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import TheEntries from 'src/components/TheEntries.vue'
import { useEntryStore, useErrorStore, useLikeStore, usePromptStore, useShareStore, useUserStore } from 'src/stores'
import { currentYearMonth, getStats, monthYear, previousYearMonth } from 'src/utils/date'
import { formatAllStats, formatDayStats, formatWeekStats } from 'src/utils/stats'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()
const userStore = useUserStore()

const chartData = ref({})
const countDislikes = ref(0)
const countLikes = ref(0)
const dislikeIconClasses = ref(false)
const likeIconClasses = ref(false)
const prompt = ref({})
const shares = ref([])
const tab = ref('prompt')
const type = ref('all')
const userId = ref('')

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
  await userStore.fetchUserIp()
  userId.value = userStore.isAuthenticated ? userStore?.getUserRef?.id : userStore.getUserIpHash

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

  await likeStore.getAllLikesDislikes('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))

  await shareStore
    .fetchShares('prompts', prompt.value.id)
    .then(() => (shares.value = shareStore.getShares))
    .catch((error) => errorStore.throwError(error))
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

likeStore.$subscribe((_mutation, state) => {
  countLikes.value = state._likes.length
  countDislikes.value = state._dislikes.length

  const likedPost = state._likes.find((post) => post.author.id === userId.value)
  likeIconClasses.value = !!likedPost

  const dislikedPost = state._dislikes.find((post) => post.author.id === userId.value)
  dislikeIconClasses.value = !!dislikedPost

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

async function like() {
  await likeStore.addLike('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))
}

async function dislike() {
  await likeStore.addDislike('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))
}

function onShare(socialNetwork) {
  shareStore.addShare('prompts', prompt.value.id, socialNetwork).catch((error) => errorStore.throwError(error))
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
