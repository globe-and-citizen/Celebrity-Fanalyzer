<template>
  <q-header class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">This Month</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>

  <q-tabs active-color="primary" class="tab-selector fixed-bottom" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="prompt" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
  </q-tabs>

  <q-spinner v-if="!monthPrompt && promptStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="prompt" style="padding: 0">
      <q-page class="q-pa-md">
        <section v-if="monthPrompt">
          <q-img :src="monthPrompt.image" spinner-color="primary" style="border: 3px solid #e54757; border-radius: 12px" />
          <h1 class="q-my-md text-bold text-h5">{{ monthPrompt.title }}</h1>
          <p class="text-body1" v-html="monthPrompt.description"></p>
          <div class="q-mb-md">
            <q-badge v-for="(category, index) of monthPrompt.categories" class="q-mx-xs" :key="index" rounded>
              {{ category }}
            </q-badge>
          </div>
          <div class="inline-block">
            <q-btn
              color="green"
              :disable="!userStore.isAuthenticated || promptStore.isLoading"
              flat
              icon="sentiment_satisfied_alt"
              :label="monthPrompt.info?.likes.length"
              rounded
              @click="like()"
            >
              <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
            </q-btn>
            <q-tooltip v-if="!userStore.isAuthenticated" anchor="bottom middle" self="center middle">You need to login to vote</q-tooltip>
            <q-btn
              color="red"
              :disable="!userStore.isAuthenticated || promptStore.isLoading"
              flat
              icon="sentiment_very_dissatisfied"
              :label="monthPrompt.info?.dislikes.length"
              rounded
              @click="dislike()"
            >
              <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
            </q-btn>
          </div>
          <q-btn
            flat
            rounded
            icon="img:/icons/discord.svg"
            href="https://discord.com/channels/1034461422962360380/1040994839610806343"
            target="_blank"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Community on Discord</q-tooltip>
          </q-btn>
          <q-btn flat rounded icon="share" :label="monthPrompt.info?.shares" @click="sharePrompt(true)">
            <q-tooltip anchor="bottom middle" self="center middle">Share</q-tooltip>
          </q-btn>
          <q-linear-progress v-if="promptStore.isLoading" color="primary" class="q-mt-sm" indeterminate />
          <TheEntries :entries="monthPrompt.entries" />
        </section>
        <section v-else class="q-my-xl text-center">
          <q-spinner color="primary" size="3em" />
        </section>
      </q-page>
    </q-tab-panel>
    <q-tab-panel name="stats" class="bg-white">
      <q-page>
        <PieGraph :data="getChartData()" title="Likes & Dislikes" />
        <BarGraph :data="getChartData()" title="Likes & Dislikes" />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { useQuasar } from 'quasar'
import BarGraph from 'src/components/BarGraph.vue'
import PieGraph from 'src/components/PieGraph.vue'
import TheEntries from 'src/components/TheEntries.vue'
import { useEntryStore, usePromptStore, useUserStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const $q = useQuasar()

const entryStore = useEntryStore()
const promptStore = usePromptStore()
const userStore = useUserStore()

const monthPrompt = ref(promptStore.getMonthPrompt)

const chartData = ref([])
const tab = ref('prompt')
function getChartData() {
  return [
    { value: monthPrompt.value.info?.likes.length, name: 'Likes' },
    { value: monthPrompt.value.info?.dislikes.length, name: 'Disikes' }
  ]
}
onMounted(async () => {
  await promptStore.fetchMonthPrompt()
  monthPrompt.value = promptStore.getMonthPrompt

  if (!monthPrompt.value.entries?.length) {
    await entryStore.fetchEntries(monthPrompt.value.date)
    monthPrompt.value.entries = entryStore.getEntries
  }

  chartData.value = [
    { value: monthPrompt.value.info?.likes.length, name: 'Likes' },
    { value: monthPrompt.value.info?.dislikes.length, name: 'Disikes' }
  ]
})

async function updatePrompt() {
  await promptStore
    .fetchMonthPrompt()
    .then((res) => (monthPrompt.value = res))
    .catch((err) => console.error(err))
}

function like() {
  promptStore.addLike(monthPrompt.value.id).then(() => updatePrompt())
}

function dislike() {
  promptStore.addDislike(monthPrompt.value.id).then(() => updatePrompt())
}

function sharePrompt(grid) {
  $q.bottomSheet({
    message: 'Share with Social Media',
    grid,
    actions: [
      { label: 'Copy to Clipboard', img: '/icons/clipboard.svg', id: 'clipboard' },
      {
        label: 'Facebook',
        img: '/icons/facebook.svg',
        id: 'facebook',
        link: 'https://facebook.com/sharer/sharer.php?u='
      },
      {
        label: 'LinkedIn',
        img: '/icons/linkedin.svg',
        id: 'linkedin',
        link: 'https://linkedin.com/sharing/share-offsite/?url='
      },
      { label: 'Twitter', img: '/icons/twitter.svg', id: 'twitter', link: 'https://twitter.com/intent/tweet?text=' },
      { label: 'Telegram', img: '/icons/telegram.svg', id: 'telegram', link: 'https://t.me/share/url?url=' },
      { label: 'WhatsApp', img: '/icons/whatsapp.svg', id: 'whatsapp', link: 'https://api.whatsapp.com/send?text=' },
      { label: 'Reddit', img: '/icons/reddit.svg', id: 'reddit', link: 'https://reddit.com/submit?url=' },
      {
        label: 'Pinterest',
        img: '/icons/pinterest.svg',
        id: 'pinterest',
        link: 'https://pinterest.com/pin/create/button/?url='
      },
      {
        label: 'Odnoklassniki',
        img: '/icons/odnoklassniki.svg',
        id: 'odnoklassniki',
        link: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl='
      }
    ]
  }).onOk((action) => {
    if (action.id === 'clipboard') {
      navigator.clipboard.writeText(window.location.href)
    } else if (action.id === 'facebook' || action.id === 'linkedin') {
      window.open(action.link + `${window.location.href}`, '_blank')
    } else {
      window.open(action.link + `Look what I just found on CelebrityFanalyzer: ${window.location.href}`, '_blank')
    }
  })
}
</script>
<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
