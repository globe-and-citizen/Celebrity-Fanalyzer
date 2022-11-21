<template>
  <q-header v-if="showComments" class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Comments</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>
  <section v-if="isLoading" class="q-my-xl text-center">
    <q-spinner color="primary" size="3em" />
  </section>
  <q-page v-else>
    <q-img :ratio="21 / 9" :src="article?.image" spinner-color="primary" spinner-size="82px" />
    <section class="q-pa-md">
      <h1 class="q-mt-none text-bold text-h5">{{ article.title }}</h1>
      <p class="text-body1" v-html="article.description"></p>
      <div class="q-mb-md">
        <q-badge v-for="(category, index) of article.categories" class="q-mx-xs" :key="index" rounded>
          {{ category }}
        </q-badge>
      </div>
      <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="article.info?.likes">
        <q-tooltip>Like</q-tooltip>
      </q-btn>
      <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="article.info?.dislikes">
        <q-tooltip>Dislike</q-tooltip>
      </q-btn>
      <q-btn flat rounded icon="chat_bubble_outline" :label="article.info?.comments" @click="toggleComments()">
        <q-tooltip>Comments</q-tooltip>
      </q-btn>
      <q-btn flat rounded icon="share" :label="article.info?.shares" @click="sharePrompt(true)">
        <q-tooltip>Share</q-tooltip>
      </q-btn>
    </section>
    <q-separator />
    <TheComments :comments="comments" v-show="showComments" />
    <q-separator />
    <TheEntries />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import TheComments from 'src/components/TheComments.vue'
import TheEntries from 'src/components/TheEntries.vue'
import { useCommentStore, usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { routerViewLocationKey, useRouter } from 'vue-router'

const $q = useQuasar()
const article = ref({})
const commentStore = useCommentStore()
const comments = ref([])
const isLoading = ref(false)
const promptStore = usePromptStore()
const router = useRouter()
const showComments = ref(false)

onMounted(async () => {
  if (!promptStore.getPrompts?.length) {
    isLoading.value = true
    await promptStore.fetchPrompts()
    isLoading.value = false
  }
  article.value = promptStore.getPrompts.find((prompt) => prompt.slug === router.currentRoute.value.params.id)
})

onMounted(async () => {
  if (!commentStore.commentStore?.length) {
    await commentStore.fetchComments(article.value.id)
  }
  comments.value = commentStore.getComments
})

function toggleComments() {
  showComments.value = !showComments.value
}

function sharePrompt(grid) {
  $q.bottomSheet({
    message: 'Share with Social Media',
    grid,
    actions: [
      { label: 'Facebook', img: '/icons/facebook.svg', id: 'facebook', link: 'https://facebook.com/sharer/sharer.php?u=' },
      { label: 'LinkedIn', img: '/icons/linkedin.svg', id: 'linkedin', link: 'https://linkedin.com/sharing/share-offsite/?url=' },
      {
        label: 'Odnoklassniki',
        img: '/icons/odnoklassniki.svg',
        id: 'odnoklassniki',
        link: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl='
      },
      { label: 'Pinterest', img: '/icons/pinterest.svg', id: 'pinterest', link: 'https://pinterest.com/pin/create/button/?url=' },
      { label: 'Reddit', img: '/icons/reddit.svg', id: 'reddit', link: 'https://reddit.com/submit?url=' },
      { label: 'Telegram', img: '/icons/telegram.svg', id: 'telegram', link: 'https://t.me/share/url?url=' },
      { label: 'Twitter', img: '/icons/twitter.svg', id: 'twitter', link: 'https://twitter.com/intent/tweet?text=' },
      { label: 'WhatsApp', img: '/icons/whatsapp.svg', id: 'whatsapp', link: 'https://api.whatsapp.com/send?text=' }
    ]
  }).onOk((action) => {
    window.open(action.link + `Look what I just found on CelebrityFanalyzer: ${window.location.href}`, '_blank')
  })
}
</script>
