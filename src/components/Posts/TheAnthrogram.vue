<template>
  <TheHeader :subtitle="post?.title" title="Anthrogram" />
  <q-page-container>
    <q-page>
      <section class="q-py-md">
        <q-tabs
          active-color="primary"
          align="justify"
          class="text-grey q-mb-xl"
          dense
          indicator-color="primary"
          narrow-indicator
          v-model="type"
        >
          <q-tab name="daily" label="Daily" />
          <q-tab name="weekly" label="Weekly" />
          <q-tab name="all" label="All" />
        </q-tabs>
        <VisitorsBar :data="visitorStore.getVisitors" :interval="type" />
        <q-separator spaced="xl" />
        <LikesBar :data="graphData(type)" />
        <q-separator spaced="xl" />
        <SharesPie :data="shares" :interval="type" />
      </section>
    </q-page>
  </q-page-container>
</template>

<script setup>
import { Timestamp } from 'firebase/firestore'
import VisitorsBar from 'src/components/Graphs/VisitorsBar.vue'
import LikesBar from 'src/components/Graphs/LikesBar.vue'
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useLikeStore, useShareStore, useVisitorStore } from 'src/stores'
import { getStats } from 'src/utils/date'
import { formatAllStats, formatStats } from 'src/utils/stats'
import { ref } from 'vue'

const props = defineProps(['post'])

const likeStore = useLikeStore()
const shareStore = useShareStore()
const visitorStore = useVisitorStore()

const shares = ref(shareStore.getShares)
const type = ref('daily')

const updateChartData = () => {
  if (!props.post.created) return
  const { weekStats, dayStats } = getStats(likeStore.$state, props.post.created)
  const allStats = [
    {
      date: Timestamp.fromDate(new Date()),
      likes: likeStore.getLikes.length,
      dislikes: likeStore.getDislikes.length
    }
  ]
  return { weekStats, dayStats, allStats }
}
const chartData = ref(updateChartData())

likeStore.$subscribe(() => {
  chartData.value = updateChartData()
})

shareStore.$subscribe((_mutation, state) => {
  shares.value = state._shares
})

function graphData(type) {
  if (!chartData.value) return []

  if (type === 'daily') {
    return formatStats(chartData.value.dayStats, 'daily')
  }

  if (type === 'weekly') {
    return formatStats(chartData.value.weekStats, 'weekly')
  }

  return formatAllStats(chartData.value.allStats)
}
</script>
