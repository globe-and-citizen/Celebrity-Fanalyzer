<template>
  <q-select v-model="selectedDataType" :options="dataOptions" label="Filter By" outlined dense class="q-mb-lg q-select-class" />
  <div class="total-countries">
    Total Countries Analyzed:
    <span style="color: #e54757">{{ totalCountries }}</span>
  </div>
  <div id="map" @mousedown.stop.prevent @touchstart="handleTouchStart"></div>
</template>

<script setup>
import { nextTick, ref, toRaw, watch, watchEffect } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStatStore } from 'src/stores'
import { handleComments, handleLikesAndDislikes, handleShares } from 'components/Posts/Graphs/Map/handlingFunctions'

const statStore = useStatStore()
const mapRef = ref(null)
const totalCountries = ref(0)

const allInteractions = statStore.getAllInteractionsByCountry?.response
const interactionsExists = allInteractions?.some((el) => el.interactions?.likes || el.interactions?.dislikes)
const commentsExists = allInteractions?.some((el) => el.comments)
const sharesExist = allInteractions?.some((el) => el.shares)
const selectedDataType = ref(
  interactionsExists
    ? { label: 'Likes and dislikes', value: 'interactions' }
    : commentsExists
      ? { label: 'Comments', value: 'comments' }
      : { label: 'Shares', value: 'shares' }
)

const initialDataOptions = [
  { label: 'Likes and dislikes', value: 'interactions' },
  { label: 'Comments', value: 'comments' },
  { label: 'Shares', value: 'shares' }
]

const dataOptions = ref(
  initialDataOptions.filter(
    (option) =>
      (option.value === 'interactions' && interactionsExists) ||
      (option.value === 'comments' && commentsExists) ||
      (option.value === 'shares' && sharesExist)
  )
)

const updateDataOptions = () => {
  dataOptions.value = initialDataOptions.filter(
    (option) =>
      (option.value === 'interactions' && interactionsExists) ||
      (option.value === 'comments' && commentsExists) ||
      (option.value === 'shares' && sharesExist)
  )

  if (!dataOptions.value.some((option) => option.value === selectedDataType.value.value)) {
    selectedDataType.value = dataOptions.value[0] || null
  }
  updateTotalCountries()
}

const updateTotalCountries = () => {
  if (!allInteractions) return

  if (selectedDataType.value.value === 'interactions') {
    totalCountries.value = allInteractions.filter((el) => el.interactions?.likes || el.interactions?.dislikes).length
  } else if (selectedDataType.value.value === 'comments') {
    totalCountries.value = allInteractions.filter((el) => el.comments).length
  } else if (selectedDataType.value.value === 'shares') {
    totalCountries.value = allInteractions.filter((el) => el.shares).length
  }
}

// Map initialization
const initMap = async () => {
  if (allInteractions && Object.keys(allInteractions).length) {
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
    if (selectedDataType.value.value === 'interactions' && interactionsExists) {
      handleLikesAndDislikes(allInteractions, mapRef)
    } else if (selectedDataType.value.value === 'comments' && commentsExists) {
      handleComments(allInteractions, mapRef)
    } else if (selectedDataType.value.value === 'shares' && sharesExist) {
      handleShares(allInteractions, mapRef)
    }

    window.addEventListener('resize', () => {
      toRaw(mapRef.value).invalidateSize()
    })
  }
}

const handleTouchStart = (e) => {
  e.stopPropagation()
}

watchEffect(() => {
  if (allInteractions) {
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
  () => allInteractions,
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
  touch-action: none;

  @media (max-width: 720px) {
    height: 60vh;
  }
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

.total-countries {
  left: 10px;
  position: absolute;
  top: 60px;
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  padding: 5px 12px;
  background-color: white;
  z-index: 3;
  transition: all 0.6s;
}

.total-countries:hover {
  border-color: #000000;
}
</style>
