<template>
  <TheHeader isSearch :title="`Search In ${year} Archive`" v-model="search" />
  <!-- <q-header class="bg-white" elevated>
    <q-toolbar class="q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Search In {{ year }} Archive</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
    <q-toolbar>
      <q-toolbar-title>
        <q-input class="q-pb-lg q-px-lg" dense label="Search" rounded standout v-model="search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar-title>
    </q-toolbar>
  </q-header> -->

  <q-page class="q-pa-md">
    <section v-if="!prompts.length && promptStore.isLoading">
      <ArticleSkeleton v-for="index in [0, 1, 2, 3]" :key="index" />
    </section>
    <h6 v-if="!prompts.length && !promptStore.isLoading" class="text-center text-uppercase">No prompts were published in {{ year }}</h6>
    <TransitionGroup name="prompt" tag="div">
      <ItemCard v-for="prompt in computedPrompt" :item="prompt" :key="prompt?.id" :link="`${prompt.year}/${prompt.month}`" />
    </TransitionGroup>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import ItemCard from 'src/components/ItemCard.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useErrorStore, usePromptStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const errorStore = useErrorStore()
const promptStore = usePromptStore()
const router = useRouter()

const year = ref('')
const search = ref('')
const prompts = ref([])
year.value = router.currentRoute.value.params.year

onMounted(async () => {
  await promptStore
    .fetchPromptsByYear(year.value)
    .then((data) => (prompts.value = data))
    .catch((error) => errorStore.throwError(error))

  for (const prompt of prompts.value) {
    prompt.year = prompt.date.split('-')[0]
    prompt.month = prompt.date.split('-')[1]
  }
})

const computedPrompt = computed(() => {
  return prompts.value.filter((item) =>
    item.title.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
    item.description.toLowerCase().includes(search.value.toLocaleLowerCase()) ||
    item.categories.some(category => category.toLowerCase().includes(search.value.toLocaleLowerCase())))
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
