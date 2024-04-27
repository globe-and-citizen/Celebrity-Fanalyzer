<template>
  <TheHeader :subtitle="post?.title" title="Anthrogram" />
  <q-page-container>
    <q-page>
      <section class="q-py-md">
        <q-tabs active-color="primary" align="justify" class="text-grey q-mb-xl" dense indicator-color="primary" v-model="interval">
          <q-tab name="daily" label="Daily" />
          <q-tab name="weekly" label="Weekly" />
          <q-tab name="monthly" label="Monthly" />
        </q-tabs>
        <VisitorsBar :data="visitorStore.getVisitors" :interval="interval" />
        <q-separator spaced="xl" />
        <template v-if="isAdd">
          <CTRBar  :interval="interval" :impressionsData="impressionsStore.getImpressions" :clicksData="clickStore.getClicks" />
          <q-separator spaced="xl" />
        </template>
        <LikesBar
          v-if="likeStore.getLikes && likeStore.getDislikes"
          :data="{ likes: likeStore.getLikes, dislikes: likeStore.getDislikes }"
          :interval="interval"
        />
        <q-separator spaced="xl" />
        <SharesPie v-if="shareStore.isLoaded" :data="shareStore.getShares" :interval="interval" />
        <q-separator spaced="xl" />
      </section>
    </q-page>
  </q-page-container>
</template>

<script setup>
import LikesBar from 'src/components/Posts/Graphs/LikesBar.vue'
import SharesPie from 'src/components/Posts/Graphs/SharesPie.vue'
import VisitorsBar from 'src/components/Posts/Graphs/VisitorsBar.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import CTRBar from './Graphs/CTRBar.vue'
import { useLikeStore, useShareStore, useVisitorStore , useClicksStore, useImpressionsStore} from 'src/stores'
import { ref } from 'vue'

const props = defineProps(['post', 'isAdd'])

const likeStore = useLikeStore()
const shareStore = useShareStore()
const visitorStore = useVisitorStore()
const impressionsStore = useImpressionsStore()
const clickStore = useClicksStore()

const interval = ref('daily')
</script>
