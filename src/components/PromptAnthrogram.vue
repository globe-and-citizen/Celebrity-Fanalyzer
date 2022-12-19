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
    <StatsBarChart :week1="['162', '131', '7', '124']" :week2="['171', '117', '10', '107']"></StatsBarChart>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import sha1 from 'js-sha1'
import LikeDislikeBarChart from 'src/components/LikeDislikeBarChart.vue'
import StatsBarChart from 'src/components/StatsBarChart.vue'

const props = defineProps({
  prompt: {
    type:     Object,
    required: true
  }
})
const date = Date.now().toString().slice(0, 10)
const str = `?vn=3&s=summary&f=json&pi=2292634&t=${date}&u=demo_userstatcounter`
const sha = sha1(str)
let refUrl = ref(`https://api.statcounter.com/stats/?vn=3&s=summary&f=json&pi=2292634&t=${date}&u=demo_user&sha1=${sha}`)
const url = `https://api.statcounter.com/stats/?vn=3&s=summary&f=json&pi=2292634&t=${date}&u=demo_user&sha1=${sha}`

fetch(url, { mode: 'no-cors', redirect: 'follow' })
  .then((data) => console.log('log of response', data))
  .catch((err) => {
    console.log('Fetch Error :-S', err)
  })
</script>
