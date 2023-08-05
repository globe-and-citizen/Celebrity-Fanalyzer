<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-pb-md" icon="fiber_manual_record" name="stats" :ripple="false" />
    <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!entry && entryStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Entry -->
    <q-tab-panel v-if="entry" name="post" style="padding: 0">
      <ThePost collectionName="entries" :post="entry" title="Entry Page" style="padding-bottom: 7rem" @clickComments="tab = 'comments'" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="stats" class="bg-white">
      <TheAnthrogram :post="entry" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white">
      <TheComments collectionName="entries" :post="entry" />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, useShareStore } from 'src/stores'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const entryStore = useEntryStore()
const likeStore = useLikeStore()
const shareStore = useShareStore()

const tab = ref(entryStore.tab)

entryStore.fetchEntries().catch((error) => errorStore.throwError(error))

const entry = computed(() => {
  return entryStore.getEntries?.find((entry) => entry.slug === router.currentRoute.value.href)
})

watchEffect(async () => {
  if (entry.value?.id) {
    await commentStore.fetchComments('entries', entry.value.id).catch((error) => errorStore.throwError(error))
    await likeStore.getAllLikesDislikes('entries', entry.value.id).catch((error) => errorStore.throwError(error))
    await shareStore.fetchShares('entries', entry.value.id).catch((error) => errorStore.throwError(error))
  }
})

onMounted(() => {
  if (entryStore.getEntries && !entry.value?.id) {
    $q.notify({
      type: 'info',
      message: 'Entry Not found'
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
  entryStore.setTab('post')
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
