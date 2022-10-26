<template>
  <q-footer elevated>
    <q-toolbar class="bg-white">
      <q-toolbar-title class="flex self-stretch">
        <RouterLink v-for="(route, index) in routes" :key="index" class="col-grow flex items-center justify-center" :to="route.path">
          <q-icon :name="route.icon" size="lg" />
        </RouterLink>
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup>
const routes = [
  { icon: 'home', path: '/' },
  { icon: 'search', path: '/search' },
  { icon: 'notifications', path: '/notifications' },
  { icon: 'person', path: '/profile' }
]
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
  transition: all 0.3s;
  & .q-icon {
    color: gray;
  }

  &.router-link-exact-active {
    border-top: 2.5px solid #e54757;

    & .q-icon {
      color: #e54757; // TODO: use $primary variable
      text-decoration: none;
    }
  }
}
</style>
