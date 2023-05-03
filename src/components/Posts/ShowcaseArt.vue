<template>
  <div class="q-gutter-xs q-pa-md text-center" @click="openDialog = true">
    <q-img
      v-for="(art, index) in showcase?.arts"
      img-class="art-img"
      fit="cover"
      :key="index"
      :ratio="1"
      :src="art"
      width="8rem"
      @click="slide = index"
    />
  </div>

  <q-dialog position="top" v-model="openDialog">
    <q-carousel
      animated
      control-color="primary"
      height="50vh"
      navigation-active-icon="radio_button_checked"
      navigation-icon="radio_button_unchecked"
      navigation
      style="width: 50rem; max-width: 90vw"
      swipeable
      transition-prev="jump-right"
      transition-next="jump-left"
      v-model="slide"
    >
      <q-carousel-slide v-for="(art, index) in showcase?.arts" class="flex justify-center q-pa-none" :key="index" :name="index">
        <q-img class="rounded-borders" fit="contain" :src="art" />
      </q-carousel-slide>
      <q-carousel-slide class="q-pa-none row" :name="showcase?.arts.length + 1">
        <q-img class="col-sm-6 col-xs-12 rounded-borders" :src="showcase.artist.photo" />
        <p class="col-sm-6 col-xs-12 flex items-center q-pa-md" style="white-space: pre-line">{{ showcase.artist.info }}</p>
      </q-carousel-slide>
    </q-carousel>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  showcase: { type: Object, required: true, default: () => {} }
})

const openDialog = ref(false)
const slide = ref(0)
</script>

<style>
.art-img {
  cursor: pointer;
  filter: grayscale(100%);
  transition: filter 0.3s ease-in-out;
}

.art-img:hover {
  filter: grayscale(0%);
}
</style>
