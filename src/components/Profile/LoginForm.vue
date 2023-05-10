<template>
  <q-page>
    <q-card class="fixed-center" style="width: 25rem; max-width: 90vw">
      <q-tabs class="text-primary" v-model="tab">
        <q-tab data-test="signin-tab" label="Sign In" name="signin" />
        <q-tab data-test="signup-tab" label="Sign Up" name="signup" />
      </q-tabs>

      <q-form class="q-pa-md text-center" greedy @submit="emailSign">
        <q-input
          v-if="tab === 'signup'"
          data-test="name-field"
          hide-hint
          :hint="'At least 2 characters'"
          label="Name"
          lazy-rules
          required
          :rules="[(val) => /^.{2,}$/.test(val) || 'Invalid Name']"
          v-model="user.name"
        />
        <q-input
          data-test="email-field"
          label="Email"
          lazy-rules
          required
          :rules="[(val, rules) => rules.email(val) || 'Invalid Email']"
          v-model="user.email"
        />
        <q-input
          data-test="password-field"
          label="Password"
          hide-hint
          :hint="'At least 6 characters'"
          lazy-rules
          required
          :rules="[(val) => /^.{6,}$/.test(val) || 'Invalid Password']"
          type="password"
          v-model="user.password"
        />
        <q-btn color="primary" data-test="sign-button" :label="tab === 'signin' ? 'Sign In' : 'Sign Up'" type="submit" />
      </q-form>

      <q-separator inset />

      <div class="column items-center q-gutter-md q-py-md">
        <q-btn data-test="google-button" icon="img:src/assets/google.svg" label="Sign with Google" rounded @click="googleSign" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { useErrorStore, useUserStore } from 'src/stores'
import { ref } from 'vue'

const errorStore = useErrorStore()
const userStore = useUserStore()

const user = ref({ email: '', name: '', password: '' })
const tab = ref('signin')

async function emailSign() {
  if (tab.value === 'signin') {
    await userStore.emailSignIn(user.value).catch((error) => errorStore.throwError(error))
  }

  if (tab.value === 'signup') {
    await userStore.emailSignUp(user.value).catch((error) => errorStore.throwError(error))
  }
}

async function anonymousSign() {
  await userStore.anonymousSignIn().catch((error) => errorStore.throwError(error))
}

async function googleSign() {
  await userStore.googleSignIn().catch((error) => errorStore.throwError(error))
}

async function sign() {
  console.log('sign')
}
</script>
