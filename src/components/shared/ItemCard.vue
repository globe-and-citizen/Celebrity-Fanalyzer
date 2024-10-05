<template>
  <article class="relative-position row" :class="{ 'q-pa-md article-card-item': !item.isAdd, 'full-width': item.isAdd }">
    <CampaignCard v-if="item.isAdd" :advertise="item" />
    <div v-if="!item.isAdd" class="col-8 flex column" data-test="prompt-card">
      <div v-if="item?.isWinner || item?.hasWinner" class="winner-badge">
        <img alt="favicon" height="40px" src="/favicon-128x128.png" />
      </div>
      <router-link v-if="item.author" class="flex items-center link" :to="`/fan/${item.author.username || item.author.uid}`">
        <q-avatar size="2rem">
          <q-img v-if="item.author.photoURL" :src="item.author.photoURL" />
          <q-img v-else src="/icons/user_raiting_premium_member.svg" :ratio="1" width="28px" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ item.author.displayName?.length > 20 ? item.author.displayName.substring(0, 20) + '...' : item.author.displayName }}
        </p>
      </router-link>
      <router-link class="link" :to="link" data-test="item-link">
        <h2 class="q-mb-none text-body1 text-bold">
          {{ item.title?.length > 40 ? item.title.substring(0, 40) + '...' : item.title }}
        </h2>

        <p v-if="item.description" class="q-my-none text-body2 text-secondary">
          {{ item?.date ? formatMonthYear(item?.date) : dayMonthYear(item.created) }} &nbsp;•&nbsp;
          {{ giveReadingTime(item.description) }} min read
        </p>
        <div v-if="item.categories">
          <q-badge v-for="(item, i) of item.categories" class="q-mx-xs" :key="i" rounded>{{ item }}</q-badge>
        </div>
      </router-link>
    </div>
    <router-link v-if="!item.isAdd" :to="link" class="col-4 text-primary">
      <q-img
        rel="preload"
        loading="eager"
        fetchpriority="high"
        :ratio="1"
        :src="item.image"
        style="border-radius: 24px"
        @click="goToUrl()"
      />
    </router-link>
    <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
  </article>
</template>

<script setup>
import CampaignCard from '../Advertiser/CampaignCard.vue'
import { dayMonthYear, formatMonthYear } from 'src/utils/date'
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

<style scoped lang="scss">
.link {
  text-decoration: none;
  color: black;
}
.winner-badge {
  position: absolute;
  top: 7%;
  left: 90%;
  z-index: 3;
}

.article-card-item {
  min-width: 619px;
  width: 100%;
  border: 1px solid #e54757;
  border-radius: 24px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);

  @media (max-width: 1440px) {
    min-width: 590px;
  }

  @media (min-width: 1024px) {
    min-width: 470px;
  }

  @media (max-width: 768px) {
    min-width: 361px;
  }

  @media (max-width: 425px) {
    min-width: 280px;
  }
  @media screen and (max-width: 1473px) and (min-width: 1243px) {
    .winner-badge {
      left: 92%;
    }
  }
  @media screen and (max-width: 1020px) and (min-width: 800px) {
    .winner-badge {
      left: 93%;
    }
  }
  @media screen and (max-width: 600px) {
    .winner-badge {
      left: 88%;
    }
  }
}
</style>
