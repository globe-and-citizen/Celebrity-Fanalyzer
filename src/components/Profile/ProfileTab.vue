<template>
  <q-input v-model="user.displayName" label="Name" />
  <q-input v-model="user.bio" maxlength="150" label="Bio" type="textarea" />
  <h3 class="q-mt-xl text-bold text-h5 text-secondary">MetaData</h3>
  <q-input v-model="user.data1" label="Data 1" />
  <q-input v-model="user.data2" label="Data 2" />
  <q-btn class="full-width q-mt-lg" color="primary" label="Save" padding="12px" rounded @click="save()" />
</template>

<script setup>
import { useErrorStore, useUserStore } from 'app/src/stores'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const $q = useQuasar()

const errorStore = useErrorStore()
const userStore = useUserStore()

const user = ref(userStore.getUser)

userStore.$subscribe((_mutation, state) => {
  user.value = state._user
})

function save() {
  userStore
    .updateProfile(user.value)
    .then($q.notify({ type: 'info', message: 'Profile successfully updated' }))
    .catch((error) => errorStore.throwError(error, 'Error updating profile'))
}
</script>
