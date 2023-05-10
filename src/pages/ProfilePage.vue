<template>
  <TheHeader feedbackButton title="Profile" />

  <q-spinner v-if="userStore.isLoading" class="absolute-center z-fab" color="primary" size="3em" />

  <LoginForm v-if="!user.uid || user.isAnonymous" />

  <q-page v-else class="q-px-lg">
    <div class="flex items-center no-wrap q-py-xl">
      <q-avatar size="5rem" text-color="white">
        <q-spinner v-if="storageStore.isLoading" color="primary" size="3rem" />
        <q-img v-else :src="user.photoURL" spinner-color="primary" spinner-size="3rem">
          <div class="photo">
            <q-icon class="absolute-center q-mx-auto" color="grey-6" name="upload" />
            <q-file
              accept="image/*"
              borderless
              class="absolute-bottom cursor-pointer"
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
      <h2 class="q-ml-md text-secondary text-h5 text-bold">{{ user.displayName }}</h2>
    </div>

    <q-tabs v-model="tab" active-color="primary" @update:model-value="userStore.setProfileTab(tab)" data-test="profile-tabs">
      <q-tab name="profile" label="Profile" data-test="tab-profile" />
      <q-tab name="feedback" label="Feedback" data-test="tab-feedback" />
      <q-tab name="settings" label="Settings" data-test="tab-settings" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel class="q-gutter-y-md" name="profile">
        <ProfileTab />
      </q-tab-panel>

      <q-tab-panel class="q-gutter-y-md" name="feedback">
        <FeedbackTab />
      </q-tab-panel>

      <q-tab-panel class="q-gutter-y-md" name="settings">
        <SettingsTab />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { Notify } from 'quasar'
import FeedbackTab from 'src/components/Profile/FeedbackTab.vue'
import LoginForm from 'src/components/Profile/LoginForm.vue'
import ProfileTab from 'src/components/Profile/ProfileTab.vue'
import SettingsTab from 'src/components/Profile/SettingsTab.vue'
import TheHeader from 'src/components/TheHeader.vue'
import { useErrorStore, useStorageStore, useUserStore } from 'src/stores'
import { ref } from 'vue'

const errorStore = useErrorStore()
const storageStore = useStorageStore()
const userStore = useUserStore()

const newPhoto = ref(null)
const user = ref(userStore.getUser)
const tab = ref(userStore.getProfileTab)

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
