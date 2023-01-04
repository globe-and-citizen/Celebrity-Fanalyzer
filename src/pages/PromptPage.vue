<template>
  <q-tabs active-color="primary" class="tab-selector fixed-bottom" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="prompt" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!prompt && promptStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="prompt" style="padding: 0">
      <q-page class="bg-white">
        <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="prompt?.image" />
        <section class="q-pa-md" style="margin-top: 100%">
          <h1 class="q-mt-none text-bold text-h5">{{ prompt.title }}</h1>
          <p class="text-body1" v-html="prompt.description"></p>
          <div class="q-mb-md">
            <q-badge v-for="(category, index) of prompt.categories" class="q-mx-xs" :key="index" rounded>
              {{ category }}
            </q-badge>
          </div>
          <div class="inline-block">
            <q-btn
              color="green"
              :disable="promptStore.isLoading"
              flat
              icon="sentiment_satisfied_alt"
              :label="prompt.likesCount"
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
              :label="prompt.dislikesCount"
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

          <ShareComponent :count="0"></ShareComponent>
        </section>
        <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate />
        <TheEntries :entries="prompt.entries" />
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
import TheEntries from 'src/components/TheEntries.vue'
import ShareComponent from 'src/components/ShareComponent.vue'
import { usePromptStore, useStatStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const promptStore = usePromptStore()
const statStore = useStatStore()

const chartData = ref([])
const prompt = ref({})
const tab = ref('prompt')
onMounted(async () => {
  statStore.fetchStats()
  if (router.currentRoute.value.href === '/month') {
    await promptStore.fetchMonthPrompt()
    prompt.value = promptStore.getMonthPrompt
  } else {
    await promptStore.fetchPrompts()
    if (router.currentRoute.value.params.year) {
      prompt.value = promptStore.getPromptById(`${router.currentRoute.value.params.year}-${router.currentRoute.value.params.month}`)
    } else if (router.currentRoute.value.params.slug) {
      prompt.value = promptStore.getPromptBySlug(router.currentRoute.value.params.slug)
    }
    if (prompt.value) {
      await promptStore.fetchPromptEntry(prompt.value.id)
    }
  }
  if (prompt.value) {
    updateChartData()
  } else {
    await router.push('/404')
  }

  // Call of refresh promptOpinion to have likes and dislikes count
  await promptStore.refreshPromptOpinion(prompt.value.id)
  prompt.value = promptStore.getPromptById(prompt.value.id)
})

function updateChartData() {
  chartData.value = [
    { value: prompt.value.likesCount, name: 'Likes' },
    { value: prompt.value.dislikesCount, name: 'Dislikes' }
  ]
}

function like() {
  const id = prompt.value.id
  promptStore.addLike(id).then(() => {
    prompt.value = promptStore.getPromptById(id)
  })
}

function dislike() {
  const id = prompt.value.id
  promptStore.addDislike(id).then(() => {
    prompt.value = promptStore.getPromptById(id)
  })
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
