<template>
  <q-header class="bg-white" elevated>
    <q-toolbar class="q-px-lg">
      <q-toolbar-title>
        <b class="text-secondary">Search Archive</b>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
    <q-toolbar>
      <q-toolbar-title>
        <q-input class="q-pb-lg q-px-lg" dense label="Search" rounded standout v-model="search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md">
    <q-scroll-area :thumb-style="{ display: 'none' }" style="height: 4.5rem">
      <q-btn-toggle
        v-model="category"
        class="q-mb-sm q-mt-lg"
        color="white"
        no-caps
        rounded
        unelevated
        text-color="secondary"
        :options="categories"
      />
    </q-scroll-area>
    <q-separator class="q-mb-md q-mt-xs" />
    {{ categories.find((c) => c.value === category).label }}
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')
const category = ref('trending')

const categories = ref([
  { label: 'Trending', value: 'trending' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Culture', value: 'culture' },
  { label: 'Sports', value: 'sports' },
  { label: 'Politics', value: 'politics' },
  { label: 'Business', value: 'business' },
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' }
])
</script>

<style lang="scss">
.q-btn-group > .q-btn-item {
  border: 1px solid;
  border-radius: 24px !important;
  margin-right: 0.5rem;
}
</style>
