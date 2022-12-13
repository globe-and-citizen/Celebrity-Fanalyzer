<template>
  <div>
    <div class="col-8" v-if="prompt">
      <div class="flex items-center">
        <q-avatar size="2rem">
          <q-img :src="prompt.author.photoURL" />
        </q-avatar>
        <p class="q-mb-none q-ml-sm text-body1">
          {{ prompt.author.displayName?.length > 20 ? prompt.author.displayName.substring(0, 20) + '...' : prompt.author.displayName }}
        </p>
      </div>
      <h2 class="q-mb-none text-body1 text-bold">
        {{ prompt.title?.length > 40 ? prompt.title.substring(0, 40) + '...' : prompt.title }}
      </h2>
    </div>
    <q-separator class="full-width q-mt-md" />
    <BarChart />
  </div>
</template>

<script setup>
import BarChart from 'src/components/BarChart.vue'

const props = defineProps({
  prompt: {}
})
</script>
