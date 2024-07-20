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
    <div>
      <span class="text-h8 text-bold text-secondary">Wallet address</span>
      <q-input class="non-selectable" debounce="400" label="Your wallet address" v-model.trim="user.walletAddress" readonly></q-input>

      <q-input class="non-selectable" debounce="400" label="Current Connected wallet Address" v-model.trim="currentWalletAddress" readonly>
        <Web3ModalComponent page_name="profile" />

        <q-btn
          v-if="currentWalletAddress && addressUpdated === false"
          color="black"
          flat
          size="sm"
          icon="toggle_off"
          @click="onSetWalletAddressDialog()"
        >
          <q-tooltip class="positive" :offset="[10, 10]">set as your wallet address!</q-tooltip>
        </q-btn>

        <q-btn v-if="addressUpdated === true" color="green" flat size="sm" icon="toggle_on" @click="switchAddressUpdated(false)">
          <q-tooltip class="positive" :offset="[10, 10]">unset as your wallet address!</q-tooltip>
        </q-btn>
      </q-input>
    </div>
    <q-input counter label="Bio" maxlength="1000" type="textarea" v-model="user.bio" />

    <h3 class="q-mt-xl text-bold text-h5 text-secondary">Social Networks</h3>
    <q-input label="Facebook" prefix="https://facebook.com/" v-model.trim="user.facebook" />
    <q-input label="Instagram" prefix="https://instagram.com/" v-model.trim="user.instagram" />
    <q-input label="Linkedin" prefix="https://linkedin.com/in/" v-model.trim="user.linkedin" />
    <q-input label="Telegram" prefix="https://web.telegram.org/a/#" v-model.trim="user.telegram" />
    <q-input label="Twitter" prefix="https://twitter.com/" v-model.trim="user.twitter" />

    <h3 class="q-mt-xl text-bold text-h5 text-secondary">MetaData</h3>
    <q-input label="Data 1" v-model="user.data1" />
    <q-input label="Data 2" v-model="user.data2" />
    
    <q-btn class="full-width q-mt-lg" color="primary" label="Save" padding="12px" rounded type="submit" />
  </q-form>
  <q-dialog v-model="setWalletAddressDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">set wallet address</h6>
      </q-card-section>
      <q-card-section>
        <span class="q-ml-sm">
          Are you sure you want to set:
          <b>{{ address }}</b>
          as your wallet address ?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Cancel" v-close-popup />
        <q-btn color="info" data-test="confirm-set-wallet" label="set" @click="onSetWalletAddress()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useErrorStore, useStorageStore, useUserStore } from 'app/src/stores'
import { Notify, useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import Web3ModalComponent from './Web3ModalComponent.vue'
import { useWalletStore } from 'app/src/stores'

const walletStore = useWalletStore()

const currentWalletAddress = computed(() => walletStore.getWalletInfo.wallet_address)

const $q = useQuasar()

const errorStore = useErrorStore()
const storageStore = useStorageStore()
const userStore = useUserStore()

const newPhoto = ref(null)
const origin = window.location.origin + '/'
const user = ref(userStore.getUser)

const addressUpdated = ref(false)

const setWalletAddressDialog = ref({ show: false })

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

function switchAddressUpdated(value) {
  addressUpdated.value = value
}
function save() {
  if (currentWalletAddress.value && addressUpdated.value === true) {
    user.value.walletAddress = currentWalletAddress.value
  }

  userStore
    .updateProfile(user.value)
    .then(() => {
      switchAddressUpdated(false)
      $q.notify({ message: 'Profile successfully updated', type: 'positive' })
    })
    .catch((error) => errorStore.throwError(error, 'Error updating profile'))
}

function onSetWalletAddressDialog() {
  setWalletAddressDialog.value.show = true
}

function onSetWalletAddress() {
  switchAddressUpdated(true)
  setWalletAddressDialog.value.show = false
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
