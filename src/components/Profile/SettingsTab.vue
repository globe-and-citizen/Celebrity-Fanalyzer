<template>
  <q-input v-model="userStore.getUser.email" disable label="Email" />
  <q-btn class="full-width q-mt-lg" color="secondary" data-test="logout-button" label="Logout" padding="12px" rounded @click="onLogout" />
</template>

<script setup>
import { useUserStore } from 'app/src/stores'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

function onLogout() {
  userStore.logout()
  router.push({ path: '/profile' })
}
</script>
