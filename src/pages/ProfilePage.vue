<template>
  <TheHeader feedbackButton title="Profile"/>

  <q-spinner v-if="userStore.isLoading" class="absolute-center z-fab" color="primary" size="3em"/>

  <q-page v-if="!user.uid" class="column content-center flex justify-center">
    <h1 class="text-center text-h4">You are not logged in.</h1>
    <q-btn class="btn-google q-mt-md" rounded @click="googleSignIn()" data-test="login-button">
      <q-avatar size="sm">
        <q-img src="~assets/google.svg" alt="Google Logo"/>
      </q-avatar>
      <span class="q-ml-sm">Sign with Google</span>
    </q-btn>
  </q-page>

  <q-page v-else class="q-px-lg">
    <div class="flex items-center no-wrap q-py-xl">
      <q-avatar size="5rem" color="teal" text-color="white">
        <q-img :src="user.photoURL" spinner-color="primary" spinner-size="82px">
          <div class="photo">
            <q-icon class="q-mx-auto" color="grey-6" name="upload" size="xs"/>
            <q-file accept="image/*" borderless class="absolute-bottom" dense v-model="newPhoto"
                    @update:model-value="uploadPhoto()">
              <template v-slot:file>
                <q-chip class="hidden"/>
              </template>
            </q-file>
          </div>
        </q-img>
      </q-avatar>
      <h2 class="q-ml-md text-secondary text-h5 text-bold">{{ user.displayName }}</h2>
    </div>

    <q-tabs v-model="tab" active-color="primary" @update:model-value="userStore.setProfileTab(tab)"
            data-test="profile-tabs">
      <q-tab name="profile" label="Profile" data-test="tab-profile"/>
      <q-tab name="feedback" label="Feedback" data-test="tab-feedback"/>
      <q-tab name="settings" label="Settings" data-test="tab-settings"/>
    </q-tabs>

    <q-separator/>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel class="q-gutter-y-md" name="profile">
        <ProfileTab/>
      </q-tab-panel>

      <q-tab-panel class="q-gutter-y-md" name="feedback">
        <FeedbackTab/>
      </q-tab-panel>

      <q-tab-panel class="q-gutter-y-md" name="settings">
        <SettingsTab/>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import FeedbackTab from 'src/components/Profile/FeedbackTab.vue'
import ProfileTab from 'src/components/Profile/ProfileTab.vue'
import SettingsTab from 'src/components/Profile/SettingsTab.vue'
import TheHeader from 'src/components/TheHeader.vue'
import {useErrorStore, useUserStore} from 'src/stores'
import {ref} from 'vue'

const errorStore = useErrorStore()
const userStore = useUserStore()

const newPhoto = ref([])
const user = ref(userStore.getUser)
const tab = ref(userStore.getProfileTab)

userStore.$subscribe((_mutation, state) => {
  user.value = state._user
})

async function googleSignIn() {
  console.log("import.meta.env.VITE_MODE", import.meta.env.VITE_MODE)
  if (import.meta.env.VITE_MODE === "E2E") {
    await userStore.googleSignInWithEmailAndPassword().catch((error) => errorStore.throwError(error))
  } else {
    await userStore.googleSignIn().catch((error) => errorStore.throwError(error))
  }
}

function uploadPhoto() {
  const reader = new FileReader()
  reader.readAsDataURL(newPhoto.value)
  reader.onload = () => (user.value.photoURL = reader.result)
}
</script>

<style scoped lang="scss">
.photo {
  background-color: transparent;
  bottom: 0;
  height: 25%;
  padding: 0;
  position: absolute;
  text-align: center;
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
