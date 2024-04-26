<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { BarChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { monthDayYear } from 'src/utils/date'
import { groupInfoByMonth, groupInfoByWeek } from 'src/utils/stats'
import { ref, watchEffect } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps(['data', 'interval'])

const countLikes = ref(0)
const countDislikes = ref(0)
const dates = ref([])
const dislikes = ref([])
const likes = ref([])
const option = ref({})

function compute() {
  option.value = {
    title: {
      text: `${countLikes.value} Likes & ${countDislikes.value} Dislikes`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Likes', 'Dislikes'],
      bottom: '1%'
    },
    xAxis: {
      type: 'category',
      data: dates.value
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Likes',
        type: 'bar',
        stack: 'Total',
        data: likes.value,
        color: '#48982a'
      },
      {
        name: 'Dislikes',
        type: 'bar',
        stack: 'Total',
        data: dislikes.value,
        color: '#ea3423'
      }
    ]
  }
}

function groupLikesAndDislikesByDate(data) {
  const likes = data.likes
  const dislikes = data.dislikes

  const likesByDate = likes.reduce((acc, item) => {
    const date = monthDayYear(item.createdAt)
    if (acc[date]) {
      acc[date].likes = (acc[date].likes || 0) + 1
    } else {
      acc[date] = { likes: 1 }
    }
    return acc
  }, {})

  const dislikesByDate = dislikes.reduce((acc, item) => {
    const date = monthDayYear(item.createdAt)
    if (acc[date]) {
      acc[date].dislikes = (acc[date].dislikes || 0) + 1
    } else {
      acc[date] = { dislikes: 1 }
    }
    return acc
  }, {})

  const mergedResult = []

  const allDates = new Set([...Object.keys(likesByDate), ...Object.keys(dislikesByDate)])

  allDates.forEach((date) => {
    mergedResult.push({
      [date]: {
        likes: likesByDate[date] ? likesByDate[date].likes : 0,
        dislikes: dislikesByDate[date] ? -dislikesByDate[date].dislikes : 0
      }
    })
  })

  mergedResult.sort((a, b) => {
    const dateA = Object.keys(a)[0]
    const dateB = Object.keys(b)[0]
    return new Date(dateA) - new Date(dateB)
  })

  // Generate missing dates between the first provided date and today's date
  const uniqueDates = new Set(mergedResult.map((item) => Object.keys(item)[0]))
  const today = new Date()
  const firstDate = mergedResult[0] ? Object.keys(mergedResult[0])[0] : null
  const startDate = firstDate ? new Date(firstDate) : null
  console.log(props.data)
  for (let currentDate = startDate; currentDate <= today; currentDate.setDate(currentDate.getDate() + 1)) {
    const formattedDate = currentDate.toLocaleDateString('en-US')

    if (!uniqueDates.has(formattedDate)) {
      mergedResult.push({ [formattedDate]: {} })
      uniqueDates.add(formattedDate)
    }
  }

  // Sort the array by date
  mergedResult.sort((a, b) => new Date(Object.keys(a)[0]) - new Date(Object.keys(b)[0]))
  return mergedResult
}

watchEffect(() => {
  if (!props.data) return

  let info = groupLikesAndDislikesByDate(props.data)

  if (props.interval === 'weekly') {
    info = groupInfoByWeek(info)
  }
  if (props.interval === 'monthly') {
    info = groupInfoByMonth(info)
  }

  dates.value = info.map((obj) => Object.keys(obj)[0])
  likes.value = info.map((obj) => Object.values(obj)[0].likes || 0)
  dislikes.value = info.map((obj) => {
    const dislikesValue = Object.values(obj)[0].dislikes || 0
    return dislikesValue < 0 ? -dislikesValue : dislikesValue
  })

  countLikes.value = likes.value.reduce((acc, item) => acc + item, 0)
  countDislikes.value = dislikes.value.reduce((acc, item) => acc + item, 0)

  compute()
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
