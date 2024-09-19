<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-py-sm" data-test="advertise-tab" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-py-sm" data-test="graph-tab" icon="fiber_manual_record" name="anthrogram" :ripple="false" />
    <q-tab content-class="q-mr-auto q-py-sm" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-tab-panels v-if="!advertiseStore.isLoading" animated class="bg-transparent col-grow" swipeable v-model="tab">
    <q-tab-panel name="post" style="padding: 0">
      <ThePost
        title="Campaign Page"
        collectionName="advertises"
        :post="advertise"
        :isAdd="true"
        :showEdit="userStore.getUserId === advertise.author?.uid && computedDuration(advertise.endDate) >= 0"
        @clickComments="tab = 'comments'"
        @openAdvertiseDialog="openAdvertiseDialog"
      />
    </q-tab-panel>

    <q-tab-panel name="anthrogram" class="bg-white">
      <TheAnthrogram :post="advertise" :isAdd="true" collectionName="advertises" />
    </q-tab-panel>

    <q-tab-panel name="comments" class="bg-white" v-if="advertise">
      <TheComments collectionName="advertises" :post="advertise" />
    </q-tab-panel>
  </q-tab-panels>

  <q-spinner v-else class="absolute-center" color="primary" size="3em" />
  <q-dialog full-width position="bottom" v-model="editAdvertise.dialog">
    <AdvertiseCard v-bind="editAdvertise" @hideDialog="closeAdvertiseDialog" />
  </q-dialog>
</template>
<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from '../components/Posts/ThePost.vue'
import AdvertiseCard from '../components/Advertiser/AdvertiseCard.vue'
import {
  useErrorStore,
  useLikeStore,
  useAdvertiseStore,
  useShareStore,
  useClicksStore,
  useImpressionsStore,
  useStatStore,
  useUserStore
} from 'src/stores'
import { onUnmounted, ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { startTracking, stopTracking } from 'src/utils/activityTracker'
import { computedDuration } from 'src/utils/date'

const router = useRouter()

const $q = useQuasar()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const advertiseStore = useAdvertiseStore()
const shareStore = useShareStore()
const impressionStore = useImpressionsStore()
const clickStore = useClicksStore()
const statStore = useStatStore()
const userStore = useUserStore()

const tab = ref(advertiseStore.tab)
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)
const editAdvertise = ref({})
const advertise = ref({})

const { params } = router.currentRoute.value

watchEffect(async () => {
  advertise.value = await advertiseStore.fetchAdvertiseById(params.campaignId)
  if (advertise.value?.id) {
    const advertiseId = advertise.value?.id
    await likeStore.getAllLikesDislikes('advertises', advertiseId).catch((error) => errorStore.throwError(error))
    await impressionStore.readImpressions('advertises', advertiseId).catch((error) => errorStore.throwError(error))
    await clickStore.readClicks('advertises', advertiseId).catch((error) => errorStore.throwError(error))

    shareIsLoading.value = true
    await shareStore
      .fetchSharesCount('advertises', advertiseId)
      .catch((error) => errorStore.throwError(error))
      .finally(() => {
        shareIsLoading.value = false
        shareIsLoaded.value = true
      })
  }
})

onMounted(() => {
  if (advertise.value?.status === 'Active') {
    startTracking()
  }
})

function closeAdvertiseDialog(slug) {
  editAdvertise.value = {}
}
function openAdvertiseDialog() {
  editAdvertise.value = advertise.value
  editAdvertise.value.dialog = true
}

onUnmounted(async () => {
  if (advertise.value.status === 'Active') {
    const stats = stopTracking()
    try {
      await statStore.addStats(advertise.value?.id, advertise?.value?.author?.uid, stats, 'advertisement')
    } catch (error) {
      console.error('Error adding stats:', error)
    }
  }
  advertiseStore.setTab('post')
  statStore.resetPostImpressions()
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
