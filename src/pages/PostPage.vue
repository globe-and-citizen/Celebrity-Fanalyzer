<template>
  <section v-if="isLoading" class="q-my-xl text-center">
    <q-spinner color="primary" size="3em" />
  </section>
  <q-page v-else>
    <q-img :ratio="21 / 9" :src="`data:image/jpg;base64,${article.image}`" spinner-color="primary" spinner-size="82px" />
    <section class="q-pa-md">
      <h1 class="q-mt-none text-bold text-h5">{{ article.title }}</h1>
      <p class="text-body1">{{ article.description }}</p>
      <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="article.info?.likes" />
      <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="article.info?.dislikes" />
      <q-btn flat rounded icon="chat_bubble_outline" :label="article.info?.comments" />
      <q-btn flat rounded icon="share" :label="article.info?.shares" />
    </section>
  </q-page>
</template>

<script setup>
import { usePostStore } from 'src/stores/posts'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const article = ref({})
const isLoading = ref(false)
const postStore = usePostStore()
const router = useRouter()

onMounted(async () => {
  if (!postStore.getPosts?.length) {
    isLoading.value = true
    await postStore.fetchPosts()
    isLoading.value = false
  }
  article.value = postStore.getPosts.find((post) => post.slug === router.currentRoute.value.params.id)
  console.log(article.value)
})
</script>
