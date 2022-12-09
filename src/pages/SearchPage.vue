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
        <q-input class="q-pb-lg q-px-lg" dense label="Search" rounded standout v-model="search">
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
    <section v-if="!prompts.length && promptStore.isLoading">
      <ArticleSkeleton />
      <ArticleSkeleton />
      <ArticleSkeleton />
    </section>
    <section v-if="promptStore.getPrompts.filter((prompt) => prompt.categories.includes(category)).length">
      <ItemCard
        v-for="prompt in prompts"
        :key="prompt?.id"
        :item="prompt"
        v-show="prompt.categories.includes(category) || category === 'All'"
        :link="`/${prompt.id}`"
      ></ItemCard>
    </section>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import ItemCard from 'components/ItemCard.vue'
import { usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const promptStore = usePromptStore()

const search = ref('')
const category = ref('Trending')
const prompts = ref(promptStore.getPrompts)

const categories = ref([
  { label: 'Trending', value: 'Trending' },
  { label: 'Lifestyle', value: 'Lifestyle' },
  { label: 'Culture', value: 'Culture' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Politics', value: 'Politics' },
  { label: 'Business', value: 'Business' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Science', value: 'Science' },
  { label: 'Health', value: 'Health' },
  { label: 'Education', value: 'Education' }
])

onMounted(async () => {
  await promptStore.fetchPrompts()
  prompts.value = promptStore.getPrompts
})
</script>
