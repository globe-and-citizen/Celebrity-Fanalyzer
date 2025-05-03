<template>
  <q-separator inset />
  <div class="q-gutter-xs q-pa-md text-center">
    <q-carousel
      id="dialog"
      @mousedown.stop.prevent
      animated
      control-color="primary"
      height="auto"
      ref="initialCarouselRef"
      style="max-height: 100%; touch-action: none"
      swipeable
      arrows
      :infinite="initialSlides.length > 1"
      transition-prev="jump-right"
      transition-next="jump-left"
      v-model="initialSlides"
    >
      <q-carousel-slide
        v-for="(art, index) in showcase?.arts"
        class="flex justify-center q-pa-none cursor-pointer"
        :key="index"
        :name="index"
        style="max-height: 450px"
      >
        <q-img class="rounded-borders" fit="contain" :src="art.preview ?? art" @click.stop="openDialog = true" />
      </q-carousel-slide>
      <q-carousel-slide
        v-if="showcase.artist?.info || !!showcase.artist?.preview"
        class="q-pa-none"
        :name="showcase?.arts.length"
        style="max-height: 450px"
      >
        <q-img
          v-if="showcase.artist.preview"
          class="col-sm-6 col-xs-12 rounded-borders"
          :src="showcase.artist.preview"
          @dblclick="openDialog = true"
        />
        <p v-if="showcase?.artist?.info" class="col-sm-6 col-xs-12 flex items-center q-pa-md">{{ showcase.artist.info }}</p>
      </q-carousel-slide>
    </q-carousel>
  </div>
  <q-dialog v-model="openDialog" ref="dialogRef" backdrop-filter="blur(4px)">
    <q-carousel
      animated
      control-color="primary"
      height="auto"
      ref="carouselRef"
      style="max-height: 100%; max-width: 90vw; width: 90rem"
      swipeable
      arrows
      infinite
      transition-prev="jump-right"
      transition-next="jump-left"
      v-model="slide"
    >
      <q-carousel-slide v-for="(art, index) in showcase?.arts" class="flex justify-center q-pa-none" :key="index" :name="index">
        <q-img class="rounded-borders fixed-image" fit="contain" :src="art.preview ?? art" />
      </q-carousel-slide>
      <q-carousel-slide v-if="showcase.artist?.info || !!showcase.artist?.preview" class="q-pa-none" :name="showcase?.arts.length">
        <q-img v-if="!!showcase.artist.preview" class="col-sm-6 col-xs-12 rounded-borders" :src="showcase.artist.preview" />
        <div v-if="showcase.artist.info" class="col-sm-6 col-xs-12 flex items-center q-px-xl q-py-md">
          <p style="width: 100%; padding: 8px">{{ showcase.artist.info }}</p>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </q-dialog>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  showcase: { type: Object, required: true, default: () => {} }
})

const carouselRef = ref(null)
const initialCarouselRef = ref(null)
const dialogRef = ref(false)
const openDialog = ref(false)
const slide = ref(0)
const initialSlides = ref(0)

onMounted(() => {
  document.addEventListener('keyup', handleKeyPress)
})

function handleKeyPress(e) {
  const event = e || window.event
  if (event.key === 'ArrowLeft') {
    if (openDialog.value) {
      carouselRef.value?.previous()
    } else {
      initialCarouselRef.value?.previous()
    }
  }
  if (event.key === 'ArrowRight') {
    if (openDialog.value) {
      carouselRef.value?.next()
    } else {
      initialCarouselRef.value?.next()
    }
  }
}

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyPress)
})
</script>

<style lang="scss" scoped>
.fixed-image {
  max-height: 450px;
  width: 100%;
  object-fit: contain;
}

.art-img {
  cursor: pointer;
  filter: grayscale(100%);
  transition: filter 0.3s ease-in-out;
}

#dialog::-webkit-scrollbar {
  display: none;
}

.art-img:hover {
  filter: grayscale(0%);
}

p {
  margin-bottom: 0 !important;
}
</style>
