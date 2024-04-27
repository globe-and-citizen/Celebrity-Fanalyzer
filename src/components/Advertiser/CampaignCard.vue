<template>
  <article ref="articleRef" id="test" class="blog-card q-my-md" @click="onClick">
    <img class="post-image" :src="(advertise.type === 'Text'&& !advertise.contentUrl ) ? 'https://cdn.quasar.dev/img/parallax2.jpg' : advertise.contentURL" />
    <div class="article-details">
      <h4 class="post-category">Advertise</h4>
      <h3 class="post-title">{{ advertise.title?.length > 30 ? advertise.title.substring(0, 30) + '...' : advertise.title }}</h3>
      <p class="post-description" >
        {{ advertise.content?.length > 80 ? advertise.content.substring(0, 80) + '...' : advertise.content }}
      </p>
      <span class="cursor-pointer text-black link" @click="goToUrl">Learn more</span>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {  useUserStore, useVisitorStore, useErrorStore, useClicksStore, useImpressionsStore } from 'src/stores'
import { useRouter } from 'vue-router'

const router = useRouter()
const articleRef = ref(null)
const userStore = useUserStore()
const visitorStore = useVisitorStore()
const errorStore = useErrorStore()
const clicksStore = useClicksStore()
const impressionsStore = useImpressionsStore()
// const lastImpression=ref(null)

const props = defineProps({
  advertise: {
    type: Object,
    default: () => {}
  }
})

function onClick() {
  clicksStore.addClick('advertises', props.advertise.id).catch((error) => console.log(error))
}

function goToUrl() {
  router.push('/campaign/' + props.advertise.id)
}

onMounted(async () => {
  articleRef.value.focus()
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const intersecting = entry.isIntersecting
      if (intersecting) {
        impressionsStore.addImpression('advertises', props.advertise.id).catch((error) => console.log(error))
      }
    })
  })
  observer.observe(articleRef.value)

  await userStore.fetchUserIp()

  visitorStore.readVisitors('advertises', props.advertise.id).catch((error) => errorStore.throwError(error))

  await visitorStore.addVisitor('advertises', props.advertise.id).catch((error) => errorStore.throwError(error))
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=Roboto:400,700');

$bg: #eedfcc;
$text: #777;
$black: #121212;
$white: #fff;
$red: #e04f62;
$border: #ebebeb;
$shadow: rgba(0, 0, 0, 0.2);

#container {
  width: 30rem;
  height: 13.625rem;
}
.link {
  text-decoration: underline;
}
.blog-card {
  display: flex;
  flex-direction: row;
  background: $white;
  filter: drop-shadow(1px 2px 4px $shadow);
  border-radius: 24px;
  overflow: hidden;
}

.card-link {
  position: relative;
  display: block;
  color: inherit;
  text-decoration: none;
  margin-top: 1rem;
}

.post-image {
  display: block;
  width: 100%;
  object-fit: cover;
}

.article-details {
  padding: 1rem;
}

.post-category {
  display: inline-block;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.0625rem;
  margin: 0 0 0.75rem 0;
  padding: 0 0 0.25rem 0;
  border-bottom: 0.125rem solid $border;
}

.post-title {
  font-size: 1.125rem;
  line-height: 1.4;
  color: $black;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

@media (max-width: 40rem) {
  #container {
    width: 18rem;
    height: 27.25rem;
  }

  .blog-card {
    flex-wrap: wrap;
  }
}

@supports (display: grid) {
  body {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 0.625rem;
    grid-template-areas: '. main main .' '. main main .';
  }

  #container {
    grid-area: main;
    align-self: center;
    justify-self: center;
  }

  .post-image {
    height: 100%;
  }

  .blog-card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-rows: 1fr;
  }

  @media (max-width: 40rem) {
    .blog-card {
      grid-template-columns: auto;
      grid-template-rows: 12rem 1fr;
    }
  }
}
</style>
