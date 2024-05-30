<template>
  <v-chart autoresize class="chart" :option="option" />
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { BarChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { groupInfoByWeek, groupInfoByMonth } from 'src/utils/stats'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent])

const props = defineProps({
  interval: {
    type: String,
    default: () => 'daily'
  },
  impressionsData: {
    type: Array,
    default: () => []
  },
  clicksData: {
    type: Array,
    default: () => []
  }
})

const countClicks = ref(0)
const countImpressions = ref(0)
const dates = ref([])
const option = ref({})
const clicks = ref(0)
const impressions = ref(0)

function compute() {
  option.value = {
    title: {
      text: `${countClicks.value} Clicks & ${countImpressions.value} Impressions`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Clicks', 'Impressions'],
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
        name: 'Clicks',
        type: 'bar',
        data: clicks.value,
        color: 'rgb(255, 99, 132)'
      },
      {
        name: 'Impressions',
        type: 'bar',
        data: impressions.value,
        color: 'rgb(54, 162, 235)'
      }
    ]
  }
}

const transformData = (data) => {
  const uniqueDatesSet = new Set()
  const clickedMap = new Map()
  const impressionsMap = new Map()

  data.clicks.forEach((element) => {
    const date = element.id.replaceAll('-', '/')
    clickedMap.set(date, Number(element.clicked))
    uniqueDatesSet.add(date)
  })
  data.impressions.forEach((element) => {
    const date = element.id.replaceAll('-', '/')
    impressionsMap.set(date, Number(element.impression))
    uniqueDatesSet.add(date)
  })

  if (data.impressions.length > 0) {
    const today = new Date()
    const firstDate = new Date(data.impressions[0].id.replaceAll('-', '/'))

    let currentDate = new Date(firstDate)

    while (currentDate <= today) {
      const formattedDate = currentDate.toLocaleDateString('en-US')
      if (!uniqueDatesSet.has(formattedDate)) {
        uniqueDatesSet.add(formattedDate)
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  const unique = [...uniqueDatesSet].sort((a, b) => new Date(a) - new Date(b))

  return unique.map((date) => {
    const impressionsCount = impressionsMap.get(date) ?? 0
    const clickedCount = clickedMap.get(date) ?? 0
    return { [date]: { impressions: impressionsCount, clicks: clickedCount } }
  })
}
watchEffect(() => {
  let info = transformData({
    impressions: props.impressionsData,
    clicks: props.clicksData
  })

  if (props.interval === 'weekly') {
    info = groupInfoByWeek(info)
  }
  if (props.interval === 'monthly') {
    info = groupInfoByMonth(info)
  }

  dates.value = info.map((obj) => Object.keys(obj)[0])
  impressions.value = info.map((obj) => Object.values(obj)[0].impressions)
  clicks.value = info.map((obj) => Object.values(obj)[0].clicks)
  countClicks.value = clicks.value.reduce((acc, cur) => acc + cur, 0)
  countImpressions.value = impressions.value.reduce((acc, cur) => acc + cur, 0)
  compute()
})
</script>
<style scoped>
.chart {
  height: 40vh;
}
</style>
