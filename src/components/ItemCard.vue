<template>
  <article class="q-pt-md relative-position row" :key="item?.id" v-ripple:primary @click="goToUrl()">
    <div class="col-8">
      <div class="flex items-center">
        <q-avatar size="2rem">
          <q-img :src="item.author.photoURL" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ item.author.displayName.length > 20 ? item.author.displayName.substring(0, 20) + '...' : item.author.displayName
          }} </p>
      </div>
      <h2 class="q-mb-none text-body1 text-bold">
        {{ item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title }} </h2>
      <p class="q-my-none text-body2 text-secondary">
        {{
          new Date(item.created.seconds * 1000 + item.created.nanoseconds / 1000000).toLocaleDateString('en-US', {
            month: 'short',
            day:   'numeric'
          })
        }} &nbsp;•&nbsp; 9 min read </p>
      <div>
        <q-badge v-for="(item, i) of item.categories" class="q-mx-xs" :key="i" rounded>{{ item }}</q-badge>
      </div>
    </div>
    <q-img class="col-4" :ratio="1" :src="item.image" spinner-color="primary" spinner-size="3rem" style="border-radius: 24px" />
    <!-- TODO: Add 'Selected for you' and two more buttons according to mockup -->
    <q-separator class="full-width q-mt-md" />
  </article>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter()
const props = defineProps({
  item: {},
  link: String
})

function goToUrl() {
  router.push(this.link)
}
</script>
<style scoped></style>
