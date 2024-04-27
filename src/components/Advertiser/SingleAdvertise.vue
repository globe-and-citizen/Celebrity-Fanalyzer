<template>
  <q-page-container style="padding-bottom: 0">
    <q-page class="bg-white" style="min-height: auto">
      <TheHeader feedbackButton :title="'Campaign'" />
      <div >
        <q-card class="my-card margin-bottom no-border" flat bordered>
          <!-- <q-card-section class="flex justify-between">
        <router-link
          v-if="advertise.author"
          class="flex items-center text-decoration-none"
          :to="`/fan/${advertise.author.username || advertise.author.uid}`"
        >
          <div class="text-body1 text-grey">
            <q-avatar v-if="!advertise.author?.photoURL" size="35px" color="blue-grey" class="text-white">
              {{ advertise.author.displayName[0] }}
            </q-avatar>
            <q-avatar v-else size="35px">
              <img :src="advertise.author.photoURL" />
            </q-avatar>
            {{ advertise.author.displayName }}
          </div>
        </router-link>
        <span v-if="advertise?.type === 'Text'" class="text-body-2 text-grey">{{ giveReadingTime(advertise.content) }} min read</span>
      </q-card-section> -->

          <q-card-section v-if="advertise.type === 'Banner' && advertise.contentURL" class="col-5 flex flex-center">
            <q-img class="rounded-borders full-width height-auto" :src="advertise.contentURL" />
          </q-card-section>
          <q-card-section v-else class="col-5 flex flex-center">
            <q-img class="rounded-borders full-width height-auto" src="https://cdn.quasar.dev/img/parallax2.jpg" />
          </q-card-section>
          <q-card-section horizontal class="flex justify-between">
            <q-card-section class="q-pt-xs flex row justify-evenly full-width">
              <div class="col-2">
                <div class="date-box">
                  <span class="month text-primary">{{ getMonth(advertise.created) }}</span>
                  <span class="date text-primary">{{ getDay(advertise.created) }}</span>
                </div>
              </div>
              <pre></pre>
              <div class="q-my-none col-9">
                <div class="q-mt-sm q-mb-xs">
                  <p class="text-h5">{{ advertise.title?.length > 40 ? advertise.title.substring(0, 40) + '...' : advertise.title }}</p>
                </div>
                <template v-if="advertise?.type === 'Text'">
                  <p class="q-mt-sm text-body1">{{ advertise.content }}</p>
                </template>
              </div>

              <div class="full-width" v-if="advertise.categories">
                <q-chip v-for="(item, i) of advertise.categories" class="q-mx-xs" :key="i" color="primary" dark size="12px" rounded>
                  {{ item }}
                </q-chip>
              </div>
            </q-card-section>
          </q-card-section>
          <q-card-section>
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
              <ShareComponent
                :label="shareStore.isLoaded ? shareStore.getShares.length : 0"
                :disable="!shareStore.isLoaded"
                @share="share($event)"
              />
            </div>
            <q-separator spaced="lg" />
          </q-card-section>

          <q-separator />
        </q-card>
      </div>
    </q-page>
  </q-page-container>
</template>
<script setup>
import {  useCommentStore, useErrorStore, useLikeStore, useShareStore, useUserStore, useVisitorStore } from 'src/stores'
import {  defineEmits, defineProps, onMounted } from 'vue'
import ShareComponent from '../Posts/ShareComponent.vue'
import TheHeader from '../shared/TheHeader.vue'

const props = defineProps({
  advertise: {
    type: Object,
    default: () => {}
  },
  collectionName: {
    type: String,
    default: () => 'advertises'
  }
})
defineEmits(['clickComments'])



const commentStore = useCommentStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()
const userStore = useUserStore()
const visitorStore = useVisitorStore()

function getDate(timestamp) {
  return timestamp ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000) : new Date()
}

function getDay(timestamp) {
  const date = getDate(timestamp)
  return date.getDate()
}

function getMonth(timestamp) {
  const date = getDate(timestamp)
  return date.toLocaleString('default', { month: 'long' }).toUpperCase().slice(0, 3)
}
onMounted(async () => {
  await userStore.fetchUserIp()

  visitorStore.readVisitors(props.collectionName, props.advertise.id).catch((error) => errorStore.throwError(error))

  await visitorStore.addVisitor(props.collectionName, props.advertise.id).catch((error) => errorStore.throwError(error))
})

async function like() {
  await likeStore.addLike(props.collectionName, props.advertise.id).catch((error) => errorStore.throwError(error))
}

async function dislike() {
  await likeStore.addDislike(props.collectionName, props.advertise.id).catch((error) => errorStore.throwError(error))
}

async function share(socialNetwork) {
  await shareStore.addShare(props.collectionName, props.advertise.id, socialNetwork).catch((error) => errorStore.throwError(error))
}
</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}

.date-box {
  background: white;
  border: 1px solid #e54757;
  /* border-radius: 10px; */
  padding: 10px;
  max-height: 200px;
  max-width: 60px;
}

.date-box span {
  display: block;
  text-align: center;
}

.date-box .month {
  font-size: 9px;
  font-weight: 700;
}

.date-box .date {
  font-size: 20px;
  font-weight: 900;
}

.height-auto {
  height: auto;
}

.margin-bottom {
  margin-bottom: 6rem;
}

</style>
