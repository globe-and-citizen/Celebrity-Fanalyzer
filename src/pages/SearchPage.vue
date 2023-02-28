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
            v-for="prompt in computedPrompt"
            :item="prompt"
            :key="prompt?.id"
            :link="prompt?.slug"
            v-show="prompt?.categories.includes(categ.value) || category === 'All'"
          />
        </TransitionGroup>
      </q-tab-panel>
    </q-tab-panels>
    <TransitionGroup tag="div">
      <TheEntries v-if="search && computedEntry.length > 0" :entries="computedEntry"/>
    </TransitionGroup>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import ItemCard from 'src/components/ItemCard.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useErrorStore, usePromptStore, useEntryStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'
import TheEntries from 'src/components/TheEntries.vue'

const errorStore = useErrorStore()
const promptStore = usePromptStore()
const entrytStore = useEntryStore()

const search = ref('')
const category = ref('All')
const categories = ref([])
const prompts = ref([])
const entries = ref([])

onMounted(async () => {
  if (!promptStore.getPrompts.length) {
    await promptStore.fetchPromptsAndEntries().catch((error) => errorStore.throwError(error))
  }
  if (!entrytStore.getEntries.length) {
    await entrytStore.fetchEntry().catch((error) => errorStore.throwError(error))
  }

  const categoriesArr = promptStore.getPrompts.flatMap((prompt) => prompt.categories)
  categories.value = [...new Set(categoriesArr)].map((category) => ({
    label: category,
    value: category
  }))
  categories.value.unshift({ label: 'All', value: 'All' })

  prompts.value = promptStore.getPrompts
  entries.value = entrytStore.getEntries
})

promptStore.$subscribe((_mutation, state) => {
  prompts.value = state._prompts
})

const computedPrompt = computed(() => {
  return prompts.value.filter((item) =>
    item.title.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
    item.description.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
    item.author.displayName.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
    item.entries.some(entry => entry.title.toLowerCase().includes(search.value.toLocaleLowerCase())) ||
    item.categories.some(category => category.toLowerCase().includes(search.value.toLocaleLowerCase()))
  )
})
const computedEntry = computed(() => {
  return entries.value.filter((item) =>
    item.title.toLowerCase().includes(search.value.toLocaleLowerCase())
  )
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
