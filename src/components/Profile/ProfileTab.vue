<template>
  <q-form class="q-gutter-y-md" greedy @submit="save">
    <div class="flex items-center no-wrap">
      <q-avatar size="5rem" text-color="white">
        <q-spinner v-if="storageStore.isLoading" color="primary" size="3rem" />
        <q-img v-else :src="user.photoURL" spinner-color="primary" spinner-size="3rem">
          <div class="photo">
            <q-icon class="absolute-center q-mx-auto" color="grey-6" name="upload" />
            <q-file
              accept="image/*"
              borderless
              class="absolute-full cursor-pointer"
              dense
              max-file-size="5242880"
              style="height: 5rem"
              v-model="newPhoto"
              @rejected="onRejected"
              @update:model-value="uploadPhoto"
            >
              <template v-slot:file>
                <q-chip class="hidden" />
              </template>
            </q-file>
          </div>
        </q-img>
      </q-avatar>
      <q-input
        class="col-grow q-pl-sm"
        label="Name"
        required
        :rules="[(val) => val.length || 'Name is required']"
        v-model="user.displayName"
      />
    </div>
    <q-input
      class="non-selectable"
      debounce="400"
      label="Username"
      :prefix="origin + 'fan/'"
      :rules="[(val) => usernameValidator(val)]"
      v-model.trim="user.username"
    >
      <template v-slot:append>
        <q-btn flat icon="content_copy" round size="sm" @click="copyLink">
          <q-tooltip>Copy</q-tooltip>
        </q-btn>
      </template>
    </q-input>
    <q-input counter label="Bio" maxlength="1000" type="textarea" v-model="user.bio" />

    <h3 class="q-mt-xl text-bold text-h5 text-secondary">Social Networks</h3>
    <q-input label="Facebook" prefix="https://facebook.com/" v-model.trim="user.facebook" />
    <q-input label="Instagram" prefix="https://instagram.com/" v-model.trim="user.instagram" />
    <q-input label="Linkedin" prefix="https://linkedin.com/in/" v-model.trim="user.linkedin" />
    <q-input label="Telegram" prefix="https://web.telegram.org/a/#" v-model.trim="user.telegram" />
    <q-input label="Twitter" prefix="https://twitter.com/" v-model.trim="user.twitter" />

    <h3 class="q-mt-xl text-bold text-h5 text-secondary">MetaData</h3>
    <q-btn
      class="full-width"
      color="secondary"
      :disabled="authStore.signature"
      icon="img:/icons/ethereum.svg"
      :label="authStore.signature ? 'Signed In With Ethereum' : 'Sign In With Ethereum'"
      rounded
      @click="onSignInWithEthereum"
    >
      <q-tooltip v-if="authStore.signature">
        <div class="text-center">
          <span class="text-caption">Signature: {{ authStore.signature }}</span>
        </div>
      </q-tooltip>
    </q-btn>
    <q-btn
      class="full-width q-mb-lg"
      color="secondary"
      :disabled="authStore.wallets.length"
      icon="wallet"
      label="Connect Wallet"
      rounded
      @click="authStore.connectWallet()"
    >
      <q-tooltip v-for="(wallet, index) in authStore.wallets" :key="index">
        <div class="text-caption">{{ wallet }}</div>
      </q-tooltip>
    </q-btn>
    <q-btn class="full-width q-mt-lg" color="primary" label="Save" padding="12px" rounded type="submit" />
  </q-form>
</template>

<script setup>
import { useAuthStore, useErrorStore, useStorageStore, useUserStore } from 'app/src/stores'
import { Notify, useQuasar } from 'quasar'
import { ref } from 'vue'

const $q = useQuasar()

const authStore = useAuthStore()
const errorStore = useErrorStore()
const storageStore = useStorageStore()
const userStore = useUserStore()

const newPhoto = ref(null)
const origin = window.location.origin + '/'
const user = ref(userStore.getUser)

userStore.$subscribe((_mutation, state) => {
  user.value = state._user
})

function onRejected() {
  Notify.create({ type: 'negative', message: 'File size is too big. Max file size is 5MB.' })
}

async function uploadPhoto() {
  await storageStore
    .uploadFile(newPhoto.value, `users/${userStore.getUser.uid}`)
    .then((url) => (user.value.photoURL = url))
    .catch((error) => errorStore.throwError(error))
}

async function usernameValidator(username) {
  if (!username) return true
  if (!/\w{3,20}$/.test(username)) return 'Username must be between 3 and 20 characters long'
  const isAvailable = !(await userStore.checkUsernameAvailability(username))
  if (!isAvailable) return 'Username already taken'
}

function copyLink() {
  navigator.clipboard.writeText(origin + 'fan/' + user.value.username)
  Notify.create({ type: 'positive', message: 'Link copied to clipboard' })
}

function onSignInWithEthereum() {
  authStore
    .signInWithEthereum()
    .then(() => $q.notify({ message: 'Successfully signed in with Ethereum', type: 'positive' }))
    .catch((error) => errorStore.throwError(error, 'Error signing in with Ethereum'))
}

function save() {
  userStore
    .updateProfile(user.value)
    .then(() => $q.notify({ message: 'Profile successfully updated', type: 'positive' }))
    .catch((error) => errorStore.throwError(error, 'Error updating profile'))
}
</script>

<style scoped lang="scss">
.photo {
  background-color: transparent;
  height: 100%;
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
