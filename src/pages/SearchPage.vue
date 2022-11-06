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
    <q-inner-loading color="primary" :showing="isLoading" />
    <section v-if="isLoading">
      <ArticleSkeleton/>
      <ArticleSkeleton/>
      <ArticleSkeleton/>
    </section>
    <section v-if="postStore.getPosts.filter((post) => post.categories.includes(category)).length">
      <article
        v-for="post in posts"
        class="q-pt-md relative-position row"
        :key="post?.id"
        v-ripple:primary
        v-show="post.categories.includes(category)"
        @click="goToPost(post.slug)"
      >
        <div class="col-8">
          <div class="flex items-center">
            <q-avatar size="2rem">
              <q-img :src="post.author.photoURL" />
            </q-avatar>
            <p class="q-mb-none q-ml-sm text-body1">{{ post.author.displayName }}</p>
          </div>
          <h2 class="q-mb-none text-body1 text-bold">
            {{ post.title.length > 38 ? post.title.substring(0, 38) + ' ... ' : post.title }}
          </h2>
          <p class="q-my-none text-body2 text-secondary">
            {{ post.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }} &nbsp;•&nbsp; 9 min read
          </p>
        </div>
        <q-img class="col-4" :ratio="1" :src="post.image" spinner-color="primary" spinner-size="3rem" style="border-radius: 24px" />
        <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
        <q-separator class="full-width q-mt-md" />
      </article>
    </section>
    <h3 v-else class="text-center text-h5">No Data</h3>
  </q-page>
</template>

<script setup>
import { usePostStore } from 'src/stores/posts'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ArticleSkeleton from "src/components/ArticleSkeleton.vue"

const router = useRouter()
const postStore = usePostStore()

const search = ref('')
const category = ref('Trending')
const isLoading = ref(false)
const posts = ref([])

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
  isLoading.value = true
  await postStore.fetchPosts()
  posts.value = postStore.getPosts
  isLoading.value = false
})

function goToPost(slug) {
  router.push(`/post/${slug}`)
}
</script>
