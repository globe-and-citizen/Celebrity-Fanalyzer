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
            <ItemCard
              v-for="prompt in computedPrompts"
              data-test="prompt-card"
              :item="prompt"
              :key="prompt?.id"
              :link="prompt?.slug"
              v-show="prompt?.categories.includes(categ.value) || category === 'All'"
            />
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
import { useEntryStore, useErrorStore, usePromptStore } from 'src/stores'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()

const category = ref('All')
const router = useRouter()
const search = ref('')

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

const computedPrompts = computed(() => {
  return promptStore.getPrompts?.filter((item) =>
    [item.title, item.description, item.author?.displayName, ...item.categories].some((str) =>
      str?.toLowerCase().includes(search.value.toLowerCase())
    )
  )
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
