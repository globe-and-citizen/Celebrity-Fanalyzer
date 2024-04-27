<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-py-sm" data-test="prompt-tab" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-py-sm" data-test="graph-tab" icon="fiber_manual_record" name="anthrogram" :ripple="false" />
    <q-tab content-class="q-mr-auto q-py-sm" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-tab-panels v-if="advertise" animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Prompt -->
    <q-tab-panel name="post" style="padding: 0">
      <SingleAdvertise :advertise="advertise" title="Campaign Page" @clickComments="tab = 'comments'"/>
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="anthrogram" class="bg-white">
      <TheAnthrogram :post="advertise" :isAdd="true" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
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
import { useCommentStore, useErrorStore, useLikeStore, useAdvertiseStore, useShareStore, useClicksStore, useImpressionsStore } from 'src/stores'
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const advertiseStore = useAdvertiseStore()
const shareStore = useShareStore()
const impressionStore = useImpressionsStore()
const clickStore = useClicksStore()

const tab = ref(advertiseStore.tab)
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

advertiseStore.fetchAdvertises().catch((error) => console.log(error))
const {  params } = router.currentRoute.value
const advertise = computed(() => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return advertiseStore.getActiveAdvertises.find((advertise) => advertise.id === params.campaignId) || advertiseStore.getAdvertises.find((advertise)=>advertise.id === params.campaignId)
})

watchEffect(async () => {
  if (advertise.value?.id) {
    const advertiseId = advertise.value?.id
    await commentStore.fetchComments('advertises', advertiseId).catch((error) => errorStore.throwError(error))

    await likeStore.getAllLikesDislikes('advertises', advertiseId).catch((error) => errorStore.throwError(error))

    await impressionStore.readImpressions('advertises', advertiseId).catch((error)=>console.log(error) )

    await clickStore.readClicks('advertises', advertiseId).catch((error)=>console.log(error))

    shareIsLoading.value = true
    await shareStore
      .fetchShares('advertises', advertiseId)
      .catch((error) => errorStore.throwError(error))
      .finally(() => {
        shareIsLoading.value = false
        shareIsLoaded.value = true
      })
  }
  // console.log(advertise.value)
  if (advertiseStore.getAdvertises && !advertise.value?.id) {
    $q.notify({
      type: 'info',
      message: 'advertise Not found'
    })
    setTimeout(async () => {
      $q.notify({
        type: 'info',
        message: 'You will be redirected in 3 seconds'
      })
    }, 3000)
    setTimeout(async () => {
      await router.push('/404')
    }, 6000)
  }
})

onUnmounted(() => {
  advertiseStore.setTab('post')
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
