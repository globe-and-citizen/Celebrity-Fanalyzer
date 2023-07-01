<template>
  <q-page-container style="padding-bottom: 0">
    <q-page class="bg-white" style="min-height: auto; padding-bottom: 7rem">
      <TheHeader feedbackButton :title="title" />
      <q-img class="parallax q-page-container" :ratio="1" spinner-color="primary" spinner-size="82px" :src="post?.image" />
      <section class="q-pa-md q-pb-none" style="margin-top: 100%">
        <div class="flex justify-between">
          <p v-if="post?.date" class="text-body2">{{ monthYear(post.date) }}</p>
          <div>
            <q-badge v-for="(category, index) of post?.categories" class="q-mx-xs" :key="index" rounded>
              {{ category }}
            </q-badge>
          </div>
        </div>
        <h1 class="q-mt-none text-bold text-h5">{{ post?.title }}</h1>
        <q-separator spaced />
        <section
          v-if="post?.author"
          class="cursor-pointer flex items-center no-wrap q-pa-md"
          data-test="author-section"
          @click="router.push(`/fan/${props.post.author.username || props.post.author.uid}`)"
        >
          <q-avatar size="6rem">
            <q-img :src="post.author.photoURL" :srcset="post.author.photoURL" />
          </q-avatar>
          <div class="q-ml-md">
            <p class="text-body1 text-bold">{{ post.author.displayName }}</p>
            <p class="q-mb-none" style="white-space: pre-line">{{ post.author.bio }}</p>
          </div>
        </section>
        <q-separator spaced />
        <p class="q-mt-md text-body1" v-html="post?.description"></p>
        <q-separator spaced="lg" />
        <div class="text-center">
          <q-btn
            color="green"
            :data-test="!likeStore._isLoading && likeStore._isLoaded ? 'like-button' : ''"
            flat
            :icon="
              likeStore.getLikes.find((post) => post.author.id === userId) ? 'img:/icons/thumbs-up-bolder.svg' : 'img:/icons/thumbs-up.svg'
            "
            :label="likeStore.getLikes.length"
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
            :icon="
              likeStore.getDislikes.find((post) => post.author.id === userId)
                ? 'img:/icons/thumbs-down-bolder.svg'
                : 'img:/icons/thumbs-down.svg'
            "
            :label="likeStore.getDislikes.length"
            rounded
            size="0.75rem"
            @click="dislike()"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
          </q-btn>
          <q-btn
            :data-test="commentStore.getComments ? 'panel-3-navigator' : ''"
            flat
            icon="chat_bubble_outline"
            :label="commentStore.getComments?.length"
            rounded
            size="0.75rem"
            @click="$emit('clickComments')"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Comments</q-tooltip>
          </q-btn>
          <ShareComponent :label="shareStore.getShares.length" @share="share($event)" />
          <q-btn
            v-if="userStore.isAuthenticated"
            color="blue"
            flat
            :icon="userStore.getUser.subscriptions?.includes(props.post?.id) ? 'notifications' : 'notifications_none'"
            :label="props.post?.subscribers?.length || 0"
            rounded
            size="0.75rem"
            @click="subscribe"
          >
            <q-tooltip>{{ userStore.getUser.subscriptions?.includes(props.post.id) ? 'Subscribed' : 'Subscribe' }}</q-tooltip>
          </q-btn>
        </div>
      </section>
      <ShowcaseArt v-if="post?.showcase?.arts?.length" :showcase="post.showcase" />
      <q-separator inset />
    </q-page>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import {
  useCommentStore,
  useErrorStore,
  useLikeStore,
  useNotificationStore,
  useShareStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'
import { monthYear } from 'src/utils/date'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShareComponent from './ShareComponent.vue'
import ShowcaseArt from './ShowcaseArt.vue'

const props = defineProps(['collectionName', 'post', 'title'])
defineEmits(['clickComments'])

const router = useRouter()

const commentStore = useCommentStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const notificationStore = useNotificationStore()
const shareStore = useShareStore()
const userStore = useUserStore()
const visitorStore = useVisitorStore()

const userId = ref('')

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.isAuthenticated ? userStore?.getUserRef?.id : userStore.getUserIpHash

  visitorStore.readVisitors(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))

  await visitorStore.addVisitor(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
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

async function subscribe() {
  await notificationStore.toggleSubscription(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
}
</script>

<style scoped lang="scss">
.parallax {
  position: fixed;
  top: 65px;
  z-index: -1;
}
</style>
