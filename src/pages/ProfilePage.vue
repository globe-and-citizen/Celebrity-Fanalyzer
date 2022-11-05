<template>
  <q-header>
    <q-toolbar class="bg-white q-px-lg shadow-1">
      <q-toolbar-title>
        <b class="text-secondary">Profile</b>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page v-if="!userStore.isAuthenticated" class="column content-center flex justify-center">
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
        <q-img :src="user.photoURL" spinner-color="primary" spinner-size="82px">
          <div class="photo">
            <q-icon class="q-mx-auto" color="grey-6" name="upload" size="xs" />
            <q-file accept="image/*" borderless class="absolute-bottom" dense v-model="newPhoto" @update:model-value="uploadPhoto()">
              <template v-slot:file>
                <q-chip class="hidden" />
              </template>
            </q-file>
          </div>
        </q-img>
      </q-avatar>
      <div class="column flex q-ml-md text-secondary">
        <h2 class="q-my-none text-h5 text-bold">{{ user.displayName }}</h2>
        <p class="q-my-none text-body1">{{ user.bio }}</p>
      </div>
    </div>
    <q-tabs v-model="tab" active-color="primary">
      <q-tab name="profile" label="Profile" />
      <q-tab name="settings" label="Settings" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel class="q-gutter-y-md" name="profile">
        <q-input v-model="user.displayName" label="Name" />
        <q-input v-model="user.bio" label="Bio" />
        <h3 class="q-mt-lg text-bold text-h5 text-secondary">MetaData</h3>
        <q-input v-model="user.data1" label="Data 1" />
        <q-input v-model="user.data2" label="Data 2" />
        <q-btn class="full-width" color="primary" label="Save" padding="12px" rounded @click="save()" />
      </q-tab-panel>
      <q-tab-panel class="q-gutter-y-md" name="settings">
        <q-input v-model="user.email" disable label="Email" />
        <q-btn class="full-width" color="secondary" label="Logout" padding="10px" rounded @click="logout()" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useAuthStore, useUserStore } from 'src/stores/'
import { reactive, ref } from 'vue'

const $q = useQuasar()
const authStore = useAuthStore()
const userStore = useUserStore()

const tab = ref('profile')
const user = reactive({ ...userStore.getUser })
const newPhoto = ref([])

function googleSignIn() {
  authStore.googleSignIn().catch((error) => $q.notify({ icon: 'error', message: error }))
}

function uploadPhoto() {
  const reader = new FileReader()
  reader.readAsDataURL(newPhoto.value)
  reader.onload = () => (user.photoURL = reader.result)
}

function save() {
  userStore
    .updateProfile(user)
    .then($q.notify({ message: 'Profile successfully updated' }))
    .catch((error) => $q.notify({ icon: 'error', message: error }))
}

function logout() {
  authStore.logout()
}
</script>

<style scoped lang="scss">
.photo {
  background-color: transparent;
  bottom: 0;
  height: 25%;
  padding: 0;
  position: absolute;
  text-align: center;
  transition: all 0.3s;
  width: 100%;

  & .q-icon {
    display: none;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.5);

    & .q-icon {
      display: block;
    }
  }
}
</style>
