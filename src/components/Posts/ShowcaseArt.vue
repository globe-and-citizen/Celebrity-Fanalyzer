<template>
  <q-separator inset />
  <div class="q-gutter-xs q-pa-md text-center" ref="excludedDiv" @click.stop="openDialog = true">
    <q-img
      v-for="(art, index) in showcase?.arts"
      class="art-img"
      fit="cover"
      :key="index"
      :ratio="1"
      :src="art"
      width="6.5rem"
      @click="slide = index"
    />
    <q-img
      v-if="showcase.artist.info"
      class="art-img"
      fit="cover"
      :ratio="1"
      :src="showcase.artist.photo"
      width="6.5rem"
      @click="slide = showcase?.arts.length"
    />
  </div>

  <q-dialog position="top" ref="dialogRef" seamless style="background-color: rgba(0, 0, 0, 0.4) !important" v-model="openDialog">
    <q-carousel
      animated
      control-color="primary"
      height="auto"
      ref="carouselRef"
      style="max-height: 100%; max-width: 90vw; width: 50rem"
      swipeable
      transition-prev="jump-right"
      transition-next="jump-left"
      v-model="slide"
    >
      <q-carousel-slide v-for="(art, index) in showcase?.arts" class="flex justify-center q-pa-none" :key="index" :name="index">
        <q-img class="rounded-borders" fit="contain" :src="art" />
      </q-carousel-slide>
      <q-carousel-slide v-if="showcase.artist.info" class="q-pa-none row" :name="showcase?.arts.length">
        <q-img class="col-sm-6 col-xs-12 rounded-borders" :src="showcase.artist.photo" />
        <p class="col-sm-6 col-xs-12 flex items-center q-pa-md">{{ showcase.artist.info }}</p>
      </q-carousel-slide>
    </q-carousel>
  </q-dialog>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'

defineProps({
  showcase: { type: Object, required: true, default: () => {} }
})

const carouselRef = ref(null)
const dialogRef = ref(false)
const openDialog = ref(false)
const slide = ref(0)

const handleClickOutside = (event) => {
  openDialog.value = false
}

watchEffect(() => {
  if (openDialog.value) {
    window.addEventListener('click', handleClickOutside)
  } else {
    window.removeEventListener('click', handleClickOutside)
  }
})

onMounted(() => {
  document.addEventListener('keyup', handleKeyPress)
})

function handleKeyPress(e) {
  const event = (window.event ??= e)
  if (event.key === 'ArrowLeft') carouselRef.value.previous()
  if (event.key === 'ArrowRight') carouselRef.value.next()
}

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyPress)
})
</script>

<style lang="scss" scoped>
.art-img {
  cursor: pointer;
  filter: grayscale(100%);
  transition: filter 0.3s ease-in-out;
}

.art-img:hover {
  filter: grayscale(0%);
}

p {
  margin-bottom: 0 !important;
}
</style>
