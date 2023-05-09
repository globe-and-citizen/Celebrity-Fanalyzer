<template>
  <q-page>
    <q-card class="fixed-center" style="width: 25rem; max-width: 90vw">
      <q-tabs class="text-primary" v-model="tab">
        <q-tab label="Sign In" name="signin" />
        <q-tab label="Sign Up" name="signup" />
      </q-tabs>

      <q-form class="q-pa-md text-center" greedy @submit="emailSign">
        <q-input
          v-if="tab === 'signup'"
          hide-hint
          :hint="nameHint"
          label="Name"
          lazy-rules
          required
          :rules="nameRules"
          v-model="user.name"
        />
        <q-input label="Email" lazy-rules required :rules="emailRules" v-model="user.email" />
        <q-input
          label="Password"
          hide-hint
          :hint="passwordHint"
          lazy-rules
          required
          :rules="passwordRules"
          type="password"
          v-model="user.password"
        />
        <q-btn color="primary" :label="tab === 'signin' ? 'Sign In' : 'Sign Up'" type="submit" />
      </q-form>

      <q-separator inset spaced />

      <div class="q-my-sm text-center">
        <q-btn class="q-my-md" data-test="login-button" rounded type="submit" @click="googleSign">
          <q-avatar size="sm">
            <q-img alt="Google Logo" src="~assets/google.svg" />
          </q-avatar>
          <span class="q-ml-sm">Sign with Google</span>
        </q-btn>
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

const nameHint = 'At least 2 characters'
const passwordHint = 'At least 6 characters'

const emailRules = [(val, rules) => rules.email(val) || 'Invalid Email']
const nameRules = [(val) => /^.{2,}$/.test(val) || 'Invalid Name']
const passwordRules = [(val) => /^.{6,}$/.test(val) || 'Invalid Password']

async function emailSign() {
  if (import.meta.env.VITE_MODE === 'E2E') {
    user.value.email = 'test@test.com'
    user.value.password = '12345678'
  }

  if (tab.value === 'signin') {
    await userStore.emailSignIn(user.value).catch((error) => errorStore.throwError(error))
  }

  if (tab.value === 'signup') {
    await userStore.emailSignUp(user.value).catch((error) => errorStore.throwError(error))
  }
}

async function googleSign() {
  await userStore.googleSignIn().catch((error) => errorStore.throwError(error))
}

async function sign() {
  console.log('sign')
}
</script>
