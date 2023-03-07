<template>
  <TheHeader isSearch title="Search Archive" v-model="search" />
  <q-page class="q-pa-md">
    <q-scroll-area :thumb-style="{ display: 'none' }" style="height: 3.8rem">
      <q-btn-toggle
        v-model="category"
        class="q-my-sm"
        color="white"
        no-caps
        no-wrap
        :options="categories"
        rounded
        text-color="secondary"
        unelevated
      />
    </q-scroll-area>
    <q-separator class="q-mb-none q-mt-xs" />
    <section v-if="!promptStore.getPrompts.length && promptStore.isLoading">
      <ArticleSkeleton />
      <ArticleSkeleton />
      <ArticleSkeleton />
      <ArticleSkeleton />
    </section>
    <q-tab-panels animated swipeable v-model="category">
      <q-tab-panel v-for="(categ, i) in categories" :key="i" :name="categ.value">
        <TransitionGroup name="prompt" tag="div">
          <ItemCard
            v-for="prompt in computedPrompts"
            :item="prompt"
            :key="prompt?.id"
            :link="prompt?.slug"
            v-show="prompt?.categories.includes(categ.value) || category === 'All'"
          />
        </TransitionGroup>
      </q-tab-panel>
    </q-tab-panels>
    <TransitionGroup tag="div">
      <TheEntries v-if="search && computedEntries.length > 0" :entries="computedEntries" />
    </TransitionGroup>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import ItemCard from 'src/components/ItemCard.vue'
import TheEntries from 'src/components/TheEntries.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useErrorStore, usePromptStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'

const errorStore = useErrorStore()
const promptStore = usePromptStore()

const entries = ref([])
const categories = ref([])
const category = ref('All')
const prompts = ref([])
const search = ref('')

onMounted(async () => {
  if (!promptStore.getPrompts.length) {
    await promptStore.fetchPromptsAndEntries().catch((error) => errorStore.throwError(error))
  }

  const categoriesArr = promptStore.getPrompts.flatMap((prompt) => prompt.categories)
  categories.value = [...new Set(categoriesArr)].map((category) => ({ label: category, value: category }))
  categories.value.unshift({ label: 'All', value: 'All' })

  prompts.value = promptStore.getPrompts
  entries.value = prompts.value.flatMap((prompt) => prompt.entries)
})

promptStore.$subscribe((_mutation, state) => {
  prompts.value = state._prompts
})

const computedPrompts = computed(() => {
  return prompts.value.filter(
    (item) =>
      item.title.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
      item.description.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
      item.author.displayName.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
      item.categories.some((category) => category.toLowerCase().includes(search.value.toLocaleLowerCase()))
  )
})
const computedEntries = computed(() => {
  return entries.value.filter((item) => item?.title.toLowerCase().includes(search.value.toLocaleLowerCase()))
})
</script>

<style>
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
