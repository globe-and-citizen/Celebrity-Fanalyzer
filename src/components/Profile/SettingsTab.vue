<template>
  <q-input v-model="user.email" disable label="Email" />
  <q-btn class="full-width q-mt-lg" color="secondary" label="Logout" padding="12px" rounded @click="logout()" data-test="logout-button" />
</template>

<script setup>
import { useErrorStore, useUserStore } from 'app/src/stores'
import { ref } from 'vue'

const errorStore = useErrorStore()
const userStore = useUserStore()

const user = ref(userStore.getUser)

userStore.$subscribe((_mutation, state) => {
  user.value = state._user
})

function logout() {
  userStore.logout()
}
</script>
