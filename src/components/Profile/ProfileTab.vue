<template>
  <q-form class="q-gutter-y-md" greedy @submit="save">
    <q-input label="Name" v-model="user.displayName" />
    <q-input debounce="400" label="Username" :prefix="origin" :rules="[(val) => usernameValidator(val)]" v-model.trim="user.username" />
    <q-input counter label="Bio" maxlength="1000" type="textarea" v-model="user.bio" />

    <h3 class="q-mt-xl text-bold text-h5 text-secondary">Social Networks</h3>
    <q-input debounce="400" label="Facebook" prefix="https://facebook.com/" v-model.trim="user.facebook" />
    <q-input debounce="400" label="Instagram" prefix="https://instagram.com/" v-model.trim="user.instagram" />
    <q-input debounce="400" label="Linkedin" prefix="https://linkedin.com/in/" v-model.trim="user.linkedin" />
    <q-input debounce="400" label="Telegram" prefix="https://web.telegram.org/a/#" v-model.trim="user.telegram" />
    <q-input debounce="400" label="Twitter" prefix="https://twitter.com/" v-model.trim="user.twitter" />

    <h3 class="q-mt-xl text-bold text-h5 text-secondary">MetaData</h3>
    <q-input label="Data 1" v-model="user.data1" />
    <q-input label="Data 2" v-model="user.data2" />
    <q-btn class="full-width q-mt-lg" color="primary" label="Save" padding="12px" rounded type="submit" />
  </q-form>
</template>

<script setup>
import { useErrorStore, useUserStore } from 'app/src/stores'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const $q = useQuasar()

const errorStore = useErrorStore()
const userStore = useUserStore()

const origin = window.location.origin + '/'
const user = ref(userStore.getUser)

userStore.$subscribe((_mutation, state) => {
  user.value = state._user
})

async function usernameValidator(username) {
  if (!/\w{3,20}$/.test(username)) return 'Username must be between 3 and 20 characters long'
  const isAvailable = !(await userStore.checkUsernameAvailability(username))
  if (!isAvailable) return 'Username already taken'
}

function save() {
  userStore
    .updateProfile(user.value)
    .then(() => $q.notify({ message: 'Profile successfully updated', type: 'positive' }))
    .catch((error) => errorStore.throwError(error, 'Error updating profile'))
}
</script>
