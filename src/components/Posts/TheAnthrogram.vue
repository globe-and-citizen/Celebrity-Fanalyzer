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
        <VisitorsBar :data="visitorStore?.getVisitors" :interval="interval" />
        <template v-if="isAdd">
          <q-separator spaced="xl" />
          <CTRBar  :interval="interval" :impressionsData="impressionsStore.getImpressions" :clicksData="clickStore.getClicks" />
        </template>
        <q-separator spaced="xl" v-if="!!likeStore.getLikes?.length || !!likeStore.getDislikes?.length"/>
        <LikesBar
          v-if="!!likeStore.getLikes?.length || !!likeStore.getDislikes?.length"
          :data="{ likes: likeStore.getLikes??[], dislikes: likeStore.getDislikes??[] }"
          :interval="interval"
        />
        <q-separator v-if="!!shareStore?.getShares?.length" :data="shareStore?.getShares" spaced="xl" />
        <SharesPie v-if="!!shareStore?.getShares?.length" :data="shareStore?.getShares" :interval="interval" />
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
import { useLikeStore, useShareStore, useVisitorStore , useClicksStore, useImpressionsStore,useErrorStore} from 'src/stores'
import { ref,onMounted } from 'vue'

const props = defineProps(['post', 'isAdd','collectionName'])

const likeStore = useLikeStore()
const shareStore = useShareStore()
const visitorStore = useVisitorStore()
const impressionsStore = useImpressionsStore()
const clickStore = useClicksStore()
const errorStore = useErrorStore()

const interval = ref('daily')

onMounted(async () => {
  await visitorStore.readVisitors(props.collectionName, props.post.id).catch((error) => errorStore.throwError(error))
})
</script>
