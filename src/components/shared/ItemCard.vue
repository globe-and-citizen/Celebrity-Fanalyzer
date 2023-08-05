<template>
  <article class="q-pt-md relative-position row" v-ripple:primary>
    <div class="col-8">
      <div
        v-if="item.author"
        class="cursor-pointer flex items-center"
        @click="router.push(`/fan/${item.author.username || item.author.uid}`)"
      >
        <q-avatar size="2rem">
          <q-img v-if="item.author.photoURL" :src="item.author.photoURL" />
          <q-img v-else src="/icons/user_raiting_premium_member.svg" :ratio="1" width="28px" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ item.author.displayName?.length > 20 ? item.author.displayName.substring(0, 20) + '...' : item.author.displayName }}
        </p>
      </div>
      <div class="cursor-pointer" @click="goToUrl()" data-test="item-link">
        <h2 class="q-mb-none text-body1 text-bold">
          {{ item.title?.length > 40 ? item.title.substring(0, 40) + '...' : item.title }}
        </h2>

        <p v-if="item.description" class="q-my-none text-body2 text-secondary">
          {{ dayMonthYear(item.created) }} &nbsp;•&nbsp; {{ giveReadingTime(item.description) }} min read
        </p>
        <div v-if="item.categories">
          <q-badge v-for="(item, i) of item.categories" class="q-mx-xs" :key="i" rounded>{{ item }}</q-badge>
        </div>
      </div>
    </div>
    <q-img class="col-4 cursor-pointer" :ratio="1" :src="item.image" style="border-radius: 24px" @click="goToUrl()" />
    <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
    <q-separator class="full-width q-mt-md" />
  </article>
</template>

<script setup>
import { dayMonthYear } from 'src/utils/date'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  item: {},
  link: String
})

function giveReadingTime(text, wordsPerMinute = 200) {
  // Calculate the number of words in the text
  const wordCount = text.split(/\s+/).length

  // Calculate the reading time in minutes
  const readingTimeInMinutes = wordCount / wordsPerMinute

  // Round up the reading time to the nearest integer
  return Math.ceil(readingTimeInMinutes)
}

function goToUrl() {
  router.push(props.link)
}
</script>
