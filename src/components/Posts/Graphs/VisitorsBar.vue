<template>
  <v-chart autoresize class="chart" :option="option" style="height: 40vh" />
</template>

<script setup>
import { BarChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { groupInfoByWeek, groupInfoByMonth } from 'src/utils/stats'
import { ref, watchEffect } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps(['data', 'interval'])

const countVisitors = ref(0)
const countVisits = ref(0)
const dates = ref([])
const option = ref({})
const visitors = ref(0)
const visits = ref(0)

function compute() {
  option.value = {
    title: {
      text: `${countVisitors.value} Visitors & ${countVisits.value} Visits`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Unique Visitors', 'Visits'],
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
        name: 'Unique Visitors',
        type: 'bar',
        data: visitors.value,
        color: '#ffd0c6'
      },
      {
        name: 'Visits',
        type: 'bar',
        data: visits.value,
        color: '#838eb1'
      }
    ]
  }
}

const transformData = (data) => {
  const uniqueDates = []

  // Extract all unique dates from the objects in the data array
  data.forEach((item) => {
    if (Array.isArray(item.visits)) {
      item.visits.forEach((date) => {
        if (!uniqueDates.includes(date)) {
          uniqueDates.push(date)
        }
      })
    }
  })

  const today = new Date()
  const firstDate = new Date(uniqueDates[0])

  const currentDate = new Date(firstDate)

  // Generate missing dates between the first provided date and today's date
  while (currentDate <= today) {
    const formattedDate = currentDate.toLocaleDateString('en-US')
    if (!uniqueDates.includes(formattedDate)) {
      uniqueDates.push(formattedDate)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sort the dates in ascending order
  uniqueDates.sort((a, b) => new Date(a) - new Date(b))

  return uniqueDates.map((date) => {
    // Count the number of items with the first visit on the current date
    const visitorsCount = data.filter((item) => item.visits[0] === date).length

    // Count the number of items that contain the current date in their visits
    const visitsCount = data.filter((item) => item.visits.includes(date)).length

    return { [date]: { visitors: visitorsCount, visits: visitsCount } }
  })
}

watchEffect(() => {
  if (!props.data) return

  let info = transformData(props.data)

  if (props.interval === 'weekly') {
    info = groupInfoByWeek(info)
  }
  if (props.interval === 'monthly') {
    info = groupInfoByMonth(info)
  }

  dates.value = info.map((obj) => Object.keys(obj)[0])
  visitors.value = info.map((obj) => Object.values(obj)[0].visitors)
  visits.value = info.map((obj) => Object.values(obj)[0].visits)

  countVisitors.value = visitors.value.reduce((acc, cur) => acc + cur, 0)
  countVisits.value = visits.value.reduce((acc, cur) => acc + cur, 0)

  compute()
})
</script>
