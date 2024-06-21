import { countries } from 'components/Posts/Graphs/Map/countries'
import L from 'leaflet'
import { toRaw } from 'vue'

export const handleLikesAndDislikes = (data, mapRef) => {
  if (!Array.isArray(data)) return

  const countryWithMostInteractions = data.reduce((prev, current) =>
    current.interactions.likes + current.interactions.dislikes > (prev?.interactions.likes + prev?.interactions.dislikes || 0)
      ? current
      : prev
  )

  const countryCoordinates = countries.find((country) => country.code === countryWithMostInteractions.location)?.coordinates
  if (countryCoordinates) {
    toRaw(mapRef.value).setView(countryCoordinates, 3)

    const minRadius = 40000
    data.forEach((countryData) => {
      const totalInteractions = countryData.interactions.likes + countryData.interactions.dislikes
      if (totalInteractions > 0) {
        const commentsLocation = countries.find((country) => country.code === countryData.location)?.country
        const popupContent = `Country: ${commentsLocation}<br>Total Likes: ${countryData.interactions.likes}<br>Total Dislikes: ${countryData.interactions.dislikes}`
        const calcRadius = Math.sqrt(totalInteractions / Math.PI) * 4000
        const radius = Math.max(calcRadius, minRadius)
        const circleOptions = {
          autoClose: false,
          closeOnClick: false,
          radius,
          fillOpacity: 0.5,
          color: '#e54757',
          fillColor: '#e54757',
          weight: 1.4
        }
        const countryCoordinates = countries.find((country) => country.code === countryData.location)?.coordinates

        if (countryCoordinates) {
          L.circle(countryCoordinates, circleOptions).addTo(toRaw(mapRef.value)).bindPopup(popupContent)
        }
      }
    })
  }
}

export const handleComments = (data, mapRef) => {
  if (!Array.isArray(data)) return
  const minRadius = 40000
  data.forEach((countryData) => {
    const commentsCount = countryData.comments || 0
    if (commentsCount > 0) {
      const commentsCoordinates = countries.find((country) => country.code === countryData.location)?.coordinates
      const commentsLocation = countries.find((country) => country.code === countryData.location)?.country
      if (commentsCoordinates) {
        const popupContent = `Country: ${commentsLocation}<br>Total Comments: ${commentsCount}`
        const calcRadius = Math.sqrt(commentsCount / Math.PI) * 4000
        const radius = Math.max(calcRadius, minRadius)
        const circleOptions = {
          radius,
          fillOpacity: 0.5,
          color: '#e54757',
          fillColor: '#e54757',
          weight: 1.4
        }
        toRaw(mapRef.value).setView(commentsCoordinates, 3)
        L.circle(commentsCoordinates, circleOptions).addTo(toRaw(mapRef.value)).bindPopup(popupContent)
      }
    }
  })
}

export const handleShares = (data, mapRef) => {
  if (!Array.isArray(data)) return
  const minRadius = 40000
  data.forEach((countryData) => {
    const sharesCount = countryData?.shares || 0
    if (sharesCount > 0) {
      const sharesCoordinates = countries.find((country) => country.code === countryData.location)?.coordinates
      const sharesLocation = countries.find((country) => country.code === countryData.location)?.country
      if (sharesCoordinates) {
        const popupContent = `Country: ${sharesLocation}<br>Total Shares: ${sharesCount}`
        const calcRadius = Math.sqrt(sharesCount / Math.PI) * 4000
        const radius = Math.max(calcRadius, minRadius)
        const circleOptions = {
          radius,
          fillOpacity: 0.5,
          color: '#e54757',
          fillColor: '#e54757',
          weight: 1.4
        }
        toRaw(mapRef.value).setView(sharesCoordinates, 3)
        L.circle(sharesCoordinates, circleOptions).addTo(toRaw(mapRef.value)).bindPopup(popupContent)
      }
    }
  })
}
