<template>
  <v-chart class="chart" data-test="shares-pie" :option="option" autoresize />
</template>

<script setup>
import { PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { monthDayYear } from 'src/utils/date'
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
  { name: 'Twitter', color: '#1DA1F2' },
  { name: 'WhatsApp', color: '#25D366' }
]
const shares = ref([])
const sharesCount = ref(0)

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
      data: ['30 Jun', '1 Jul', '2 Jul', '3 Jul'] // dates.value
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Clipboard',
        type: 'bar',
        stack: 'Total',
        data: [120, 132, 101, 134],
        color: '#777777'
      },
      {
        name: 'Facebook',
        type: 'bar',
        stack: 'Total',
        data: [220, 182, 191, 234],
        color: '#4267B2'
      }
    ]
  }
}

function groupSharesByDate(data) {
  // Reduce the data to an object with dates as keys and shares as values
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
  const result = Object.entries(sharesByDate)
    .map(([date, shares]) => ({ [date]: shares }))
    .sort((a, b) => new Date(Object.keys(a)[0]) - new Date(Object.keys(b)[0]))

  const uniqueDates = Array.from(new Set(result.map((item) => Object.keys(item)[0])))

  const today = new Date()
  const firstDate = uniqueDates[0]
  let currentDate = new Date(firstDate)

  // Fill in the gaps between the first date and today
  while (currentDate <= today) {
    const formattedDate = currentDate.toLocaleDateString('en-US')

    if (!uniqueDates.includes(formattedDate)) {
      result.push({ [formattedDate]: {} })
      uniqueDates.push(formattedDate)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sort the array by date
  result.sort((a, b) => new Date(Object.keys(a)[0]) - new Date(Object.keys(b)[0]))

  return result
}

watchEffect(() => {
  if (!props.data.length) return

  const info = groupSharesByDate(props.data)
  console.log('info', JSON.stringify(info, null, 2))

  // shares.value = platforms
  //   .map((platform) => {
  //     const count = props.data.reduce((acc, share) => {
  //       const shareDate = new Date(share.createdAt.seconds * 1000)
  //       const now = new Date()

  //       if (platform.name.toLowerCase() === share.sharedOn.toLowerCase() && intervalFunctions[props.interval](shareDate, now)) {
  //         return acc + 1
  //       }
  //       return acc
  //     }, 0)

  //     return { name: platform.name, value: count, color: platform.color }
  //   })
  //   .filter((platform) => platform.value > 0)

  compute()
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
