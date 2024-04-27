<template>
  <TheHeader
    feedbackButton
    notificationButton
    searchInput
    :title="`${router.currentRoute.value.params.year} Search Archive`"
    v-model="search"
  />
  <q-page-container>
    <q-page class="q-pa-md">
      <q-scroll-area :thumb-style="{ display: 'none' }" style="height: 3.8rem">
        <q-btn-toggle
          v-model="category"
          class="q-my-sm"
          color="white"
          no-caps
          no-wrap
          :options="computedCategories"
          rounded
          text-color="secondary"
          unelevated
        />
      </q-scroll-area>
      <q-separator class="q-mb-none q-mt-xs" />
      <section v-if="!promptStore.getPrompts && promptStore.isLoading">
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
      </section>
      <q-tab-panels animated swipeable v-model="category">
        <q-tab-panel v-for="(categ, i) in computedCategories" class="panel" :key="i" :name="categ.value">
          <TransitionGroup name="prompt" tag="div">
            <div v-for="prompt in computedPromptsAndAdvertises" :key="prompt?.id">
              <CampaignCard v-if="prompt.isAdd" :advertise="prompt" />
              <ItemCard
                v-else
                data-test="prompt-card"
                :item="prompt"
                :link="prompt?.slug"
                v-show="prompt?.categories.includes(categ.value) || category === 'All'"
              />
            </div>
          </TransitionGroup>
        </q-tab-panel>
      </q-tab-panels>
      <TransitionGroup tag="div">
        <TheEntries v-if="search && computedEntries?.length > 0" :entries="computedEntries" />
      </TransitionGroup>
    </q-page>
  </q-page-container>
</template>

<script setup>
import ArticleSkeleton from 'src/components/shared/ArticleSkeleton.vue'
import ItemCard from 'src/components/shared/ItemCard.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, useErrorStore, usePromptStore, useAdvertiseStore } from 'src/stores'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CampaignCard from '../components/Advertiser/CampaignCard.vue'

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const advertiseStore = useAdvertiseStore()

const category = ref('All')
const router = useRouter()
const search = ref('')
onMounted(() => {
  advertiseStore.getActiveAdvertise().catch((error) => console.log(error))
})
promptStore.fetchPrompts().catch((error) => errorStore.throwError(error))
entryStore.fetchEntries().catch((error) => errorStore.throwError(error))

// promptStore.$subscribe((_mutation, state) => {
//   promptStore.getPrompts.value = state._prompts
//
//   if (router.currentRoute.value.params.year) {
//     promptStore.getPrompts.value = promptStore.getPrompts.value?.filter((prompt) => prompt.date.split('-')[0] === router.currentRoute.value.params.year)
//   }
// })

const computedCategories = computed(() => {
  const allPromptCategories = computedPrompts.value?.flatMap(({ categories }) => categories)
  const uniqueCategories = Array.from(new Set(allPromptCategories), (category) => ({ label: category, value: category }))
  const allCategory = { label: 'All', value: 'All' }
  return [allCategory, ...uniqueCategories]
})
const computedAdvertises = computed(() => {
  // return advertiseStore.getAdvertises
  //   .filter((advertise) => advertise.status === 'Active')
  //   .map((element) => {
  //     element.isAdd = true
  //     return element
  //   })
  return advertiseStore.getActiveAdvertises
})
const computedPrompts = computed(() => {
  return promptStore.getPrompts?.filter((item) =>
    [item.title, item.description, item.author?.displayName, ...item.categories].some((str) =>
      str?.toLowerCase().includes(search.value.toLowerCase())
    )
  )
})
const computedPromptsAndAdvertises = computed(() => {
  let i = 0,
    j = 0
  let arr = []
  while (i < computedPrompts.value.length && j < computedAdvertises.value.length) {
    if (Math.random() > 0.5) {
      arr.push(computedPrompts.value[i])
      i++
    } else {
      arr.push(computedAdvertises.value[j])
      j++
    }
  }
  if (i < computedPrompts.value.length) {
    arr = [...arr, ...computedPrompts.value.slice(i)]
  }
  if (j < computedAdvertises.value.length) {
    arr = [...arr, ...computedAdvertises.value.slice(j)]
  }
  return arr
})

const computedEntries = computed(() => {
  return entryStore.getEntries?.filter((item) =>
    [item.title, item.description, item.author?.displayName].some((str) => str?.toLowerCase().includes(search.value.toLowerCase()))
  )
})
</script>

<style lang="scss" scoped>
.panel {
  padding-bottom: 0;
  padding-top: 0;
  @media (max-width: 500px) {
    padding: 0;
  }
}

.prompt-enter-active,
.prompt-leave-active {
  transition: all 0.3s ease;
}

.prompt-enter-from,
.prompt-leave-to {
  opacity: 0;
  height: 0;
  transform: translateY(-90px);
}
</style>
