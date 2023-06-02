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
            Social Networks
            <br />
            will be placed here...
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
