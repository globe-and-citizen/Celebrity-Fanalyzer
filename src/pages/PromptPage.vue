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
  <q-page v-else v-scroll="onScroll">
    <q-img
      :ratio="ratio"
      :src="article?.image"
      spinner-color="primary"
      spinner-size="82px"
      :class="{ sticky: sticky, 'not-sticky': !sticky }"
    />
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
import { useRouter } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'

const $q = useQuasar()
const article = ref({})
const commentStore = useCommentStore()
const comments = ref([])
const isLoading = ref(false)
const promptStore = usePromptStore()
const router = useRouter()
const showComments = ref(false)
const ratio = ref(21 / 9)
const sticky = ref(false)
const { x, y } = useWindowScroll()

window.onscroll = function () {
  onScroll()
}

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

function onScroll() {
  if (y.value >= 10) {
    console.log('reduction')
    ratio.value = 30 / 9
    sticky.value = true
  } else if (y.value < 10) {
    console.log('Augmenation')
    ratio.value = 21 / 9
    sticky.value = false
  }
}

function sharePrompt(grid) {
  $q.bottomSheet({
    //  TODO: Add share prompt functionality
    message: 'Share (Will be developed...)',
    grid,
    actions: [
      { label: 'Facebook', img: 'https://cdn.quasar.dev/img/logo_drive_128px.png', id: 'drive' },
      { label: 'Twitter', img: 'https://cdn.quasar.dev/img/logo_keep_128px.png', id: 'keep' },
      { label: 'Youtube', img: 'https://cdn.quasar.dev/img/logo_hangouts_128px.png', id: 'calendar' },
      { label: 'Discord', img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png', id: 'calendar' }
    ]
  })
    .onOk((action) => {
      console.log('Action chosen:', action)
    })
    .onCancel(() => {
      // console.log('Dismissed')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    })
}
</script>

<style lang="scss">
.q-img {
}

.sticky {
  & > div:first-child {
    //transition: all, 1s;
    top: 0;
  }

  & div {
    position: sticky;
    z-index: 99;
  }

  & img {
    transform: scale(1.2);
    transition: all, 1s;
  }
}

.not-sticky {
  & * {
    transition: all, 1s;
  }
}
</style>
