<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-white">
        <q-toolbar-title>
          <q-icon color="primary" name="stars" size="md" />
          <span class="q-ml-sm inline row text-secondary">
            <b>Celebrity</b>
            Fanalyzer
          </span>
        </q-toolbar-title>

        <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated>
      <q-toolbar class="bg-white">
        <q-toolbar-title class="flex self-stretch">
          <RouterLink v-for="(route, index) in routes" :key="index" class="col-grow flex items-center justify-center" :to="route.path">
            <q-icon :name="route.icon" size="lg" />
          </RouterLink>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { RouterLink } from 'vue-router'

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
  transition: all 1s;
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

.q-toolbar {
  min-height: 4rem;
}
</style>
