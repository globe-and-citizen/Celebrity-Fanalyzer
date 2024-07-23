<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector q-pb-xs" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="entryStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else-if="entry" animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Entry -->
    <q-tab-panel name="post" style="padding: 0" data-test="entry-page">
      <ThePost collectionName="entries" :post="entry" title="Entry Page" style="padding-bottom: 7rem" @clickComments="tab = 'comments'" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="stats" class="bg-white">
      <TheAnthrogram :post="entry" collectionName="entries" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white">
      <TheComments v-if="entry" collectionName="entries" :post="entry" />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useShareStore, useStatStore } from 'src/stores'
import { startTracking, stopTracking } from 'src/utils/activityTracker'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()
const statStore = useStatStore()
const commentStore = useCommentStore()
const tab = ref(entryStore.tab)

const entry = computed(() => {
  return entryStore.getEntries?.find(
    (entry) =>
      router.currentRoute.value.href === entry.slug ||
      router.currentRoute.value.href.slice(1, -3).replace('/', '-').replace('/', '') === entry.id
  )
})
watchEffect(async () => {
  if (entry.value?.author?.uid) {
    await statStore.getUserRating(entry.value?.author?.uid)
  }

  if (entry.value?.id) {
    await likeStore.getAllLikesDislikes('entries', entry.value?.id).catch((error) => errorStore.throwError(error))
    await shareStore.fetchSharesCount('entries', entry.value?.id).catch((error) => errorStore.throwError(error))
    await commentStore.getTotalComments('entries', entry.value?.id)
  }
})

onMounted(async () => {
  startTracking()
})

onBeforeRouteLeave(async () => {
  const stats = stopTracking()
  await statStore.addStats(entry.value.id, stats, 'article')
})

onUnmounted(() => {
  commentStore.resetComments()
  statStore.resetStats()
  entryStore.setTab('post')
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 3.5rem;
  z-index: 4;
}
</style>
