<template>
  <TheHeader
    feedbackButton
    notificationButton
    searchInput
    :title="`${router.currentRoute.value.params.year ?? ''} Search Archive`"
    v-model="search"
  />
  <div class="relative-position">
    <q-spinner v-if="loader" color="primary" size="70px" :thickness="5" class="absolute-center" style="z-index: 2000; margin-top: 14rem" />
    <div ref="scrollTopObserver" class="absolute-center" style="height: 1px"></div>
  </div>
  <q-page-container class="search-page-container">
    <q-page ref="pageRef" class="q-pa-md">
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
      <section v-if="!promptStore.getPrompts && promptStore.isLoading">
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
      </section>
      <q-tab-panels animated swipeable v-model="category">
        <q-tab-panel v-for="(categ, i) in computedCategories" class="panel" :key="i" :name="categ.value">
          <TransitionGroup name="prompt" tag="div" class="card-items-wrapper">
            <ItemCard
              v-for="prompt in computedPromptsAndAdvertises"
              :key="prompt?.id"
              v-show="prompt?.categories.includes(categ.value) || category === 'All' || prompt?.isAdd"
              :item="prompt"
              :link="prompt?.slug"
            />
          </TransitionGroup>
        </q-tab-panel>
      </q-tab-panels>
      <TransitionGroup tag="div">
        <TheEntries v-if="search && computedEntries?.length > 0" :entries="computedEntries" />
      </TransitionGroup>
    </q-page>
    <div class="row justify-center">
      <q-spinner v-if="promptStore.isLoading" color="primary" size="70px" :thickness="5" />
      <div ref="observer" style="height: 1px"></div>
    </div>
  </q-page-container>
</template>

<script setup>
import ArticleSkeleton from 'src/components/shared/ArticleSkeleton.vue'
import ItemCard from 'src/components/shared/ItemCard.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useAdvertiseStore, useEntryStore, useErrorStore, usePromptStore } from 'src/stores'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const advertiseStore = useAdvertiseStore()

const category = ref('All')
const router = useRouter()
const search = ref('')
const observer = ref(null)
const scrollTopObserver = ref(null)
const pageRef = ref(null)
const loader = ref(false)

const computedCategories = computed(() => {
  const allPromptCategories = computedPrompts.value?.flatMap(({ categories }) => categories)
  const uniqueCategories = Array.from(new Set(allPromptCategories), (category) => ({ label: category, value: category }))
  const allCategory = { label: 'All', value: 'All' }
  return [allCategory, ...uniqueCategories]
})
const computedAdvertises = computed(() => {
  return advertiseStore.getActiveAdvertises
})
const computedPrompts = computed(() => {
  return promptStore.getPrompts
    ?.filter((item) => {
      const prompt = [item.title, item.description, item.author?.displayName, ...item.categories]
      return search.value !== '' ? prompt.some((str) => str?.toLowerCase().includes(search.value.toLowerCase())) : prompt
    })
    .sort((a, b) => new Date(b?.id) - new Date(a?.id))
})
const computedPromptsAndAdvertises = computed(() => {
  const map = new Map()
  const promptsLength = computedPrompts.value?.length ?? 0
  const advertisesLength = computedAdvertises.value?.length ?? 0

  let i = 0,
    j = 0

  while (i < promptsLength && j < advertisesLength) {
    if (Math.random() > 0.5) {
      if (!map.has(computedPrompts.value[i].id)) {
        map.set(computedPrompts.value[i].id, computedPrompts.value[i])
      }
      i++
    } else {
      if (!map.has(computedAdvertises.value[j].id)) {
        map.set(computedAdvertises.value[j].id, computedAdvertises.value[j])
      }
      j++
    }
  }

  while (i < promptsLength) {
    if (!map.has(computedPrompts.value[i].id)) {
      map.set(computedPrompts.value[i].id, computedPrompts.value[i])
    }
    i++
  }

  while (j < advertisesLength) {
    if (!map.has(computedAdvertises.value[j].id)) {
      map.set(computedAdvertises.value[j].id, computedAdvertises.value[j])
    }
    j++
  }

  return Array.from(map.values())
})

const computedEntries = computed(() => {
  return entryStore.getEntries?.filter((item) =>
    [item.title, item.description, item.author?.displayName].some((str) => str?.toLowerCase().includes(search.value.toLowerCase()))
  )
})
const initIntersectionObserver = () => {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  }
  const observerInstance = new IntersectionObserver(onIntersect, options)
  observerInstance.observe(observer.value)
  const scrollTopIntersectionObserver = new IntersectionObserver(onScrollTopIntersect, options)
  scrollTopIntersectionObserver.observe(scrollTopObserver.value)
}

function onIntersect(entries) {
  const [entry] = entries
  if (entry.isIntersecting) {
    if (promptStore.hasMore) {
      promptStore.fetchPrompts(true)
    }
  }
}
async function onScrollTopIntersect(entries) {
  const [entry] = entries
  if (entry.isIntersecting) {
    loader.value = true
    promptStore.fetchLatestPrompt().finally(() => (loader.value = false))
  }
}
function computeFetchPromptCount(height, width) {
  const basePromptCount = 3

  const heightFactor = height / 400
  const widthFactor = width / 700

  const computedCount = Math.round(basePromptCount + heightFactor * widthFactor)

  return computedCount
}

onMounted(() => {
  observer.value.focus()
  initIntersectionObserver()

  const height = pageRef.value.$el.clientHeight
  const width = pageRef.value.$el.clientWidth
  const promptFetchCount = computeFetchPromptCount(height, width)

  advertiseStore.getActiveAdvertise().catch((error) => errorStore.throwError(error))
  promptStore.fetchPrompts(true, promptFetchCount).catch((error) => errorStore.throwError(error))
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

.search-page-container {
  max-width: 100%;
}

.card-items-wrapper {
  display: grid;
  justify-items: center;
  row-gap: 16px;
  column-gap: 16px;
  margin: 10px 0;
  grid-template-columns: repeat(auto-fill, minmax(619px, 1fr));

  @media (max-width: 1440px) {
    grid-template-columns: repeat(auto-fill, minmax(590px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(470px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }

  @media (max-width: 425px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
