<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <MainMenu />
  </q-layout>
</template>

<script setup>
import MainMenu from '../components/MainMenu.vue'
</script>
