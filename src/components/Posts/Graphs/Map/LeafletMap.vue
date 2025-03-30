<template>
  <div class="map-container">
    <div class="map-controls">
      <q-select
        v-model="selectedDataType"
        :options="dataOptions"
        label="Filter By"
        outlined
        dense
        class="q-select-class"
        data-test="filter-select"
      />
      <q-btn :label="isStatsVisible ? 'Hide Stats' : 'Show Stats'" color="primary" @click="toggleStats" data-test="toggle-stats" />
    </div>

    <div class="stats-section" :class="{ 'stats-visible': isStatsVisible }">
      <div class="total-countries">
        <div>
          <q-icon name="public" size="sm" class="q-mr-sm text-primary" />
          Total Countries Participated:
          <span style="color: #e54757">{{ totalCountriesParticipated }}</span>
        </div>
        <div>
          <q-icon name="analytics" size="sm" class="q-mr-sm text-primary" />
          Total Countries by
          <span style="font-weight: 600">{{ selectedDataType.label }}:</span>
          <span style="color: #e54757">{{ ' ' }}{{ totalCountries }}</span>
        </div>
      </div>

      <div class="overall-stats">
        Country with most participants:
        <span style="font-weight: 600">{{ countryWithMostParticipants.country }}</span>
        <span style="font-weight: 600">{{ ' ' }}{{ countryWithMostParticipants.icon }}</span>
        <div
          style="font-weight: 400; font-size: 13px; display: flex; gap: 4px"
          v-if="
            countryWithMostParticipants.totalComments ||
            countryWithMostParticipants.totalLikes ||
            countryWithMostParticipants.totalDislikes ||
            countryWithMostParticipants.totalShares
          "
        >
          <span class="text-weight-medium text-primary">Comments: {{ countryWithMostParticipants.totalComments }}</span>
          <span class="text-weight-medium text-primary">Likes: {{ countryWithMostParticipants.totalLikes }}</span>
          <span class="text-weight-medium text-primary">Dislikes: {{ countryWithMostParticipants.totalDislikes }}</span>
          <span class="text-weight-medium text-primary">Shares: {{ countryWithMostParticipants.totalShares }}</span>
        </div>
      </div>
    </div>

    <div id="map" @mousedown.stop.prevent @touchstart="handleTouchStart"></div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, toRaw, watch, watchEffect } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStatStore } from 'src/stores'
import { handleComments, handleLikesAndDislikes, handleShares } from 'components/Posts/Graphs/Map/handlingFunctions'
import { countries } from 'components/Posts/Graphs/Map/countries'

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

const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const totalCountriesParticipated = computed(() => {
  return new Set(allInteractions.map((entry) => entry.location)).size
})

const countryWithMostParticipants = computed(() => {
  const maxCountryCode = allInteractions.reduce(
    (maxCountry, entry) => {
      const totalParticipation = entry.comments + entry.interactions.likes + entry.interactions.dislikes + entry.shares
      if (totalParticipation > maxCountry.participation) {
        return {
          country: entry.location,
          participation: totalParticipation,
          totalComments: entry.comments,
          totalLikes: entry.interactions.likes,
          totalDislikes: entry.interactions.dislikes,
          totalShares: entry.shares
        }
      }

      return maxCountry
    },
    { country: null, participation: 0 }
  )
  const icon = getFlagEmoji(maxCountryCode.country)

  const allEqual = allInteractions.every((entry) => {
    const totalParticipations = entry.comments + entry.interactions.likes + entry.interactions.dislikes + entry.shares
    return totalParticipations === maxCountryCode.participation
  })

  if (allEqual && allInteractions.length > 1) {
    return { country: 'Equal participation. 🌍' }
  }
  return {
    country: countries.find((country) => country.code === maxCountryCode.country)?.country,
    icon,
    totalLikes: maxCountryCode.totalLikes,
    totalDislikes: maxCountryCode.totalDislikes,
    totalShares: maxCountryCode.totalShares,
    totalComments: maxCountryCode.totalComments
  }
})

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

const isStatsVisible = ref(false)

const toggleStats = () => {
  isStatsVisible.value = !isStatsVisible.value
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

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.stats-section {
  position: absolute;
  top: 60px;
  left: 10px;
  z-index: 3;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  opacity: 0;
  pointer-events: none;
}

.stats-section.stats-visible {
  max-height: 200px;
  opacity: 1;
  pointer-events: auto;
}

#map {
  height: 80vh;
  border-radius: 10px;
  touch-action: none;

  @media (max-width: 720px) {
    height: 60vh;
  }
}

.q-select-class {
  width: 200px;
  background-color: white;

  @media (max-width: 720px) {
    width: 170px;
  }
}

.q-select-class > :first-child > :first-child {
  background-color: white !important;
}

.total-countries {
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  padding: 5px 12px;
  background-color: white;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.total-countries:hover {
  border-color: #000000;
}

.overall-stats {
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  padding: 5px 12px;
  background-color: white;
}
.overall-stats:hover {
  border-color: #000000;
}

@media (min-width: 1024px) {
  .row > .col-md-6 {
    height: auto;
    width: 49%;
    padding: 10px;
  }
}
</style>
