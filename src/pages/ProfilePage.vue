<template>
  <q-header>
    <q-toolbar class="bg-white q-px-lg shadow-1">
      <q-toolbar-title>
        <b class="text-secondary">Profile</b>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page v-if="!userStore.getUser.uid" class="column content-center flex justify-center">
    <h1 class="text-center text-h4">You are not logged in.</h1>
    <q-btn class="btn-google q-mt-md" rounded @click="googleSignIn()">
      <q-avatar size="sm">
        <q-img src="~assets/google.svg" alt="Google Logo" />
      </q-avatar>
      <span class="q-ml-sm">Sign with Google</span>
    </q-btn>
  </q-page>
  <q-page v-else class="q-px-lg">
    <div class="flex items-center q-py-xl">
      <q-avatar size="5rem" color="teal" text-color="white">
        <q-img :src="photoURL" spinner-color="primary" spinner-size="82px" />
      </q-avatar>
      <div class="column flex q-ml-md text-secondary">
        <h2 class="q-my-none text-h5 text-bold">{{ displayName }}</h2>
        <p class="q-my-none text-body1">Some Stats...</p>
      </div>
    </div>
    <q-tabs v-model="tab" active-color="primary">
      <q-tab name="profile" label="Profile" />
      <q-tab name="settings" label="Settings" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel class="q-gutter-y-md" name="profile">
        <q-input v-model="name" label="Name" />
        <q-input v-model="bio" label="Bio" />
        <h3 class="q-mt-lg text-bold text-h5 text-secondary">MetaData</h3>
        <q-input v-model="data1" label="Data 1" />
        <q-input v-model="data2" label="Data 2" />
        <q-btn class="full-width" color="primary" label="Save" padding="12px" rounded @click="save()" />
      </q-tab-panel>
      <q-tab-panel class="q-gutter-y-md" name="settings">
        <q-input v-model="email" disable label="Email" />
        <q-btn class="full-width" color="secondary" label="Logout" padding="12px" rounded @click="logout()" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useUserStore } from 'src/stores/user'
import { ref } from 'vue'

const $q = useQuasar()
const authStore = useAuthStore()
const userStore = useUserStore()

const { email, photoURL, displayName } = userStore.getUser

const tab = ref('profile')
const name = ref('')
const bio = ref('')
const data1 = ref('')
const data2 = ref('')

function googleSignIn() {
  authStore.googleSignIn().catch((error) => $q.notify({ icon: 'error', message: error }))
}

function save() {
  $q.notify({ message: 'Saving will be configured...' })
}

function logout() {
  authStore.logout()
}
</script>
