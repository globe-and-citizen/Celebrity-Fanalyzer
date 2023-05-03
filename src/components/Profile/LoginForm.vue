<template>
  <q-page>
    <q-card class="fixed-center" style="width: 30rem; max-width: 90vw">
      <q-form greedy @submit="googleSignIn">
        <q-card-section>
          <q-input label="Email" required v-model="email" />
          <q-input label="Password" required type="password" v-model="password" />
        </q-card-section>
        <q-card-actions align="center" class="column">
          <q-btn color="primary" label="Sign" @click="sign" />
          <q-btn class="q-my-md" data-test="login-button" rounded type="submit">
            <q-avatar size="sm">
              <q-img alt="Google Logo" src="~assets/google.svg" />
            </q-avatar>
            <span class="q-ml-sm">Sign with Google</span>
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { useErrorStore, useUserStore } from 'app/src/stores'
import { ref } from 'vue'

const errorStore = useErrorStore()
const userStore = useUserStore()

const email = ref('')
const password = ref('')

async function googleSignIn() {
  if (import.meta.env.VITE_MODE === 'E2E') {
    await userStore.emailSignIn().catch((error) => errorStore.throwError(error))
  } else {
    await userStore.googleSignIn().catch((error) => errorStore.throwError(error))
  }
}

async function sign() {
  console.log('sign')
}
</script>
