<template>
  <q-layout view="lHh Lpr lFf">
    <LoadingSpinner v-if="loadingStore.isLoading" />
    <router-view />

    <MainMenu />
  </q-layout>
</template>

<script setup>
import MainMenu from './MainMenu.vue'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'
import { useLoadingStore } from '../stores/index'

const loadingStore = useLoadingStore()
</script>

<style>
.q-page-container {
  margin: auto;
  max-width: 600px;
}
</style>
