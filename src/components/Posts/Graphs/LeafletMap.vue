<template>
  <div id="map" @mousedown.stop.prevent></div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import UsStates from './us-states.json'

const initMap = async () => {
  await nextTick()

  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([33.1351425, -117.2663035], 4) // Adjusted zoom level

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    minZoom: 3
  }).addTo(map)

  const geoJSONLayersRef = []

  const colors = ['#62EBCD', '#62EBCD', '#ADF4E5', '#2DA38A', '#87EFD9']
  geoJSONLayersRef.forEach((layer) => {
    map.removeLayer(layer)
  })

  const geoJSONLayer = L.geoJSON(UsStates, {
    style: function (feature) {
      const randomIndex = Math.floor(Math.random() * colors.length)
      const randomColor = colors[randomIndex]

      return {
        color: 'white',
        stroke: 'white',
        fill: true,
        fillColor: randomColor,
        weight: 1,
        fillOpacity: 0.8
      }
    }
  })

  geoJSONLayer.addTo(map)

  geoJSONLayersRef.push(geoJSONLayer)

  window.addEventListener('resize', () => {
    map.invalidateSize()
  })

  const markers = [
    {
      coordinates: [37.7749, -122.4194],
      popupContent: 'San Francisco - 100 users'
    },
    {
      coordinates: [34.0522, -118.2437],
      popupContent: 'Los Angeles'
    }
  ]

  markers.forEach((marker) => {
    L.marker(marker.coordinates).addTo(map).bindPopup(marker.popupContent)
  })
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 40vh;
  border-radius: 20px;
}
</style>
