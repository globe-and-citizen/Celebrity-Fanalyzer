<template>
  <section v-if="promptStore.isLoading" class="absolute-center">
    <q-spinner color="primary" size="3em" />
  </section>
  <q-page class="bg-white">
    <q-img :ratio="21 / 9" :src="prompt?.image" spinner-color="primary" spinner-size="82px" class="cf-parallax q-page-container" />
    <section class="q-pa-md cf-parallax-mt bg-white">
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
          :disable="!userStore.isAuthenticated"
          flat
          icon="sentiment_satisfied_alt"
          :label="prompt.info?.likes.length"
          rounded
          @click="like()"
        >
          <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
        </q-btn>
        <q-tooltip v-if="!userStore.isAuthenticated" anchor="bottom middle" self="center middle">You need to login to vote</q-tooltip>
        <q-btn
          color="red"
          :disable="!userStore.isAuthenticated"
          flat
          icon="sentiment_very_dissatisfied"
          :label="prompt.info?.dislikes.length"
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
      <q-btn flat rounded icon="share" :label="prompt.info?.shares" @click="sharePrompt(true)">
        <q-tooltip anchor="bottom middle" self="center middle">Share</q-tooltip>
      </q-btn>
    </section>
    <q-separator />
    <q-separator />
    <TheEntries :entries="entries" />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import TheEntries from 'src/components/TheEntries.vue'
import { useEntryStore, usePromptStore, useUserStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const entryStore = useEntryStore()
const promptStore = usePromptStore()
const userStore = useUserStore()

const entries = ref([])
const prompt = ref({})

onMounted(async () => {
  if (!promptStore.getPrompts?.length) {
    await promptStore.fetchPrompts()
  }
  updatePrompt()
  await entryStore.fetchEntries(prompt.value.id)
  entries.value = entryStore.getEntries
})

function updatePrompt() {
  prompt.value = promptStore.getPrompts.find((prompt) => prompt.slug === router.currentRoute.value.params.id)
}

function like() {
  promptStore.addLike(prompt.value.id).then(() => updatePrompt())
}

function dislike() {
  promptStore.addDislike(prompt.value.id).then(() => updatePrompt())
}

function sharePrompt(grid) {
  $q.bottomSheet({
    message: 'Share with Social Media',
    grid,
    actions: [
      { label: 'Copy to Clipboard', img: '/icons/clipboard.svg', id: 'clipboard' },
      { label: 'Facebook', img: '/icons/facebook.svg', id: 'facebook', link: 'https://facebook.com/sharer/sharer.php?u=' },
      { label: 'LinkedIn', img: '/icons/linkedin.svg', id: 'linkedin', link: 'https://linkedin.com/sharing/share-offsite/?url=' },
      { label: 'Twitter', img: '/icons/twitter.svg', id: 'twitter', link: 'https://twitter.com/intent/tweet?text=' },
      { label: 'Telegram', img: '/icons/telegram.svg', id: 'telegram', link: 'https://t.me/share/url?url=' },
      { label: 'WhatsApp', img: '/icons/whatsapp.svg', id: 'whatsapp', link: 'https://api.whatsapp.com/send?text=' },
      { label: 'Reddit', img: '/icons/reddit.svg', id: 'reddit', link: 'https://reddit.com/submit?url=' },
      { label: 'Pinterest', img: '/icons/pinterest.svg', id: 'pinterest', link: 'https://pinterest.com/pin/create/button/?url=' },
      {
        label: 'Odnoklassniki',
        img: '/icons/odnoklassniki.svg',
        id: 'odnoklassniki',
        link: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl='
      }
    ]
  }).onOk((action) => {
    if (action.id === 'clipboard') {
      navigator.clipboard.writeText(currentUrl.value)
      copied.value = true
      setInterval(() => {
        copied.value = false
      }, 800)
    } else if (action.id === 'facebook' || action.id === 'linkedin') {
      window.open(action.link + `${window.location.href}`, '_blank')
    } else {
      window.open(action.link + `Look what I just found on CelebrityFanalyzer: ${window.location.href}`, '_blank')
    }
  })
}
</script>

<style lang="scss">
.cf-parallax {
  position: fixed;
  top: 0;
  z-index: -1;
}
.cf-parallax-mt {
  margin-top: 42.8571%;
}
</style>
