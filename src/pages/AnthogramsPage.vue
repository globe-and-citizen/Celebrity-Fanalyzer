<template>
  <TheHeader feedbackButton title="Anthograms" />
  <q-page-container style="max-width: none">
    <div>
      <HalfDonought :stats="statStore.getStats" :title="'Summary Data'" />
      <LikesBar
        v-if="likeStore.getLikes && likeStore.getDislikes"
        :data="{ likes: likeStore.getLikes, dislikes: likeStore.getDislikes }"
        :stats="statStore.getStats"
      />
    </div>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, useLikeStore, useStatStore } from 'src/stores'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HalfDonought from 'components/Posts/Graphs/HalfDonought.vue'
import { use } from 'echarts/core'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import LikesBar from 'components/Posts/Graphs/LikesBar.vue'
const router = useRouter()
use([TooltipComponent, TitleComponent])

const entryStore = useEntryStore()
const statStore = useStatStore()
const likeStore = useLikeStore()
const entry = computed(() => entryStore.getEntries?.find((entry) => router.currentRoute.value.href.includes(entry.slug)))

const visits = computed(() => {
  const visits = statStore.getStats || 0
  const anonymous = visits.filter((stat) => stat.user_id.length === 40).map((stat) => stat.user_id)

  return `Detailed Data: ${visits.length === 1 ? '1 visit' : `${visits.length} visits`} (${anonymous.length} anonymous)`
})

const visitors = computed(() => {
  const authors = new Set(statStore.getStats?.map((stat) => stat.user_id))
  const anonymous = new Set(statStore.getStats?.filter((stat) => stat.user_id.length === 40).map((stat) => stat.user_id))

  return `Summary Data: ${authors.size === 1 ? '1 visitor' : `${authors.size} visitors`} (${anonymous.size} anonymous)`
})

onMounted(async () => {
  if (!entryStore.getEntries.length) {
    await entryStore.fetchEntries()
  }

  await statStore.fetchStats(entry.value.id)
})
</script>
