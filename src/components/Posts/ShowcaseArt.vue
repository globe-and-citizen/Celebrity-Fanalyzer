<template>
  <q-section class="q-pa-md">
    <q-img class="cursor-pointer" fit="contain" :src="showcase?.arts[0]" width="50%" @click="openDialog = true" />
    <q-dialog position="top" v-model="openDialog">
      <q-card style="width: 50rem; max-width: 90vw">
        <q-carousel
          animated
          control-color="primary"
          height="50vh"
          navigation-active-icon="radio_button_checked"
          navigation-icon="radio_button_unchecked"
          navigation
          swipeable
          transition-prev="jump-right"
          transition-next="jump-left"
          v-model="slide"
        >
          <q-carousel-slide v-for="(art, index) in showcase?.arts" class="flex justify-center q-pa-none" :key="index" :name="index">
            <q-img class="rounded-borders" fit="contain" :src="art" />
          </q-carousel-slide>
          <q-carousel-slide class="flex items-center justify-center" :name="showcase?.arts.length + 1">
            <q-card flat>
              <q-card-section class="row" style="white-space: pre-line">
                <q-img class="col-sm-6 col-xs-12 rounded-borders" :src="showcase.artist.photo" />
                <p class="col-sm-6 col-xs-12 q-px-md">{{ showcase.artist.info }}</p>
              </q-card-section>
            </q-card>
          </q-carousel-slide>
        </q-carousel>
      </q-card>
    </q-dialog>
  </q-section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  showcase: { type: Object, required: true, default: () => {} }
})

const openDialog = ref(false)
const slide = ref(0)
</script>
