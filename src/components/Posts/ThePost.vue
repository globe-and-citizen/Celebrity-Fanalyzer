<template>
  <q-page-container style="padding-bottom: 0">
    <q-page class="bg-white" style="min-height: auto">
      <TheHeader feedbackButton :title="title" />
      <q-responsive :ratio="1" v-if="!isAdd" :style="{ backgroundImage: `url(${post?.image})` }">
        <div class="bg-blur flex">
          <q-img fit="contain" ratio="1" spinner-color="primary" :src="post?.image" />
        </div>
      </q-responsive>
      <div v-else-if="post.contentURL" class="bg-blur flex">
       <q-img class="rounded-borders full-width height-auto q-mt-lg" :src="post.contentURL" />
      </div>
      <section class="q-pa-md q-pb-none" :class="{ 'margin-bottom': isAdd }">
        <div class="flex justify-between">
          <p v-if="post?.date" class="text-body2">{{ monthYear(post.date) }}</p>
          <div v-show="!isAdd">
            <q-badge v-for="(category, index) of post?.categories" class="q-mx-xs" :key="index" rounded>
              {{ category }}
            </q-badge>
          </div>
        </div>
        <h1 class="q-mt-none text-bold text-h5">{{ post?.title }}</h1>
        <q-separator spaced />
        <section
          v-if="post?.author && !isAdd"
          class="cursor-pointer flex items-center no-wrap q-pa-md"
          data-test="author-section"
          @click="router.push(`/fan/${props.post.author.username || props.post.author.uid}`)"
        >
          <q-avatar size="6rem">
            <q-img
              :src="post.author.photoURL ? post.author.photoURL : '/icons/user_raiting_premium_member.svg'"
              :srcset="post.author.photoURL"
              :width="post.author.photoURL ? 'null' : '65px'"
            />
          </q-avatar>
          <div class="q-ml-md">
            <p class="text-body1 text-bold">{{ post.author.displayName }}</p>
            <p class="q-mb-none" style="white-space: pre-line">{{ post.author.bio }}</p>
          </div>
        </section>
        <q-separator v-if="!isAdd" spaced />
        <p v-if="isAdd" class="q-mt-sm text-body1">{{ post.content }}</p>
        <p v-else class="q-mt-md text-body1" v-html="post?.description"></p>
        <q-separator spaced="lg" />
        <div class="text-center">
          <q-btn
            color="green"
            :data-test="!likeStore._isLoading && likeStore.getLikes ? 'like-button' : ''"
            flat
            :icon="
              likeStore.getLikes?.find((like) => like.id === userStore.getUserId)
                ? 'img:/icons/thumbs-up-bolder.svg'
                : 'img:/icons/thumbs-up.svg'
            "
            :label="likeStore.getLikes?.length || 0"
            rounded
            size="0.75rem"
            @click="like()"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
          </q-btn>
          <q-btn
            color="red"
            :data-test="!likeStore._isLoading && likeStore.getDislikes ? 'dislike-button' : ''"
            flat
            :icon="
              likeStore.getDislikes?.find((dislike) => dislike.id === userStore.getUserId)
                ? 'img:/icons/thumbs-down-bolder.svg'
                : 'img:/icons/thumbs-down.svg'
            "
            :label="likeStore.getDislikes?.length || 0"
            rounded
            size="0.75rem"
            @click="dislike()"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
          </q-btn>
          <q-btn
            :data-test="commentStore.getCommentsCount ? 'panel-3-navigator' : ''"
            flat
            icon="chat_bubble_outline"
            :label="commentStore.getCommentsCount"
            rounded
            size="0.75rem"
            @click="$emit('clickComments')"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Comments</q-tooltip>
          </q-btn>
          <ShareComponent :label="shareStore.isLoaded ? shareStore.getShares : 0" :disable="shareStore.isLoading" @share="share($event)" />
          <q-btn
            v-if="userStore.isAuthenticated && !isAdd"
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
  useEntryStore,
  useErrorStore,
  useLikeStore,
  useNotificationStore,
  useShareStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'
import { monthYear } from 'src/utils/date'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ShareComponent from './ShareComponent.vue'
import ShowcaseArt from './ShowcaseArt.vue'

const props = defineProps(['collectionName', 'post', 'title', 'isAdd'])
defineEmits(['clickComments'])

const router = useRouter()

const commentStore = useCommentStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const notificationStore = useNotificationStore()
const shareStore = useShareStore()
const userStore = useUserStore()
const visitorStore = useVisitorStore()
const entryStore = useEntryStore()

onMounted(async () => {
  await userStore.fetchUserIp()
  if (props.post?.id) {
    await commentStore.getTotalComments(props.collectionName, props.post?.id)
  }
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
// add a blur effect to the background image
.bg-blur {
  backdrop-filter: blur(60px);
}
.margin-bottom {
  margin-bottom: 6rem;
}
</style>
