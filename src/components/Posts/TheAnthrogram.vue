<template>
  <q-page>
    <TheHeader :subtitle="post?.title" title="Anthrogram" />
    <section class="q-mt-md">
      <q-tabs
        active-color="primary"
        align="justify"
        class="text-grey q-mb-xl"
        dense
        indicator-color="primary"
        narrow-indicator
        v-model="type"
      >
        <q-tab name="all" label="All" />
        <q-tab name="week" label="Week" />
        <q-tab name="day" label="Days" />
      </q-tabs>
      <LikesBar :data="graphData(type)" />
      <SharesPie :data="shares" :interval="type" />
    </section>
  </q-page>
</template>

<script setup>
import { Timestamp } from 'firebase/firestore'
import LikesBar from 'src/components/Graphs/LikesBar.vue'
import SharesPie from 'src/components/Graphs/SharesPie.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useLikeStore, useShareStore } from 'src/stores'
import { getStats } from 'src/utils/date'
import { formatAllStats, formatDayStats, formatWeekStats } from 'src/utils/stats'
import { ref } from 'vue'

const props = defineProps(['post'])

const likeStore = useLikeStore()
const shareStore = useShareStore()

const shares = ref(shareStore.getShares)
const type = ref('all')

const updateChartData = () => {
  if (!props.post.created) return
  const { weekStats, dayStats } = getStats(likeStore.$state, props.post.created)
  const allStats = [
    {
      date: Timestamp.fromDate(new Date()),
      likes: likeStore.$state._likes.length,
      dislikes: likeStore.$state._dislikes.length
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

  if (type === 'day') {
    return formatDayStats(chartData.value.dayStats)
  }
  if (type === 'week') {
    return formatWeekStats(chartData.value.weekStats)
  }
  return formatAllStats(chartData.value.allStats)
}
</script>
