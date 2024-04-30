<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Entry -->
    <q-tab-panel v-if="entry" name="post" style="padding: 0" data-test="entry-page">
      <ThePost collectionName="entries" :post="entry" title="Entry Page" style="padding-bottom: 7rem" @clickComments="tab = 'comments'" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="stats" class="bg-white">
      <TheAnthrogram :post="entry" collectionName="entries" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white">
      <TheComments collectionName="entries" :post="entry" />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { useQuasar } from 'quasar'
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useShareStore, useStatStore } from 'src/stores'
import { startTracking, stopTracking } from 'src/utils/activityTracker'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const router = useRouter()

const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()
const statStore = useStatStore()
const commentStore = useCommentStore()
const tab = ref(entryStore.tab)

const entry = computed(() => {
  return entryStore.getEntries?.find((entry) => router.currentRoute.value.href === entry.slug)
})

watchEffect(async () => {
  if (entry.value?.id) {
    await likeStore.getAllLikesDislikes('entries', entry.value.id).catch((error) => errorStore.throwError(error))
    await shareStore.fetchShares('entries', entry.value.id).catch((error) => errorStore.throwError(error))
    await commentStore.getTotalComments('entries', entry.value.id)
  }
})

onMounted(() => {
  if (entryStore.getEntries === undefined) {
    entryStore.fetchEntryBySlug(router.currentRoute.value.href).catch((error) => errorStore.throwError(error))
  }

  startTracking()
  if (entryStore.getEntries && !entry.value?.id) {
    $q.notify({
      type: 'info',
      message: 'Entry Not found'
    })
    setTimeout(async () => {
      $q.notify({
        type: 'info',
        message: 'You will be redirected in 3 seconds'
      })
    }, 30000)
    setTimeout(async () => {
      await router.push('/404')
    }, 6000)
  }
})

onBeforeRouteLeave(async () => {
  const stats = stopTracking()
  await statStore.addStats(entry.value.id, stats)
})

onUnmounted(() => {
  entryStore.setTab('post')
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
