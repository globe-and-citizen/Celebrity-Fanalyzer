<template>
  <article class="q-pt-md relative-position row" v-ripple:primary @click="goToUrl()">
    <div class="col-8">
      <div class="flex items-center">
        <q-avatar size="2rem">
          <q-img :src="item.author.photoURL" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ item.author.displayName?.length > 20 ? item.author.displayName.substring(0, 20) + '...' : item.author.displayName }}
        </p>
      </div>
      <h2 class="q-mb-none text-body1 text-bold">
        {{ item.title?.length > 40 ? item.title.substring(0, 40) + '...' : item.title }}
      </h2>

      <p class="q-my-none text-body2 text-secondary">
        {{ shortMonthDay(item.created) }} &nbsp;•&nbsp; {{ giveReadingTime(item.description) }}min
      </p>
      <div v-if="item.categories">
        <q-badge v-for="(item, i) of item.categories" class="q-mx-xs" :key="i" rounded>{{ item }}</q-badge>
      </div>
    </div>
    <q-img class="col-4" :ratio="1" :src="item.image" spinner-color="primary" spinner-size="3rem" style="border-radius: 24px" />
    <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
    <q-separator class="full-width q-mt-md" />
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { shortMonthDay } from 'src/utils/date'

const router = useRouter()
const props = defineProps({
  item: {},
  link: String
})

function giveReadingTime(description) {
  let stringArr = description.split(' ')
  let adjustment = 0
  stringArr = stringArr.filter((el) => {
    if (el.indexOf('<') === -1) {
      return el
    }
    adjustment++
  })

  let wordCount = stringArr.length + adjustment
  const averageWordsPerMinute = 238

  return Math.round(wordCount / averageWordsPerMinute)
}
function goToUrl() {
  router.push(props.link)
}
</script>
