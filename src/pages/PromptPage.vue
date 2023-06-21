<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-py-sm" data-test="prompt-tab" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-py-sm" data-test="graph-tab" icon="fiber_manual_record" name="anthrogram" :ripple="false" />
    <q-tab content-class="q-mr-auto q-py-sm" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-spinner v-if="!Object.keys(prompt)?.length && promptStore.isLoading" class="absolute-center" color="primary" size="3em" />
  <q-tab-panels v-else animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Prompt -->
    <q-tab-panel name="post" style="padding: 0">
      <ThePost collectionName="prompts" :post="prompt" title="Prompt Page" @clickComments="tab = 'comments'" />
      <TheEntries :entries="prompt?.entries" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="anthrogram" class="bg-white">
      <TheAnthrogram :post="prompt" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white">
      <TheComments collectionName="prompts" :post="prompt" />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, usePromptStore, useShareStore } from 'src/stores'
import { currentYearMonth, previousYearMonth } from 'src/utils/date'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const commentStore = useCommentStore()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()

const prompt = ref({})
const tab = ref('post')
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

onMounted(async () => {
  if (!promptByRoute()) {
    await promptStore.fetchPrompts().catch((error) => errorStore.throwError(error))
  }

  prompt.value = promptByRoute()

  if (!prompt.value) {
    router.push('/404')
    return
  }

  if (!entryStore.getEntries.length) {
    await entryStore.fetchEntries().catch((error) => errorStore.throwError(error))
  }

  prompt.value.entries = entryStore.getEntries.filter((entry) => entry.prompt === prompt.value?.id)

  await commentStore.fetchComments('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))

  await likeStore.getAllLikesDislikes('prompts', prompt.value.id).catch((error) => errorStore.throwError(error))

  shareIsLoading.value = true
  await shareStore
    .fetchShares('prompts', prompt.value.id)
    .catch((error) => errorStore.throwError(error))
    .finally(() => {
      shareIsLoading.value = false
      shareIsLoaded.value = true
    })
})

promptStore.$subscribe((_mutation, state) => {
  prompt.value = state._prompts.find((prompt) => prompt.id === promptByRoute()?.id)
})

const promptByRoute = () => {
  const route = router.currentRoute.value
  const currentMonth = currentYearMonth()
  const previousMonth = previousYearMonth()

  return (
    promptStore.getPrompts.find((prompt) => {
      switch (route.href) {
        case '/month':
          return [currentMonth, previousMonth].includes(prompt.date)
        case `/${route.params.year}/${route.params.month}`:
          return prompt.date === route.params.year + '-' + route.params.month
        case `/${route.params.slug}`:
          return [route.params.slug, route.path].includes(prompt.slug)
        default:
          return false
      }
    }) || promptStore.getPrompts[0]
  )
}
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
