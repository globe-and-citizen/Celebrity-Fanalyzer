<template>
  <v-chart autoresize class="chart" data-test="shares-pie" :option="option" style="height: 40vh" />
</template>

<script setup>
import { PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { monthDayYear } from 'src/utils/date'
import { groupInfoByMonth, groupInfoByWeek } from 'src/utils/stats'
import { ref, watchEffect } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps(['data', 'interval'])

const dates = ref([])
const option = ref({})
const platforms = [
  { name: 'Clipboard', color: '#777777' },
  { name: 'Discord', color: '#7289DA' },
  { name: 'Facebook', color: '#4267B2' },
  { name: 'LinkedIn', color: '#0072B1' },
  { name: 'Odnoklassniki', color: '#ED812B' },
  { name: 'Pinterest', color: '#E60023' },
  { name: 'Reddit', color: '#FF8700' },
  { name: 'Telegram', color: '#0088CC' },
  { name: 'X', color: '#000000' },
  { name: 'WhatsApp', color: '#25D366' }
]
const shares = ref([])

function compute() {
  option.value = {
    title: {
      text: `${props.data.length} Shares`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: dates.value
    },
    yAxis: {
      type: 'value'
    },
    series: shares.value
  }
}

function groupSharesByDate(data) {
  // Group shares by date
  const sharesByDate = data.reduce((acc, item) => {
    const date = monthDayYear(item.createdAt)
    const sharedOn = item.sharedOn

    if (acc[date]) {
      acc[date][sharedOn] = (acc[date][sharedOn] || 0) + 1
    } else {
      acc[date] = { [sharedOn]: 1 }
    }

    return acc
  }, {})

  // Convert the object to an array of objects with dates as keys and shares as values
  const groupedSharesByDate = Object.entries(sharesByDate)
    .map(([date, shares]) => ({ [date]: shares }))
    .sort((a, b) => new Date(Object.keys(a)[0]) - new Date(Object.keys(b)[0]))

  // Fill in missing dates between the first date and today
  const uniqueDates = new Set(groupedSharesByDate.map((item) => Object.keys(item)[0]))
  const today = new Date()
  const firstDate = groupedSharesByDate[0] ? Object.keys(groupedSharesByDate[0])[0] : null
  const startDate = firstDate ? new Date(firstDate) : null

  for (let currentDate = startDate; currentDate <= today; currentDate.setDate(currentDate.getDate() + 1)) {
    const formattedDate = currentDate.toLocaleDateString('en-US')

    if (!uniqueDates.has(formattedDate)) {
      groupedSharesByDate.push({ [formattedDate]: {} })
      uniqueDates.add(formattedDate)
    }
  }

  // Sort the array by date
  groupedSharesByDate.sort((a, b) => new Date(Object.keys(a)[0]) - new Date(Object.keys(b)[0]))

  return groupedSharesByDate
}

watchEffect(() => {
  if (!props.data.length) return

  let info = groupSharesByDate(props.data)

  if (props.interval === 'weekly') {
    info = groupInfoByWeek(info)
  }
  if (props.interval === 'monthly') {
    info = groupInfoByMonth(info)
  }

  dates.value = info.map((obj) => Object.keys(obj)[0])
  shares.value = platforms
    .map((platform) => ({
      name: platform.name,
      type: 'bar',
      stack: 'Total',
      data: info.map((obj) => Object.values(obj)[0][platform.name.toLowerCase()] || 0),
      color: platform.color
    }))
    .filter((platform) => platform.data.some((value) => value > 0))

  compute()
})
</script>
