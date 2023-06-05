<template>
  <TheHeader v-if="user?.uid" feedbackButton :title="user.role + ' Profile'" />
  <q-page-container>
    <q-page v-if="user?.uid">
      <q-card>
        <q-card-section class="flex items-center no-wrap q-gutter-x-md">
          <q-avatar size="7rem">
            <q-img :src="user.photoURL" />
          </q-avatar>
          <h5 class="q-my-none">{{ user.displayName }}</h5>
          <div class="col-grow text-right">
            <q-btn
              v-if="user.facebook"
              flat
              :href="`https://facebook.com/${user.facebook}`"
              icon="img:/icons/facebook.svg"
              round
              target="_blank"
            />
            <q-btn
              v-if="user.instagram"
              flat
              :href="`https://instagram.com/${user.instagram}`"
              icon="img:/icons/instagram.svg"
              round
              target="_blank"
            />
            <q-btn
              v-if="user.linkedin"
              flat
              :href="`https://linkedin.com/in/${user.linkedin}`"
              icon="img:/icons/linkedin.svg"
              round
              target="_blank"
            />
            <q-btn
              v-if="user.telegram"
              flat
              :href="`https://telegram.com/${user.telegram}`"
              icon="img:/icons/telegram.svg"
              round
              target="_blank"
            />
            <q-btn
              v-if="user.twitter"
              flat
              :href="`https://twitter.com/${user.twitter}`"
              icon="img:/icons/twitter.svg"
              round
              target="_blank"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <p class="text-body1" style="white-space: pre-line">{{ user.bio }}</p>
        </q-card-section>
        <q-card-section>
          <b>- Prompts/Entries will be here...</b>
        </q-card-section>
      </q-card>
    </q-page>
  </q-page-container>
</template>

<script setup>
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useUserStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const user = ref({})

onMounted(async () => {
  if (!userStore.getUsers.length) {
    await userStore.fetchUsers()
  }

  user.value = userStore.getUsers.find((user) => user.username === router.currentRoute.value.params.username)

  if (!user.value) {
    router.push('/')
  }

  console.log(user.value)
})
</script>
