<template>
  <TheHeader feedbackButton notificationButton title="Profile" />

  <q-spinner v-if="userStore.isLoading" class="absolute-center z-fab" color="primary" size="3em" />

  <q-page-container>
    <LoginForm v-if="!user.uid" />

    <q-page v-else class="q-pa-sm">
      <q-tabs v-model="tab" active-color="primary" @update:model-value="userStore.setProfileTab(tab)" data-test="profile-tabs">
        <q-tab name="profile" label="Profile" data-test="tab-profile" />
        <q-tab name="subscriptions" label="Subscriptions" data-test="tab-subscriptions" />
        <q-tab name="feedback" label="Feedback" data-test="tab-feedback" />
        <q-tab name="settings" label="Settings" data-test="tab-settings" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="profile">
          <ProfileTab />
        </q-tab-panel>

        <q-tab-panel name="subscriptions">
          <SubscriptionsTab />
        </q-tab-panel>

        <q-tab-panel name="feedback">
          <FeedbackTab />
        </q-tab-panel>

        <q-tab-panel name="settings">
          <SettingsTab />
        </q-tab-panel>
      </q-tab-panels>
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
