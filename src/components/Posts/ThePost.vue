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
          class="cursor-pointer flex column items-start no-wrap q-pa-md"
          data-test="author-section"
          @click="router.push(`/fan/${props.post.author.username || props.post.author.uid}`)"
        >
          <div class="flex row items-center">
            <q-avatar size="4rem">
              <q-img
                :src="post.author.photoURL ? post.author.photoURL : '/icons/user_raiting_premium_member.svg'"
                :srcset="post.author.photoURL"
                :width="post.author.photoURL ? 'null' : '50px'"
              />
            </q-avatar>
            <div>
              <p class="text-body1 text-bold q-mb-none q-ml-md text-capitalize">{{ post.author.displayName }}</p>
              <div class="flex q-ml-md">
                <q-rating
                  v-model="userRating"
                  max="5"
                  size="1.4rem"
                  color="yellow"
                  icon="star_border"
                  icon-selected="star"
                  icon-half="star_half"
                  no-dimming
                  readonly
                />
              </div>
            </div>
          </div>

          <p v-if="props.post.author.bio" class="q-mb-none q-mt-md text-italic" style="white-space: pre-line">
            {{ post.author.bio }}
          </p>
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
          <ShareComponent :label="shareStore.getShares ? shareStore.getShares : 0" :disable="shareStore.isLoading" @share="share($event)" />
          <q-btn
            v-if="post?.productLink && post?.isAdd"
            flat
            icon="open_in_new"
            rounded
            size="0.75rem"
            :href="getFormattedLink(post?.productLink)"
            replace
            target="_blank"
          >
            <q-tooltip anchor="bottom middle" self="center middle">{{ getFormattedLink(post?.productLink) }}</q-tooltip>
          </q-btn>
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
  usePromptStore,
  useShareStore,
  useStatStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'
import { monthYear } from 'src/utils/date'
import { onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import ShareComponent from './ShareComponent.vue'
import ShowcaseArt from './ShowcaseArt.vue'
import { getFormattedLink } from '../../utils/getFormattedLink'

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
const statsStore = useStatStore()
const promptStore = usePromptStore()
const userRating = ref(0)

onMounted(async () => {
  // =========== STATS ===========
  const userId = userStore.getUserId ? userStore.getUserId : userStore.getUserIpHash
  const userLocation = userStore.getUserLocation
  await statsStore.addUser(userId, userLocation)
  if (typeof props.post?.entries !== 'undefined') {
    await statsStore.addTopic(props.post?.id, props.post.author?.uid, props.post?.title, props.post?.description, props.post?.categories)
  }
  if (typeof props.post.prompt !== 'undefined') {
    const promptId = props.post.prompt?.id
      ? props.post.prompt?.id
      : promptStore.getPrompts?.filter((prompt) => prompt.entries.includes(props.post.id))[0].id
    await statsStore.addArticle(props.post?.id, promptId, props.post.author?.uid, props.post?.title, props.post.description)
  }
  // =========== ------ ===========

  if (props.post?.id) {
    await commentStore.getTotalComments(props.collectionName, props.post?.id)
  }
  if (!props.isAdd || props.post?.status === 'Active') {
    await visitorStore.addVisitor(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
  }
})

const isPrompt = !!props.post.entries
const isAd = props.post?.isAdd
const id = props.post.id

async function like() {
  if (isPrompt) {
    await likeStore.addLike(props.collectionName, id, null, id, null).catch((error) => errorStore.throwError('Error adding like', error))
  } else if (isAd) {
    await likeStore.addLike(props.collectionName, id, null, null, id).catch((error) => errorStore.throwError('Error adding like', error))
  } else {
    await likeStore
      .addLike(props.collectionName, id, id, props.post?.prompt?.id, null)
      .catch((error) => errorStore.throwError('Error adding like', error))
  }
}

async function dislike() {
  if (isPrompt) {
    await likeStore.addDislike(props.collectionName, id, null, id, null).catch((error) => errorStore.throwError('Error adding like', error))
  } else if (isAd) {
    await likeStore.addDislike(props.collectionName, id, null, null, id).catch((error) => errorStore.throwError('Error adding like', error))
  } else {
    await likeStore
      .addDislike(props.collectionName, id, id, props.post?.prompt?.id, null)
      .catch((error) => errorStore.throwError('Error adding like', error))
  }
}

async function share(socialNetwork) {
  await shareStore.addShare(props.collectionName, props.post.id, socialNetwork).catch((error) => errorStore.throwError(error))
}

async function subscribe() {
  await notificationStore.toggleSubscription(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
}

watchEffect(async () => {
  if (statsStore.getUserRate?.userRating) {
    userRating.value = ((await statsStore.getUserRate?.userRating) / 100) * 5
  }
})
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
