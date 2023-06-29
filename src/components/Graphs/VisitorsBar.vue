<template>
  <v-chart autoresize class="chart" :option="option" style="height: 40vh" />
</template>

<script setup>
import { BarChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, watchEffect } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent])

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
      trigger: 'item'
    },
    legend: {
      data: ['Visitors', 'Visits'],
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
        name: 'Visitors',
        type: 'bar',
        data: visitors.value,
        color: '#48982a'
      },
      {
        name: 'Visits',
        type: 'bar',
        data: visits.value,
        color: 'blue'
      }
    ]
  }
}

const intervalFunctions = {
  day: (date, now) => date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  week: (date, now) => date >= new Date(now.setDate(now.getDate() - now.getDay())),
  all: () => true
}

function getDates(data) {
  const today = new Date()
  const startDate = new Date(Math.min(...data.map((item) => new Date(item.visits[0]))))
  const dates = []

  for (let date = startDate; date <= today; date.setDate(date.getDate() + 1)) {
    dates.push(date.toLocaleDateString('en-US'))
  }

  return dates
}

function getVisitors(data, dates) {
  const visitors = Array(dates.length).fill(0)

  data.forEach((item) => {
    const index = dates.indexOf(item.visits[0])
    if (index !== -1) {
      visitors[index]++
    }
  })

  return visitors
}

function getVisits(data, dates) {
  const visitsMap = data.reduce((acc, item) => {
    item.visits.forEach((date) => {
      if (dates.includes(date)) {
        acc[date] = (acc[date] || 0) + 1
      }
    })
    return acc
  }, {})

  return dates.map((date) => visitsMap[date] || 0)
}

watchEffect(() => {
  if (!props.data) return

  dates.value = getDates(props.data)
  visitors.value = getVisitors(props.data, dates.value)
  visits.value = getVisits(props.data, dates.value)

  countVisitors.value = visitors.value.reduce((acc, cur) => acc + cur)
  countVisits.value = visits.value.reduce((acc, cur) => acc + cur)

  compute()
})
</script>
