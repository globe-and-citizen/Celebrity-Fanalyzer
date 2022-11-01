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
        rounded
        unelevated
        text-color="secondary"
        :options="categories"
      />
    </q-scroll-area>
    <q-separator class="q-mb-none q-mt-xs" />
    <section v-if="isLoading" class="q-my-xl text-center">
      <q-spinner color="primary" size="3em" />
    </section>
    <section v-else>
      <div v-for="post in postStore.getPosts" :key="post?.id">
        <article
          v-if="post.categories.includes(categories.find((c) => c.value === category).value)"
          class="q-pt-md relative-position row"
          v-ripple:primary
          @click="goToPost(post.slug)"
        >
          <div class="col-8">
            <div class="flex items-center">
              <q-avatar size="2rem" color="secondary" text-color="white" icon="person" />
              <p class="q-mb-none q-ml-sm text-body1">Arnon Rodrigues</p>
            </div>
            <h2 class="q-mb-none text-body1 text-bold">
              {{ post.title.length > 38 ? post.title.substring(0, 38) + ' ... ' : post.title }}
            </h2>
            <p class="q-my-none text-body2 text-secondary">
              {{ post.created.toDate().toLocaleDateString('en-us', { month: 'short', day: 'numeric' }) }} &nbsp;•&nbsp; 9 min read
            </p>
          </div>
          <q-img
            class="col-4"
            :ratio="1"
            :src="`data:image/jpg;base64,${post.image}`"
            spinner-color="primary"
            spinner-size="3rem"
            style="border-radius: 24px"
          />
          <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
          <q-separator class="full-width q-mt-md" />
        </article>
        <h3 v-else class="text-center text-h5">No Data</h3>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { usePostStore } from 'src/stores/posts'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const search = ref('')
const category = ref('trending')
const isLoading = ref(false)
const postStore = usePostStore()
const router = useRouter()

const categories = ref([
  { label: 'Trending', value: 'trending' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Culture', value: 'culture' },
  { label: 'Sports', value: 'sports' },
  { label: 'Politics', value: 'politics' },
  { label: 'Business', value: 'business' },
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' }
])

onMounted(async () => {
  isLoading.value = true
  await postStore.fetchPosts()
  isLoading.value = false
})

function goToPost(slug) {
  router.push(`/post/${slug}`)
}
</script>
