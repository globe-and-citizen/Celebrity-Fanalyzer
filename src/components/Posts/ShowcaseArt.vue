<template>
  <q-separator inset />
  <div class="q-gutter-xs q-pa-md text-center" @click="openDialog = true">
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
    <q-img class="art-img" fit="cover" :ratio="1" :src="showcase.artist.photo" width="6.5rem" @click="slide = showcase?.arts.length" />
  </div>

  <q-dialog :seamless="true" position="top" v-model="openDialog">
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
        <q-img class="rounded-borders" fit="contain" :src="art"/>
        <q-btn @click="openDialog = null">Buytton</q-btn>
      </q-carousel-slide>
      <q-carousel-slide class="q-pa-none row" :name="showcase?.arts.length">
        <q-img class="col-sm-6 col-xs-12 rounded-borders" :src="showcase.artist.photo" />
        <p class="col-sm-6 col-xs-12 flex items-center q-pa-md" style="white-space: pre-line">{{ showcase.artist.info }}</p>
      </q-carousel-slide>
    </q-carousel>
  </q-dialog>
</template>

<script setup>
import { onUnmounted, onBeforeUnmount , ref } from 'vue'

defineProps({
  showcase: { type: Object, required: true, default: () => {} }
})

const carouselRef = ref(null)
const openDialog = ref(false)
const slide = ref(0)

document.addEventListener('keyup', handleKeyPress)

function handleKeyPress(e) {
  const event = (window.event ??= e)
  if (event.key === 'ArrowLeft') carouselRef.value.previous()
  if (event.key === 'ArrowRight') carouselRef.value.next()
}

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyPress)
  openDialog.value = false
  console.log(openDialog.value);
})

// if(openDialog.value = false) {
//   document.addEventListener('click', function() {
//     openDialog.value = true
//   });
// } else {
//   document.addEventListener('click', function() {
//     openDialog.value = false
//   });
// }
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
/*.q-dialoginner{
  pointer-events: auto !important;
  background: rgba(0,0,0,0.4);
  position: absolute;
  width: 100%!important;
  height: 100%!important;
} */
</style>
