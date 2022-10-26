<template>
  <q-header elevated>
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Profile</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>
  <q-page class="flex content-center justify-center">
    <h1 class="text-center text-h4">You are not logged in.</h1>
    <q-btn class="btn-google q-mt-md" rounded @click="googleSignIn()">
      <q-avatar size="sm">
        <q-img src="~assets/google.svg" alt="Google Logo" />
      </q-avatar>
      <span class="q-ml-sm">Sign with Google</span>
    </q-btn>
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

function googleSignIn() {
  authStore.googleSignIn().catch((error) => $q.notify({ icon: 'error', message: authErrors[error] }))
}
</script>
