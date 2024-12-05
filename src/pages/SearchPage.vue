<template>
  <TheHeader
    feedbackButton
    notificationButton
    searchInput
    :title="`${router.currentRoute.value.params.year ?? ''} Search Archive`"
    v-model="search"
    @updateSearchDate="updateSearchDate"
  />
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
      <q-tab-panels animated swipeable v-model="category">
        <q-tab-panel v-for="(categ, i) in computedCategories" class="panel" :key="i" :name="categ.value">
          <section class="card-items-wrapper" v-if="isLoading">
            <ArticleSkeleton v-for="n in skeletons" :key="n" />
          </section>
          <TransitionGroup name="prompt" tag="div" class="card-items-wrapper" v-else>
            <ItemCard
              data-test="item-card"
              v-for="prompt in combinedItems"
              :key="prompt?.id"
              v-show="prompt?.categories.includes(categ.value) || category === 'All' || prompt?.isAdd"
              :item="prompt"
              :link="prompt?.slug"
            />
          </TransitionGroup>
        </q-tab-panel>
      </q-tab-panels>
      <TransitionGroup tag="div">
        <div v-if="(searchDate || search) && computedEntries?.length > 0">
          <TheEntries :entries="computedEntries" />
        </div>
      </TransitionGroup>
      <div v-if="hasNextPage" class="row justify-center q-mt-md">
        <q-spinner v-if="isLoading || isFetchingNextPage" color="primary" size="70px" :thickness="5" />
        <q-btn v-else @click="loadMorePrompts" label="Load More" data-test="load-more-btn" color="primary" />
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup>
import ArticleSkeleton from 'src/components/shared/ArticleSkeleton.vue'
import ItemCard from 'src/components/shared/ItemCard.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useAdvertiseStore, useEntryStore, useErrorStore, usePromptStore } from 'src/stores'
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { QueryKeys } from 'src/utils/query-keys'
import { Notify } from 'quasar'

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const advertiseStore = useAdvertiseStore()

const category = ref('All')
const router = useRouter()
const search = ref('')
const searchDate = ref('')
const pageRef = ref(null)
const skeletons = 5
const loadedPrompts = computed(() => {
  return data?.value?.pages.flatMap((page) => page.prompts) || []
})

const computedCategories = computed(() => {
  const allPromptCategories = computedPrompts.value?.flatMap(({ categories }) => categories)
  const uniqueCategories = Array.from(new Set(allPromptCategories), (category) => ({ label: category, value: category }))
  const allCategory = { label: 'All', value: 'All' }
  return [allCategory, ...uniqueCategories]
})

const computedAdvertises = computed(() => {
  return advertiseStore.getActiveAdvertises.filter((ad) => {
    const adDetails = [ad.title, ad.description]
    return search.value ? adDetails.some((str) => str?.toLowerCase().includes(search.value.toLowerCase())) : true
  })
})

const computedPrompts = computed(() => {
  return loadedPrompts.value
    ? loadedPrompts.value
        .filter((item) => {
          const prompt = [item.title, item.description, item.author?.displayName, item.id, ...item.categories]

          const matchesDate = searchDate.value ? searchDate.value.slice(0, 7) === item.id : true
          const matchesSearch = search.value ? prompt.some((str) => str?.toLowerCase().includes(search.value.toLowerCase())) : true
          return matchesDate && matchesSearch
        })
        .sort((a, b) => new Date(b?.id) - new Date(a?.id))
    : []
})

const computedEntries = computed(() => {
  return entryStore.getEntries?.filter((item) =>
    [item.title, item.description, item.author?.displayName].some((str) => str?.toLowerCase().includes(search.value.toLowerCase()))
  )
})

const combinedItems = computed(() => {
  const adsToAdd = computedAdvertises?.value.filter((ad) => !loadedPrompts.value.some((item) => item.id === ad.id))

  const result = []

  computedPrompts.value.forEach((prompt, index) => {
    result.push(prompt)
    if ((index + 1) % 5 === 0 && adsToAdd.length > 0) {
      result.push(adsToAdd.shift())
    }
  })
  result.push(...adsToAdd)
  return result
})

const loadMorePrompts = async () => {
  if (!isFetchingNextPage?.value && hasNextPage.value) {
    try {
      await fetchNextPage()
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: 'Error loading more prompts.'
      })
    }
  }
}
const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: [QueryKeys.ALL_PROMPTS],
  queryFn: ({ pageParam = null }) => promptStore.fetchPromptsInfinite({ pageParam }),
  getNextPageParam: (lastPage) => {
    const lastVisibleId = lastPage.lastVisible?._document?.data.value.mapValue.fields.id.stringValue
    return lastVisibleId || null
  },
  staleTime: 5 * 24 * 60 * 60 * 1000,
  refetchInterval: 5 * 24 * 60 * 60 * 1000,
  keepPreviousData: true
})

const updateSearchDate = (value) => {
  searchDate.value = value
}

watch(search, async (newSearch) => {
  if (newSearch.trim()) {
    await fetchNextPage({ pageParam: null })
  } else if (!newSearch.trim() && !isLoading.value && hasNextPage.value) {
    await fetchNextPage({ pageParam: null })
  }

  if (hasNextPage.value) {
    if (newSearch.trim()) {
      await fetchNextPage({ pageParam: null })
    }
  }
})

watch(searchDate, async (newSearch) => {
  if (newSearch.trim()) {
    await fetchNextPage({ pageParam: null })
  } else if (!newSearch.trim() && !isLoading.value && hasNextPage.value) {
    await fetchNextPage({ pageParam: null })
  }

  if (hasNextPage.value) {
    if (newSearch.trim()) {
      await fetchNextPage({ pageParam: null })
    }
  }
})

onMounted(async () => {
  await promptStore.getTotalPromptsCount()
  try {
    if (!advertiseStore.getActiveAdvertises?.length) {
      await advertiseStore.getActiveAdvertise()
    }
  } catch (error) {
    await errorStore.throwError(error, 'Error fetching prompts and ads')
  }
})

onUnmounted(() => {
  promptStore.listenForNewPrompts()
  advertiseStore.reset()
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
