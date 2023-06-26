<template>
  <h3 class="text-bold text-h5 text-secondary">Become a Writer!</h3>
  <p class="text-body1 text-center">
    We are always looking for new writers to join our team.
    <br />
    If you are interested, please send a message to us.
  </p>
  <q-input type="textarea" label="Message" v-model="message" />
  <q-btn
    class="full-width q-mt-lg"
    color="primary"
    data-test="become-writer"
    label="Submit Request"
    padding="12px"
    rounded
    @click="onBecomeWriter"
  />

  <q-separator spaced="xl" />

  <q-input v-model="userStore.getUser.email" disable label="Email" />
  <q-btn class="full-width q-mt-lg" color="secondary" data-test="logout-button" label="Logout" padding="12px" rounded @click="onLogout" />
</template>

<script setup>
import { useErrorStore, useRequestStore, useUserStore } from 'app/src/stores'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const $q = useQuasar()

const errorStore = useErrorStore()
const requestStore = useRequestStore()
const userStore = useUserStore()

const message = ref('')
// const user = ref(userStore.getUser)

// userStore.$subscribe((_mutation, state) => {
//   user.value = state._user
// })

function onBecomeWriter() {
  requestStore
    .becomeWriter(message.value)
    .then(() => {
      $q.notify({ message: 'Request submitted!', type: 'positive' })
      message.value = ''
    })
    .catch((error) => errorStore.throwError(error, 'Error submitting request'))
}

function onLogout() {
  userStore.logout()
}
</script>
