<template>
  <q-header class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <q-img src="~assets/logo.svg" width="1.7rem" />
        <span class="q-ml-sm inline row text-secondary">
          <b>Celebrity</b>
          Fanalyzer
        </span>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md">
    <q-video :ratio="16 / 9" src="https://www.youtube.com/embed/k948WBArZwU" />
    <TheEntries />
  </q-page>
</template>

<script setup>
import TheEntries from 'src/components/TheEntries.vue'
</script>

<style>
.q-video {
  border: 3px solid #e54757;
  border-radius: 8px;
  margin: auto 1rem;
}
</style>
