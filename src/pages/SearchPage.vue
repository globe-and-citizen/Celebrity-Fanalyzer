<template>
  <TheHeader
    feedbackButton
    notificationButton
    searchInput
    :title="`${router.currentRoute.value.params.year ?? ''} Search Archive`"
    v-model="search"
  />
  <q-page-container class="search-page-container">
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
      <!--      <section v-if="!promptStore.getPrompts && promptStore.isLoading">-->
      <!--        <ArticleSkeleton />-->
      <!--        <ArticleSkeleton />-->
      <!--        <ArticleSkeleton />-->
      <!--        <ArticleSkeleton />-->
      <!--      </section>-->
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
  </q-page-container>
</template>

<script setup>
import ArticleSkeleton from 'src/components/shared/ArticleSkeleton.vue'
import ItemCard from 'src/components/shared/ItemCard.vue'
import TheEntries from 'src/components/shared/TheEntries.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useAdvertiseStore, useEntryStore, useErrorStore, usePromptStore } from 'src/stores'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const advertiseStore = useAdvertiseStore()

const category = ref('All')
const router = useRouter()
const search = ref('')

advertiseStore.getActiveAdvertise().catch((error) => errorStore.throwError(error))
promptStore.fetchPrompts().catch((error) => errorStore.throwError(error))

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
  return promptStore.getPrompts?.filter((item) => {
    const prompt = [item.title, item.description, item.author?.displayName, ...item.categories]
    return search.value !== '' ? prompt.some((str) => str?.toLowerCase().includes(search.value.toLowerCase())) : prompt
  })
})
const computedPromptsAndAdvertises = computed(() => {
  let i = 0,
    j = 0
  let arr = []
  const promptsLength = computedPrompts.value?.length ?? 0
  const advertisesLength = computedAdvertises.value?.length ?? 0
  while (i < promptsLength && j < advertisesLength) {
    if (Math.random() > 0.5) {
      arr.push(computedPrompts.value[i])
      i++
    } else {
      arr.push(computedAdvertises.value[j])
      j++
    }
  }
  if (i < promptsLength) {
    arr = [...arr, ...computedPrompts.value.slice(i)]
  }
  if (j < advertisesLength) {
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
