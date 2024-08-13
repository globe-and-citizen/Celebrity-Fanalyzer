<template>
  <article
    ref="articleRef"
    id="test"
    class="max-width full-height full-width search-page"
    :class="[{ 'blog-card': advertise.type !== 'Text', 'text-blog-card': advertise.type === 'Text' }]"
    @click="onClick"
  >
    <q-img
      v-if="advertise.type === 'Banner'"
      class="post-image"
      :src="advertise.type === 'Text' && !advertise.contentURl ? 'https://cdn.quasar.dev/img/parallax2.jpg' : advertise.contentURL"
    />
    <div class="article-details">
      <h4 class="post-category">Advertise</h4>
      <h3 class="post-title">{{ advertise.title?.length > 30 ? advertise.title.substring(0, 30) + '...' : advertise.title }}</h3>
      <p v-html="advertise.content" class="multiline_ellipsis full-width">

      </p>
      <span class="cursor-pointer text-black link" @click="goToUrl">Learn more</span>
      <a
        v-if="advertise?.productLink"
        class="cursor-pointer text-black link"
        :href="getFormattedLink(advertise.productLink)"
        target="_blank"
      >
        Explore now
      </a>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useErrorStore, useClicksStore, useImpressionsStore } from 'src/stores'
import { useRouter } from 'vue-router'
import { getFormattedLink } from 'src/utils/getFormattedLink'

const router = useRouter()
const articleRef = ref(null)
const errorStore = useErrorStore()
const clicksStore = useClicksStore()
const impressionsStore = useImpressionsStore()

const props = defineProps({
  advertise: {
    type: Object,
    default: () => {}
  }
})

function onClick() {
  clicksStore.addClick('advertises', props.advertise.id).catch((error) => errorStore.throwError(error))
}

function goToUrl() {
  router.push('/campaign/' + props.advertise.id)
}

onMounted(async () => {
  articleRef.value.focus()
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const intersecting = entry.isIntersecting
      if (intersecting && props.advertise?.status==='Active') {
        impressionsStore.addImpression('advertises', props.advertise?.id).catch((error) => errorStore.throwError(error))
      }
    })
  })
  observer.observe(articleRef.value)
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
  margin-right: 25px;
}
.blog-card {
  display: flex;
  flex-direction: row;
  background: $white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 0 5px $shadow;
}
.text-blog-card {
  display: flex;
  flex-direction: row;
  background: $white;
  border-radius: 24px;
  overflow: hidden;
  min-width: 400px;
  box-shadow: 0 0 5px $shadow;
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
.max-width {
  min-width: 619px;
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
  @media (max-width: 500px) {
    margin: 0 3px !important;
  }
}

@media (max-width: 40rem) {
  #container {
    width: 18rem;
    height: 27.25rem;
  }

  .blog-card {
    flex-wrap: wrap;
  }
  .text-blog-card {
    min-width: auto;
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
}
.multiline_ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

</style>
