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
      <article
        v-for="prompt in prompts"
        class="q-pt-md relative-position row"
        :key="prompt?.id"
        v-ripple:primary
        v-show="prompt.categories.includes(category)"
        @click="goToPrompt(prompt.slug)"
      >
        <div class="col-8">
          <div class="flex items-center">
            <q-avatar size="2rem">
              <q-img :src="prompt.author.photoURL" />
            </q-avatar>
            <p class="q-mb-none q-ml-sm text-body1">
              {{ prompt.author.displayName.length > 20 ? prompt.author.displayName.substring(0, 20) + '...' : prompt.author.displayName }}
            </p>
          </div>
          <h2 class="q-mb-none text-body1 text-bold">
            {{ prompt.title.length > 40 ? prompt.title.substring(0, 40) + '...' : prompt.title }}
          </h2>
          <p class="q-my-none text-body2 text-secondary">
            {{ prompt.created }}
            {{ shortMonthDay(prompt.created) }}
            &nbsp;•&nbsp; 9 min read
          </p>
          <div v-if="category === 'Trending'">
            <q-badge v-for="(item, i) of prompt.categories" class="q-mx-xs" :key="i" rounded>{{ item }}</q-badge>
          </div>
        </div>
        <q-img class="col-4" :ratio="1" :src="prompt.image" spinner-color="primary" spinner-size="3rem" style="border-radius: 24px" />
        <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
        <q-separator class="full-width q-mt-md" />
      </article>
    </section>
  </q-page>
</template>

<script setup>
import ArticleSkeleton from 'src/components/ArticleSkeleton.vue'
import { usePromptStore } from 'src/stores'
import { shortMonthDay } from 'src/utils/date'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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
  console.log(shortMonthDay())
  await promptStore.fetchPrompts()
  prompts.value = promptStore.getPrompts
})

function goToPrompt(slug) {
  router.push(`/prompt/${slug}`)
}
</script>
