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
              :disable="!userStore.isAuthenticated || promptStore.isLoading"
              flat
              icon="sentiment_satisfied_alt"
              :label="promptLikesCount"
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
              :label="promptDislikesCount"
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
          <q-btn flat rounded icon="share" :label="prompt.info?.shares" @click="sharePrompt(true)">
            <q-tooltip anchor="bottom middle" self="center middle">Share</q-tooltip>
          </q-btn>
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
import { useQuasar } from 'quasar'
import BarGraph from 'src/components/BarGraph.vue'
import TheEntries from 'src/components/TheEntries.vue'
import { usePromptStore, useStatStore, useUserStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const promptStore = usePromptStore()
const statStore = useStatStore()
const userStore = useUserStore()

const chartData = ref([])
const prompt = ref({})
const tab = ref('prompt')
const promptLikesCount = computed(() => {
  return prompt.value.likes ? prompt.value.likes.filter((like) => like.status === true).length : 0
})
const promptDislikesCount = computed(() => {
  return prompt.value.likes ? prompt.value.likes.filter((like) => like.status === false).length : 0
})
onMounted(async () => {
  statStore.fetchStats()

  if (router.currentRoute.value.href === '/month') {
    await promptStore
      .fetchMonthPrompt()
      .then(() => {
        prompt.value = promptStore.getMonthPrompt
      })
      .finally(() => {
        if (prompt.value) {
          updateChartData()
        } else {
          router.push('/404')
        }
      })
  } else {
    await promptStore
      .fetchPrompts()
      .then(() => {
        if (router.currentRoute.value.params.year) {
          prompt.value = promptStore.getPromptById(`${router.currentRoute.value.params.year}-${router.currentRoute.value.params.month}`)
        }
        if (router.currentRoute.value.params.slug) {
          prompt.value = promptStore.getPromptBySlug(router.currentRoute.value.params.slug)
        }
      })
      .finally(() => {
        if (prompt.value) {
          promptStore.fetchPromptEntry(prompt.value.id)
          updateChartData()
        } else {
          router.push('/404')
        }
      })
  }
})

function updateChartData() {
  chartData.value = [
    { value: prompt.value.info?.likes.length, name: 'Likes' },
    { value: prompt.value.info?.dislikes.length, name: 'Disikes' }
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
