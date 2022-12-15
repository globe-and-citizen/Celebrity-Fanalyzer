<template>
  <article class="q-pt-md relative-position row cursor-pointer" v-ripple:primary @click="goToUrl()">
    <div class="col-8">
      <h2 class="q-mb-none text-body1 text-bold">
        {{ item.title?.length > 40 ? item.title.substring(0, 40) + '...' : item.title }}
      </h2>

      <p class="q-my-none text-body text-secondary">
        {{ shortMonthDay(item.created) }} &nbsp;•&nbsp; {{ giveReadingTime(item.description) }}min
      </p>
      <div v-if="item.categories">
        <q-badge v-for="(item, i) of item.categories" class="q-mx-xs" :key="i" rounded>{{ item }}</q-badge>
      </div>
    </div>
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
