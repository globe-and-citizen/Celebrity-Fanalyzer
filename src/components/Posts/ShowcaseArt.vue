<template>
  <q-carousel
    animated
    arrows
    control-color="primary"
    height="auto"
    navigation-active-icon="radio_button_checked"
    navigation-icon="radio_button_unchecked"
    navigation
    padding
    swipeable
    transition-prev="jump-right"
    transition-next="jump-left"
    v-model="slide"
  >
    <q-carousel-slide v-for="(art, index) in showcase?.arts" :key="index" :name="index">
      <q-img class="rounded-borders" :src="art" />
    </q-carousel-slide>
    <q-carousel-slide :name="showcase?.arts.length + 1">
      <q-card flat>
        <q-card-section class="row" style="white-space: pre-line">
          <q-img class="col-6 rounded-borders" :src="showcase.artist.photo" />
          <p class="col-6 q-px-md">{{ showcase.artist.info }}</p>
        </q-card-section>
      </q-card>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  showcase: { type: Object, required: true, default: () => {} }
})

const slide = ref(0)
</script>
