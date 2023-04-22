<template>
  <q-carousel
    animated
    arrows
    control-color="primary"
    height="auto"
    navigation-icon="radio_button_unchecked"
    navigation
    padding
    swipeable
    transition-prev="jump-right"
    transition-next="jump-left"
    v-model="slide"
  >
    <q-carousel-slide v-for="(art, index) in arts" :key="index" :name="index">
      <q-card flat>
        <q-img :src="art.img" />
        <q-card-section v-if="art.label" style="white-space: pre-line">
          {{ art.label }}
        </q-card-section>
      </q-card>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  art: { type: Object, required: true, default: () => {} }
})

const slide = ref(0)

const arts = [
  { img: 'https://cdn.quasar.dev/img/parallax1.jpg' },
  { img: 'https://cdn.quasar.dev/img/parallax2.jpg' },
  { img: 'https://cdn.quasar.dev/img/mountains.jpg' },
  {
    label:
      'Sheldon Cooper\nLorem ipsum dolor sit amet consectetur adipisicing elit. Molestias perferendis labore magni vel modi porro illo impedit. Ad doloremque cupiditate, eius placeat dignissimos a rem, recusandae, inventore saepe quam voluptatem.',
    img: 'https://s2.glbimg.com/Ds5qBNuEIfW38uAbmEDlNPgXxfc=/smart/e.glbimg.com/og/ed/f/original/2016/09/23/sheldon.jpg'
  }
]
</script>
