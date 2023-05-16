<template>
  <q-page class="bg-white">
    <TheHeader feedbackButton :title="title" />
    <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="post?.image" />
    <section class="q-pa-md" style="margin-top: 100%">
      <div class="flex justify-between">
        <p v-if="post?.date" class="text-body2">{{ monthYear(post.date) }}</p>
        <div>
          <q-badge v-for="(category, index) of post?.categories" class="q-mx-xs" :key="index" rounded>
            {{ category }}
          </q-badge>
        </div>
      </div>
      <h1 class="q-mt-none text-bold text-h5">{{ post?.title }}</h1>
      <p class="text-body1" v-html="post?.description"></p>
      <q-btn
        color="green"
        :data-test="!likeStore._isLoading && likeStore._isLoaded ? 'like-button' : ''"
        flat
        :icon="isLiked ? 'img:icons/thumbs-up-bolder.svg' : 'img:icons/thumbs-up.svg'"
        :label="countLikes"
        rounded
        size="0.75rem"
        @click="like()"
      >
        <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
      </q-btn>
      <q-btn
        color="red"
        :data-test="!likeStore._isLoading && likeStore._isLoaded ? 'dislike-button' : ''"
        flat
        :icon="isDisliked ? 'img:icons/thumbs-down-bolder.svg' : 'img:icons/thumbs-down.svg'"
        :label="countDislikes"
        rounded
        size="0.75rem"
        @click="dislike()"
      >
        <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
      </q-btn>
      <q-btn
        :data-test="commentStore.isLoading ? '' : 'panel-3-navigator'"
        flat
        icon="chat_bubble_outline"
        :label="countComments"
        rounded
        size="0.75rem"
        @click="$emit('clickComments')"
      >
        <q-tooltip>Comments</q-tooltip>
      </q-btn>
      <ShareComponent :loaded="shareIsLoaded && !shareIsLoading" :label="countShares" @share="share($event)" />
    </section>
    <q-separator inset spaced />
    <ShowcaseArt v-if="post?.showcase" :showcase="post.showcase" />
    <q-separator inset spaced />
    <section v-if="post?.author" class="flex items-center no-wrap q-pa-md">
      <q-avatar size="6rem">
        <q-img :src="post.author.photoURL" :srcset="post.author.photoURL" />
      </q-avatar>
      <div class="q-ml-md">
        <p class="text-body1 text-bold">{{ post.author.displayName }}</p>
        <p class="q-mb-none" style="white-space: pre-line">{{ post.author.bio }}</p>
      </div>
    </section>
    <q-separator inset />
  </q-page>
</template>

<script setup>
import TheHeader from 'src/components/TheHeader.vue'
import { useCommentStore, useErrorStore, useLikeStore, useShareStore, useUserStore } from 'src/stores'
import { monthYear } from 'src/utils/date'
import { onMounted, ref } from 'vue'
import ShareComponent from './ShareComponent.vue'
import ShowcaseArt from './ShowcaseArt.vue'

const props = defineProps(['collectionName', 'post', 'title'])
defineEmits(['clickComments'])

const commentStore = useCommentStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()
const userStore = useUserStore()

const countComments = ref(commentStore.getComments.length)
const countDislikes = ref(likeStore.getDislikes.length)
const countLikes = ref(likeStore.getLikes.length)
const countShares = ref(shareStore.getShares.length)
const isDisliked = ref(false)
const isLiked = ref(false)
const userId = ref('')
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.isAuthenticated ? userStore?.getUserRef?.id : userStore.getUserIpHash
})

commentStore.$subscribe((_mutation, state) => {
  countComments.value = state._comments.length
})

likeStore.$subscribe((_mutation, state) => {
  countLikes.value = state._likes.length
  countDislikes.value = state._dislikes.length

  isLiked.value = Boolean(state._likes.find((post) => post.author.id === userId.value))
  isDisliked.value = Boolean(state._dislikes.find((post) => post.author.id === userId.value))
})

shareStore.$subscribe((_mutation, state) => {
  countShares.value = state._shares.length
})

async function like() {
  await likeStore.addLike(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
}

async function dislike() {
  await likeStore.addDislike(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
}

async function share(socialNetwork) {
  await shareStore.addShare(props.collectionName, props.post.id, socialNetwork).catch((error) => errorStore.throwError(error))
}
</script>

<style scoped lang="scss">
.parallax {
  position: fixed;
  top: 65px;
  z-index: -1;
}
</style>
