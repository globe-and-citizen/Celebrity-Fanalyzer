<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <MainMenu />
  </q-layout>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import MainMenu from 'src/components/MainMenu.vue'
</script>

<style>
.q-page-container {
  margin: auto;
  max-width: 600px;
}
</style>
