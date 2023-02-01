<template>
  <q-header class="bg-white" elevated>
    <q-toolbar class="q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Search Archive</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
    <q-toolbar>
      <q-toolbar-title>
        <q-input class="q-pb-lg q-px-lg text-black" dense label="Search" rounded standout="bg-secondary text-white" v-model="search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>

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
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import ItemCard from 'src/components/ItemCard.vue'
import { usePromptStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'

const promptStore = usePromptStore()

const search = ref('')
const category = ref('All')
const categories = ref([])

onMounted(async () => {
  if (!promptStore.getPrompts.length) {
    await promptStore.fetchPromptsAndEntries()
  }

  const categoriesArr = promptStore.getPrompts.flatMap((prompt) => prompt.categories)
  categories.value = [...new Set(categoriesArr)].map((category) => ({
    label: category,
    value: category
  }))
  categories.value.unshift({ label: 'All', value: 'All' })
})

const computedPrompt = computed(() => {
  return promptStore.getPrompts.filter((item) => item.title.toLowerCase().includes(search.value.toLocaleLowerCase()))
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
