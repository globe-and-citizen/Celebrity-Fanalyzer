<template>
  <TheHeader v-if="user?.uid" feedbackButton :title="user.role + ' Profile'" />
  <q-page-container>
    <q-page v-if="user?.uid">
      <q-card flat>
        <q-card-section class="flex items-center">
          <div class="flex items-center q-gutter-x-md">
            <q-avatar size="7rem">
              <q-img :src="user.photoURL" />
            </q-avatar>
            <h5 class="q-my-none">{{ user.displayName }}</h5>
          </div>
          <div class="col text-right">
            <span v-for="(socialNetwork, index) in socialNetworks" :key="index">
              <q-btn
                v-if="user[socialNetwork.name]"
                flat
                :href="socialNetwork.link + user[socialNetwork.name]"
                :icon="`img:/icons/${socialNetwork.name}.svg`"
                round
                target="_blank"
              />
            </span>
          </div>
        </q-card-section>
        <q-card-section>
          <p class="q-mb-none text-body1" style="white-space: pre-line">{{ user.bio }}</p>
        </q-card-section>
        <q-separator spaced inset />
        <q-card-section class="justify-center row">
          <div v-for="post in computedPosts" class="col-sm-4 col-xs-6" data-test="posts-section" :key="post.id" @click="goToUrl(post.slug)">
            <div class="cursor-pointer q-mx-xs">
              <q-img class="rounded-borders" height="12rem" :ratio="1" :src="post.image" />
              <p class="q-mb-none text-caption">{{ dayMonthYear(post.created) }} &bullet; {{ post.title }}</p>
              <span v-html="post.description.substring(0, 30)"></span>
              <span v-if="post.description.length > 30">...</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-page>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { dayMonthYear } from 'src/utils/date'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()

const computedPosts = ref()
const user = ref({})

const socialNetworks = [
  { name: 'facebook', link: 'https://facebook.com/' },
  { name: 'instagram', link: 'https://instagram.com/' },
  { name: 'linkedin', link: 'https://linkedin.com/in/' },
  { name: 'telegram', link: 'https://web.telegram.org/a/#' },
  { name: 'twitter', link: 'https://twitter.com/' }
]

onMounted(async () => {
  await userStore.getUserByUidOrUsername(router.currentRoute.value.params.username).then((res) => (user.value = res))

  if (!user.value) {
    router.push('/')
    return
  }

  if (!promptStore.getPrompts.length) {
    await promptStore.fetchPrompts().catch((error) => errorStore.throwError(error))
  }
  const filteredPrompts = promptStore.getPrompts.filter((prompt) => prompt.author?.uid === user.value.uid)

  if (!entryStore.getEntries.length) {
    await entryStore.fetchEntries().catch((error) => errorStore.throwError(error))
  }
  const filteredEntries = entryStore.getEntries.filter((entry) => entry.author?.uid === user.value.uid)

  computedPosts.value = [...filteredPrompts, ...filteredEntries].sort((a, b) => b.date - a.date)
})

function goToUrl(link) {
  const normalizedLink = link.startsWith('/') ? link : `/${link}`
  router.push(normalizedLink)
}
</script>
