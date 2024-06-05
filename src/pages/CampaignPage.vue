<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-py-sm" data-test="advertise-tab" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-py-sm" data-test="graph-tab" icon="fiber_manual_record" name="anthrogram" :ripple="false" />
    <q-tab content-class="q-mr-auto q-py-sm" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-tab-panels v-if="advertise" animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="post" style="padding: 0">
      <SingleAdvertise :advertise="advertise" title="Campaign Page" @clickComments="tab = 'comments'" />
    </q-tab-panel>

    <q-tab-panel name="anthrogram" class="bg-white">
      <TheAnthrogram :post="advertise" :isAdd="true" collectionName="advertises" />
    </q-tab-panel>

    <q-tab-panel name="comments" class="bg-white" v-if="advertise">
      <TheComments collectionName="advertises" :post="advertise" />
    </q-tab-panel>
  </q-tab-panels>

  <q-spinner v-else class="absolute-center" color="primary" size="3em" />
</template>
<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import SingleAdvertise from '../components/Advertiser/SingleAdvertise.vue'
import {
  useCommentStore,
  useErrorStore,
  useLikeStore,
  useAdvertiseStore,
  useShareStore,
  useClicksStore,
  useImpressionsStore,
  useStatStore
} from 'src/stores'
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { startTracking, stopTracking } from 'src/utils/activityTracker'

const router = useRouter()

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const advertiseStore = useAdvertiseStore()
const shareStore = useShareStore()
const impressionStore = useImpressionsStore()
const clickStore = useClicksStore()
const statStore = useStatStore()

const tab = ref(advertiseStore.tab)
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

advertiseStore.fetchAdvertises().catch((error) => console.log(error))
advertiseStore.getActiveAdvertise().catch((error) => console.log(error))
const { params } = router.currentRoute.value
const advertise = computed(() => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return (
    advertiseStore.getActiveAdvertises.find((advertise) => advertise.id === params.campaignId) ||
    advertiseStore.getAdvertises.find((advertise) => advertise.id === params.campaignId)
  )
})

function redirect() {
  if (advertiseStore.getAdvertises && advertiseStore.getActiveAdvertises && !advertise.value?.id) {
    $q.notify({
      type: 'info',
      message: 'advertise Not found'
    })
    setTimeout(async () => {
      $q.notify({
        type: 'info',
        message: 'You will be redirected in 3 seconds'
      })
    }, 1000)
    setTimeout(async () => {
      await router.push('/404')
    }, 4000)
  }
}

watchEffect(async () => {
  if (advertise.value?.id) {
    const advertiseId = advertise.value?.id
    await likeStore.getAllLikesDislikes('advertises', advertiseId).catch((error) => errorStore.throwError(error))

    await impressionStore.readImpressions('advertises', advertiseId).catch((error) => console.log(error))

    await clickStore.readClicks('advertises', advertiseId).catch((error) => console.log(error))

    shareIsLoading.value = true
    await shareStore
      .fetchSharesCount('advertises', advertiseId)
      .catch((error) => errorStore.throwError(error))
      .finally(() => {
        shareIsLoading.value = false
        shareIsLoaded.value = true
      })
  }

  setTimeout(redirect, 5000)
})

onUnmounted(async () => {
  startTracking()
  advertiseStore.setTab('post')
  await likeStore.resetLikes()
  await shareStore.resetShares()
  await commentStore.resetComments()
  await impressionStore.resetImpressions()
  await likeStore.resetLikes()
})

onBeforeRouteLeave(async () => {
  const stats = stopTracking()
  await statStore.addStats(advertise.value?.id, stats, 'advertisement')
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
