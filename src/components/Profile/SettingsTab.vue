<template>
  <q-form v-if="!userStore.isWriterOrAbove" @submit="onBecomeWriter">
    <h3 class="text-bold text-h5 text-secondary">Become a Writer!</h3>
    
    <p class="text-body1 text-center">
      We are always looking for new writers to join our team.
      <br />
      If you are interested, please send a message to us.
    </p>
    
    
    <q-input class="q-mb-lg" label="Message" required type="textarea" v-model="message" />
    <Web3ModalComponent />
    <br/>
    <q-btn class="full-width" color="primary" data-test="become-writer" label="Submit Request" padding="12px" rounded type="submit" />
    <q-separator spaced="xl" />
  </q-form>

  <q-input v-model="userStore.getUser.email" disable label="Email" />
  <q-btn class="full-width q-mt-lg" color="secondary" data-test="logout-button" label="Logout" padding="12px" rounded @click="onLogout" />
</template>

<script setup>
import { useErrorStore, useRequestStore, useUserStore } from 'app/src/stores'
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useWalletStore } from 'app/src/stores';
import { computed } from 'vue';

import Web3ModalComponent from './Web3ModalComponent.vue';
const $q = useQuasar()

const errorStore = useErrorStore()
const requestStore = useRequestStore()
const userStore = useUserStore()
const walletStore=useWalletStore()
const message = ref('')

function onBecomeWriter() {
  requestStore
    .becomeWriter(message.value)
    .then(() => {
      $q.notify({ message: 'Request submitted!', type: 'positive' })
      message.value = ''
    })
    .catch((error) => {
      console.log("Error submitting request ==== ", error)
      errorStore.throwError(error, 'Error submitting request')
    })
}

function onLogout() {
  userStore.logout()
}
</script>
