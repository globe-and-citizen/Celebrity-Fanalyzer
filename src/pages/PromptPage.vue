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
const domainUrl = 'https://celebrityfanalyzer.vercel.app/'

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
    //  TODO: Add share prompt functionality
    message: 'Share with Social Media',
    grid,
    actions: [
      { label: 'Facebook', img: '../src/assets/shareButtons/facebook.svg', id: 'facebook' },
      { label: 'Twitter', img: '../src/assets/shareButtons/twitter.svg', id: 'twitter' },
      { label: 'Reddit', img: '../src/assets/shareButtons/reddit.svg', id: 'reddit' },
      { label: 'LinkedIn', img: '../src/assets/shareButtons/linkedin.svg', id: 'linkedin' },
      { label: 'WhatsApp', img: '../src/assets/shareButtons/whatsapp.svg', id: 'whatsapp' },
      { label: 'Telegram', img: '../src/assets/shareButtons/telegram.svg', id: 'telegram' },
      { label: 'Odnoklassniki', img: '../src/assets/shareButtons/odnoklassniki.svg', id: 'odnoklassniki' },
      { label: 'Pinterest', img: '../src/assets/shareButtons/pinterest.svg', id: 'pinterest' }
    ]
  })
    .onOk((action) => {
      if (action.id === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u='+ domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'twitter') {
        window.open('https://twitter.com/intent/tweet?text=' + domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'linkedin') {
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'whatsapp') {
        window.open('https://api.whatsapp.com/send?text=' + domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'pinterest') {
        window.open('https://www.pinterest.com/pin/create/button/?url=' + domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'reddit') {
        window.open('https://www.reddit.com/submit?url=' + domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'telegram') {
        window.open('https://t.me/share/url?url=' + domainUrl + router.currentRoute.value.params.id)
      } else if (action.id === 'odnoklassniki') {
        window.open('https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=' + domainUrl + router.currentRoute.value.params.id)
      }
    })
    .onCancel(() => {
      // console.log('Dismissed')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    })
}
</script>
