<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Entry -->
    <q-tab-panel name="entry" style="padding: 0">
      <ThePost collectionName="entries" :post="entry" title="Entry Page" @clickComments="tab = 'comments'" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="stats" class="bg-white">
      <TheAnthrogram :post="entry" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white">
      <TheHeader title="Comments" />
      <q-page :data-test="!commentStore.isLoading ? 'comment-loaded' : 'comment-loading'">
        <TheComments collectionName="entries" :post="entry" />
      </q-page>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useShareStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const commentStore = useCommentStore()
const errorStore = useErrorStore()
const entryStore = useEntryStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()

const entry = ref({})
const tab = ref('entry')

onMounted(async () => {
  if (router.currentRoute.value.params.id) {
    await entryStore
      .fetchEntryBySlug(router.currentRoute.value.href)
      .then((res) => (entry.value = res))
      .catch(() => (entry.value = null))
  }

  if (!entry.value) {
    router.push('/404')
    return
  }

  await commentStore.fetchComments('entries', entry.value.id).catch((error) => errorStore.throwError(error))

  await likeStore.getAllLikesDislikes('entries', entry.value.id).catch((error) => errorStore.throwError(error))

  await shareStore.fetchShares('entries', entry.value.id).catch((error) => errorStore.throwError(error))
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
