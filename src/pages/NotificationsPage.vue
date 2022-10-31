<template>
  <q-header class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Notifications</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>
  <q-page class="flex column non-selectable">
    <q-tab-panels v-model="tab" animated swipeable infinite class="col-grow q-pa-md">
      <q-tab-panel name="content1">
        <h1 class="text-h5">Content 1</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
      <q-tab-panel name="content2">
        <h1 class="text-h5">Content 2</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
    <q-tabs active-color="primary" dense indicator-color="transparent" v-model="tab">
      <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="content1" :ripple="false" />
      <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="content2" :ripple="false" />
    </q-tabs>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('content1')
</script>
