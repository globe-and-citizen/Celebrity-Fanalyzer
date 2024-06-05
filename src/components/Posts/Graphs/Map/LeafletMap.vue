<template>
  <q-select v-model="selectedDataType" :options="dataOptions" label="Filter By" outlined dense class="q-mb-lg q-select-class" />
  <div id="map" @mousedown.stop.prevent></div>
</template>

<script setup>
import { nextTick, onMounted, ref, toRaw, watch, watchEffect } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePromptStore, useStatStore, useUserStore } from 'src/stores'
import { handleComments, handleLikesAndDislikes } from 'components/Posts/Graphs/Map/handlingFunctions'

const userStore = useUserStore()
const statStore = useStatStore()
const promptStore = usePromptStore()
const mapRef = ref(null)

const interactionsExists = statStore.getAllInteractionsByCountry?.response.some((el) => el.interactions?.likes || el.interactions?.dislikes)
const commentsExists = statStore.getAllInteractionsByCountry?.response.some((el) => el.comments)
const selectedDataType = ref(
  interactionsExists ? { label: 'Likes and dislikes', value: 'interactions' } : { label: 'Comments', value: 'comments' }
)

const initialDataOptions = [
  { label: 'Likes and dislikes', value: 'interactions' },
  { label: 'Comments', value: 'comments' }
]

const dataOptions = ref(
  initialDataOptions.filter(
    (option) => (option.value === 'interactions' && interactionsExists) || (option.value === 'comments' && commentsExists)
  )
)

const updateDataOptions = () => {
  dataOptions.value = initialDataOptions.filter(
    (option) => (option.value === 'interactions' && interactionsExists) || (option.value === 'comments' && commentsExists)
  )

  if (!dataOptions.value.some((option) => option.value === selectedDataType.value.value)) {
    selectedDataType.value = dataOptions.value[0] || null
  }
}

// Map initialization
const initMap = async () => {
  if (statStore.getAllInteractionsByCountry?.response && Object.keys(statStore.getAllInteractionsByCountry?.response).length) {
    await nextTick()

    if (toRaw(mapRef.value)) {
      toRaw(mapRef.value).eachLayer((layer) => {
        toRaw(mapRef.value).removeLayer(layer)
      })
    } else {
      mapRef.value = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
        maxBoundsViscosity: 0
      })
    }

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 10,
      minZoom: 3
    }).addTo(toRaw(mapRef.value))
    const bounds = [
      [-85, -180],
      [85, 180]
    ]

    toRaw(mapRef.value).setMaxBounds(bounds)
    toRaw(mapRef.value).fitBounds(bounds)
    if (selectedDataType.value.value === 'interactions') {
      if (interactionsExists) {
        handleLikesAndDislikes(statStore.getAllInteractionsByCountry.response, mapRef)
      }
    } else {
      if (commentsExists) {
        handleComments(statStore.getAllInteractionsByCountry.response, mapRef)
      }
    }

    window.addEventListener('resize', () => {
      toRaw(mapRef.value).invalidateSize()
    })
  }
}

onMounted(async () => {})

watchEffect(() => {
  if (statStore.getAllInteractionsByCountry?.response) {
    updateDataOptions()
    initMap()
  }
})

watch(selectedDataType, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await initMap()
  }
})

watch(
  () => statStore.getAllInteractionsByCountry?.response,
  () => {
    updateDataOptions()
    initMap()
  }
)
</script>

<style>
#map {
  height: 80vh;
  border-radius: 20px;
}

.q-select-class {
  width: 20%;
  position: absolute;
  z-index: 3;
  top: 10px;
  left: 10px;

  @media (max-width: 1024px) {
    width: 60%;
  }
}

.q-select-class > :first-child > :first-child {
  background-color: white !important;
}

@media (min-width: 1024px) {
  .row > .col-md-6 {
    height: auto;
    width: 49%;
    padding: 10px;
  }
}
</style>
