<template>
  <q-footer class="bg-white" elevated>
    <q-tabs active-class="text-primary" align="justify" class="tabs text-secondary" data-test="main-menu" switch-indicator>
      <q-route-tab v-for="(route, index) in routes" exact :icon="route.icon" :key="index" :to="route.path">
        <q-tooltip class="text-center" style="white-space: pre-line">{{ route.tooltip }}</q-tooltip>
      </q-route-tab>
      <q-route-tab v-if="userStore.isAdmin || userStore.isWriter" exact icon="admin_panel_settings" to="/admin">
        <q-tooltip>Admin Panel</q-tooltip>
      </q-route-tab>
    </q-tabs>
  </q-footer>
</template>

<script setup>
import { useUserStore } from 'src/stores'

const userStore = useUserStore()
const routes = [
  { icon: 'home', path: '/', tooltip: 'Home' },
  { icon: 'search', path: '/search', tooltip: 'Search' },
  { icon: 'description', path: '/month', tooltip: "Month's Prompt" },
  {
    icon: userStore.isAnonymous ? 'img:src/assets/anonymous.svg' : 'person',
    path: '/profile',
    tooltip: userStore.isAnonymous ? "Profile\nYou're Anonymous" : 'Profile'
  }
]
</script>

<style lang="scss">
.tabs .q-tab__icon {
  display: grid;
  font-size: 2rem;
  height: 3.5rem !important;
}

.tabs .q-tabs__arrow--left,
.tabs .q-tabs__arrow--right {
  display: none;
}
</style>
