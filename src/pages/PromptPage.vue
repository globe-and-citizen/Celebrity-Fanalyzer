<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="prompt" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!Object.keys(prompt).length && promptStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="prompt" style="padding: 0">
      <q-page class="bg-white">
        <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="prompt?.image" />
        <section class="q-pa-md" style="margin-top: 100%">
          <div class="flex justify-between">
            <p v-if="prompt.date" class="text-body2">{{ monthYear(prompt.date) }}</p>
            <div>
              <q-badge v-for="(category, index) of prompt?.categories" class="q-mx-xs" :key="index" rounded>
                {{ category }}
              </q-badge>
            </div>
          </div>
          <h1 class="q-mt-none text-bold text-h5">{{ prompt?.title }}</h1>
          <p class="text-body1" v-html="prompt?.description"></p>
          <div class="inline-block">
            <q-btn
              color="green"
              :disable="promptStore.isLoading"
              flat
              icon="sentiment_satisfied_alt"
              :label="countLikes"
              rounded
              @click="like()"
            >
              <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
            </q-btn>
            <q-btn
              color="red"
              :disable="promptStore.isLoading"
              flat
              icon="sentiment_very_dissatisfied"
              :label="countDislikes"
              rounded
              @click="dislike()"
            >
              <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
            </q-btn>
          </div>
          <q-btn
            flat
            href="https://discord.com/channels/1034461422962360380/1040994839610806343"
            icon="img:/icons/discord.svg"
            rounded
            target="_blank"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Community on Discord</q-tooltip>
          </q-btn>
          <ShareComponent :label="countShares" @share="onShare($event)" />
        </section>
        <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate />
        <TheEntries :entries="prompt?.entries" />
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="stats" class="bg-white">
      <q-page>
        <section>
          <h1 class="q-mt-none text-bold text-h5">{{ prompt?.title }}</h1>
          <div class="flex no-wrap items-center q-mb-xl">
            <q-avatar size="4rem">
              <img :src="prompt.author.photoURL" alt="" />
            </q-avatar>
            <p class="q-mb-none q-ml-md text-h6 text-weight-light">{{ prompt.author.displayName }}</p>
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
            <q-tab name="day" label="Days" />
            <q-tab name="week" label="Week" />
            <q-tab name="all" label="All" />
          </q-tabs>
          <BarGraph :data="graphData(type)" title="Likes & Dislikes" />
        </section>
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import BarGraph from 'src/components/BarGraph.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import TheEntries from 'src/components/TheEntries.vue'
import { useErrorStore, useLikeStore, usePromptStore, useShareStore } from 'src/stores'
import { getStats, monthYear } from 'src/utils/date'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Timestamp } from 'firebase/firestore'
import {formatAllStats, formatDayStats, formatWeekStats} from "src/utils/stats";

const router = useRouter()

const errorStore = useErrorStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()

const chartData = ref({})
const countLikes = ref(0)
const countDislikes = ref(0)
const countShares = ref(0)
const prompt = ref({})
const tab = ref('prompt')
const type = ref('day')

function graphData( type ){
  if (type==="day"){
    return formatDayStats(chartData.value.dayStats)
  }
  if(type==="week"){
    return formatWeekStats(chartData.value.weekStats)
  }
  return formatAllStats(chartData.value.allStats)
}

onMounted(async () => {
  if (router.currentRoute.value.href === '/month') {
    await promptStore.fetchMonthPrompt().catch((error) => errorStore.throwError(error))
    prompt.value = promptStore.getMonthPrompt
  }
  if (router.currentRoute.value.params.year) {
    await promptStore
      .fetchPromptById(`${router.currentRoute.value.params.year}-${router.currentRoute.value.params.month}`)
      .then((res) => (prompt.value = res))
      .catch((error) => {
        prompt.value = null
        errorStore.throwError(error)
      })
  }
  if (router.currentRoute.value.params.slug) {
    await promptStore
      .fetchPromptBySlug(router.currentRoute.value.params.slug)
      .then((res) => (prompt.value = res))
      .catch((error) => {
        prompt.value = null
        errorStore.throwError(error)
      })
  }
  if (!prompt.value) {
    router.push('/404')
    return
  }
  await likeStore.getAllPromptLikesDislikes(prompt.value.id).catch((error) => errorStore.throwError(error))
})

likeStore.$subscribe((_mutation, state) => {
  countLikes.value = state._likes.length
  countDislikes.value = state._dislikes.length

  const { weekStats, dayStats } = getStats(state, prompt.value.created)
  const allStats = [
    {
      date: Timestamp.fromDate(new Date()),
      likes: state._likes.length,
      dislikes: state._dislikes.length
    }
  ]
  chartData.value= {
    weekStats, dayStats, allStats
  }
})

shareStore.$subscribe((_mutation, state) => {
  countShares.value = state._shares
})

async function like() {
  await likeStore.likePrompt(prompt.value.id).catch((error) => errorStore.throwError(error))
}

async function dislike() {
  await likeStore.dislikePrompt(prompt.value.id).catch((error) => errorStore.throwError(error))
}

function onShare(socialNetwork) {
  shareStore.sharePrompt(prompt.value.id, socialNetwork).catch((error) => errorStore.throwError(error))
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
