<template>
  <div>
    <div class="col-8" v-if="entry">
      <div class="flex items-center">
        <q-avatar size="2rem">
          <q-img :src="entry.author.photoURL" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ entry.author.displayName?.length > 20 ? entry.author.displayName.substring(0, 20) + '...' : entry.author.displayName }}
        </p>
      </div>
      <h2 class="q-mb-none text-body1 text-bold">
        {{ entry.title?.length > 40 ? entry.title.substring(0, 40) + '...' : entry.title }}
      </h2>
    </div>
    <p class="q-pt-md text-center">Likes & Dislikes</p>
    <LikeDislikeBarChart :likes="entry.info.likes.length" :dislikes="entry.info.dislikes.length" class="q-mt-md"/>
  </div>
</template>

<script setup>
import LikeDislikeBarChart from 'src/components/LikeDislikeBarChart.vue'
const props = defineProps({
  entry: {}
})
</script>
