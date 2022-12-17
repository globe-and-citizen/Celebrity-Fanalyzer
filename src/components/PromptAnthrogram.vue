<template>
  <div>
    <div class="col-8" v-if="prompt">
      <div class="flex items-center">
        <q-avatar size="2rem">
          <q-img :src="prompt.author.photoURL" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ prompt.author.displayName?.length > 20 ? prompt.author.displayName.substring(0, 20) + '...' : prompt.author.displayName }}
        </p>
      </div>
      <h2 class="q-mb-none text-body1 text-bold">
        {{ prompt.title?.length > 40 ? prompt.title.substring(0, 40) + '...' : prompt.title }}
      </h2>
    </div>
    <p class="q-pt-md text-center">Likes & Dislikes</p>
    <LikeDislikeBarChart :likes="prompt.info.likes.length" :dislikes="prompt.info.dislikes.length" class="q-mt-md" />
  </div>
</template>

<script setup>
import { useFetch } from '@vueuse/core'
import sha1 from 'js-sha1'
import LikeDislikeBarChart from 'src/components/LikeDislikeBarChart.vue'

const props = defineProps({
  prompt: {}
})
const date = Date.now().toString().slice(0, 10)
const str = `?vn=3&s=summary&f=json&pi=2292634&t=${date}&u=demo_userstatcounter`
const sha = sha1(str)
let url = `https://api.statcounter.com/stats/?vn=3&s=summary&f=json&pi=2292634&t=${date}&u=demo_user&sha1=${sha}`

const { isFetching, error, data } = useFetch(url, { mode: 'no-cors' }).get().text()
</script>
