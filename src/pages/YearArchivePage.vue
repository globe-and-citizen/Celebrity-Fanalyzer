<template>
  <q-header class="bg-white" elevated>
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
  </q-header>

  <q-page class="q-pa-md">
    <section v-if="!prompts.length && promptStore.isLoading">
      <ArticleSkeleton v-for="index in [0, 1, 2, 3]" :key="index" />
    </section>
    <h6 v-if="!prompts.length && !promptStore.isLoading" class="text-center text-uppercase">No prompts were published in {{ year }}</h6>
    <section>
      <ItemCard v-for="prompt in prompts" :item="prompt" :key="prompt?.id" :link="`/prompt/${prompt.id}`" />
    </section>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import ItemCard from 'src/components/ItemCard.vue'
import { usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const promptStore = usePromptStore()
const router = useRouter()

const year = ref('')
const search = ref('')
const prompts = ref([])
year.value = router.currentRoute.value.params.year

onMounted(async () => {
  await promptStore.fetchPromptsByYear(year.value).then((data) => (prompts.value = data))
})
</script>
