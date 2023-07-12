<template>
  <q-tabs active-color="primary" class="bg-white fixed-bottom tab-selector" dense indicator-color="transparent" v-model="tab">
    <q-tab content-class="q-ml-auto q-py-sm" data-test="prompt-tab" icon="fiber_manual_record" name="post" :ripple="false" />
    <q-tab content-class="q-py-sm" data-test="graph-tab" icon="fiber_manual_record" name="anthrogram" :ripple="false" />
    <q-tab content-class="q-mr-auto q-py-sm" data-test="comments-tab" icon="fiber_manual_record" name="comments" :ripple="false" />
  </q-tabs>
  <q-tab-panels v-if="prompt" animated class="bg-transparent col-grow" swipeable v-model="tab">
    <!-- Panel 1: Prompt -->
    <q-tab-panel name="post" style="padding: 0">
      <ThePost collectionName="prompts" :post="prompt" title="Prompt Page" @clickComments="tab = 'comments'" />
      <TheEntries v-if="entries" :entries="entries" />
    </q-tab-panel>
    <!-- Panel 2: Anthrogram -->
    <q-tab-panel name="anthrogram" class="bg-white">
      <TheAnthrogram :post="prompt" />
    </q-tab-panel>
    <!-- Panel 3: Comments -->
    <q-tab-panel name="comments" class="bg-white" v-if="prompt">
      <TheComments collectionName="prompts" :post="prompt" />
    </q-tab-panel>
  </q-tab-panels>

  <q-spinner v-else class="absolute-center" color="primary" size="3em" />
</template>

<script setup>
import TheAnthrogram from 'src/components/Posts/TheAnthrogram.vue'
import TheComments from 'src/components/Posts/TheComments.vue'
import ThePost from 'src/components/Posts/ThePost.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import { useCommentStore, useEntryStore, useErrorStore, useLikeStore, usePromptStore, useShareStore } from 'src/stores'
import { currentYearMonth, previousYearMonth } from 'src/utils/date'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const commentStore = useCommentStore()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const likeStore = useLikeStore()
const promptStore = usePromptStore()
const shareStore = useShareStore()

const tab = ref(promptStore.tab)
const shareIsLoading = ref(false)
const shareIsLoaded = ref(false)

const prompt = computed(() => {
  const { href, params, path } = router.currentRoute.value
  const currentMonth = currentYearMonth()
  const previousMonth = previousYearMonth()

  return promptStore.getPrompts.find((prompt) => {
    switch (href) {
      case '/month':
        return [currentMonth, previousMonth].includes(prompt.date)
      case `/${params.year}/${params.month}`:
        return prompt.date === params.year + '-' + params.month
      case `/${params.slug}`:
        return [params.slug, path].includes(prompt.slug)
      default:
        return false
    }
  })
})

const entries = computed(() => {
  return entryStore.getEntries.filter((entry) => entry.prompt === prompt.value?.id)
})

onMounted(async () => {
  await promptStore.fetchPrompts().catch((error) => errorStore.throwError(error))

  if (!prompt.value?.id) {
    await new Promise((resolve) => setTimeout(resolve, 2000)) // wait 2 seconds before continue
  }

  if (!prompt.value?.id) {
    router.push('/404')
    return
  }

  await entryStore.fetchEntries().catch((error) => errorStore.throwError(error))

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

onUnmounted(() => {
  promptStore.setTab('post')
})
</script>

<style scoped lang="scss">
.tab-selector {
  margin-bottom: 4rem;
  z-index: 3;
}
</style>
