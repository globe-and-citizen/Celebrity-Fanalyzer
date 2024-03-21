<template>
  <TheHeader feedbackButton notificationButton title="Profile" />

  <q-spinner v-if="userStore.isLoading" class="absolute-center z-fab" color="primary" size="3em" />

  <q-page-container>
    <LoginForm v-if="!user.uid" />

    <q-page v-else class="q-pa-sm">
      <q-tabs active-color="primary">
        <q-route-tab name="profile" label="Profile" data-test="tab-profile" :to="{ name: 'profile' }"  />
        <q-route-tab
          name="subscriptions"
          label="Subscriptions"
          data-test="tab-subscriptions"
          :to="{ name: 'profile.subscriptions' }"
          exact
        />
        <q-route-tab name="feedback" label="Feedback" data-test="tab-feedback" :to="{ name: 'profile.feedback' }" exact />
        <q-route-tab name="settings" label="Settings" data-test="tab-settings" exact :to="{ name: 'profile.settings' }" />
      </q-tabs>

      <q-separator />

      <router-view />
    </q-page>
  </q-page-container>
</template>

<script setup>
import FeedbackTab from 'src/components/Profile/FeedbackTab.vue'
import LoginForm from 'src/components/Profile/LoginForm.vue'
import ProfileTab from 'src/components/Profile/ProfileTab.vue'
import SettingsTab from 'src/components/Profile/SettingsTab.vue'
import SubscriptionsTab from 'src/components/Profile/SubscriptionsTab.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useUserStore } from 'src/stores'
import { ref } from 'vue'

const userStore = useUserStore()

const user = ref(userStore.getUser)
const tab = ref(userStore.getProfileTab)

userStore.$subscribe((_mutation, state) => {
  user.value = state._user
  tab.value = state._profileTab
})
</script>
