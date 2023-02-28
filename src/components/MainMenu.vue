<template>
  <q-footer class="bg-white" elevated>
    <q-tabs active-class="text-primary" align="justify" class="tabs text-grey" switch-indicator>
      <q-route-tab v-for="(route, index) in routes" exact :icon="route.icon" :key="index" :to="route.path" />
      <q-route-tab v-if="userStore.isAdmin || userStore.isWriter" exact icon="admin_panel_settings" to="/admin" />
    </q-tabs>
  </q-footer>
</template>

<script setup>
import { useUserStore } from 'src/stores'

const userStore = useUserStore()

const routes = [
  { icon: 'home', path: '/' },
  { icon: 'search', path: '/search' },
  { icon: 'description', path: '/month' },
  { icon: 'person', path: '/profile' }
]
</script>

<style lang="scss">
.tabs .q-tab__icon {
  font-size: 2rem;
  height: 3.5rem !important;
}
</style>
