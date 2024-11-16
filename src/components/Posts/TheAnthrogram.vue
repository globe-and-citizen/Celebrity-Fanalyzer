<template>
  <TheHeader :subtitle="post?.title" title="Anthrogram" />
  <q-page-container class="anthogram-page-container">
    <q-page>
      <section class="q-py-md">
        <q-tabs active-color="primary" align="justify" class="text-grey q-mb-xl" dense indicator-color="primary" v-model="interval">
          <q-tab name="daily" label="Daily" />
          <q-tab name="weekly" label="Weekly" />
          <q-tab name="monthly" label="Monthly" />
        </q-tabs>
        <q-separator spaced="xl" />

        <div class="row justify-between" style="justify-content: space-between; gap: 10px">
          <div
            v-if="!!visitorStore?.getVisitors?.length"
            v-bind:class="statStore.getStats && hasValidStats ? 'col-md-6' : 'col-md-12'"
            class="col-12 anthogram-border"
          >
            <VisitorsBar :data="visitorStore?.getVisitors" :interval="interval" />
          </div>
          <div
            v-if="hasValidStats && statStore.getStats"
            v-bind:class="!!visitorStore?.getVisitors?.length ? 'col-md-6' : 'col-md-12'"
            class="col-12 anthogram-border"
          >
            <HalfDonought :stats="statStore.getStats" :title="'User\'s total activity'" />
          </div>
        </div>
        <div v-if="isAdd" class="anthogram-border q-my-sm">
          <CTRBar :interval="interval" :impressionsData="impressionsStore.getImpressions" :clicksData="clickStore.getClicks" />
        </div>

        <div class="row" style="justify-content: space-between; gap: 10px; margin-top: 10px">
          <div
            class="col-12 anthogram-border"
            v-if="!!shareStore?.getSharesStats?.length"
            v-bind:class="!!likeStore.getLikes?.length || !!likeStore.getDislikes?.length ? 'col-md-6' : 'col-md-12'"
          >
            <SharesPie :data="shareStore?.getSharesStats" :interval="interval" />
          </div>
          <div
            class="col-12 anthogram-border"
            v-if="!!likeStore.getLikes?.length || !!likeStore.getDislikes?.length"
            v-bind:class="!!shareStore?.getSharesStats?.length ? 'col-md-6' : 'col-md-12'"
          >
            <LikesBar :data="{ likes: likeStore.getLikes ?? [], dislikes: likeStore.getDislikes ?? [] }" :interval="interval" />
          </div>
        </div>

        <div class="row" style="justify-content: space-between; gap: 10px">
          <div
            class="col-12 anthogram-border rating-chart"
            v-if="!!statStore.getArticleRate"
            v-bind:class="!!statStore.getUserRate ? 'col-md-6' : 'col-md-12'"
          >
            <PopularityGauge :ratingValue="statStore.getArticleRate" :title="'Post popularity rating'" />
          </div>
          <div
            class="col-12 anthogram-border rating-chart"
            v-if="!!statStore.getUserRate"
            v-bind:class="!!statStore.getArticleRate ? 'col-md-6' : 'col-md-12'"
          >
            <PopularityGauge :ratingValue="statStore.getUserRate" :title="'User rating'" />
          </div>
        </div>

        <q-separator spaced="xl" />
        <div class="row q-mb-lg" v-if="!!statStore.getAllInteractionsByCountry?.response?.length">
          <div class="col-12 relative-position">
            <LeafletMap />
          </div>
        </div>
      </section>
    </q-page>
  </q-page-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LikesBar from './Graphs/LikesBar.vue'
import SharesPie from './Graphs/SharesPie.vue'
import VisitorsBar from './Graphs/VisitorsBar.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import LeafletMap from './Graphs/Map/LeafletMap.vue'
import { useClicksStore, useErrorStore, useImpressionsStore, useLikeStore, useShareStore, useStatStore, useVisitorStore } from 'src/stores'
import HalfDonought from './Graphs/HalfDonought.vue'
import PopularityGauge from './Graphs/PopularityGauge.vue'
import CTRBar from './Graphs/CTRBar.vue'

const props = defineProps(['post', 'isAdd', 'collectionName'])

const likeStore = useLikeStore()
const shareStore = useShareStore()
const visitorStore = useVisitorStore()
const impressionsStore = useImpressionsStore()
const clickStore = useClicksStore()
const errorStore = useErrorStore()
const statStore = useStatStore()

const interval = ref('daily')

const hasValidStats = computed(() => {
  return statStore.getStats?.some(
    (stat) => stat.clicks > 0 || stat.keypresses > 0 || stat.mouseMovements > 0 || stat.scrolls > 0 || stat.totalTime > 0
  )
})

onMounted(async () => {
  await visitorStore.readVisitors(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
  await shareStore.fetchSharesStats(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
  await statStore.fetchStats(props.post.id)
  await statStore.getArticleRating(props.post.id)
  await statStore.getArticleMetrics(props.post.id)
})

onUnmounted(() => {
  statStore.resetStats()
})
</script>

<style scoped>
.anthogram-page-container {
  max-width: 1450px;
}

.anthogram-border {
  border: 1px solid rgba(128, 128, 128, 0.45);
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  padding: 20px;
}

.rating-chart {
  min-height: 350px;

  @media (max-width: 426px) {
    min-height: 250px;
  }

  margin-top: 10px;
}
</style>
