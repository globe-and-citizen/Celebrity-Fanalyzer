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
  // create a new object that will hold the results
  const sharesByDate = data.reduce((acc, item) => {
    const date = monthDayYear(item.createdAt)
    if (acc[date]) {
      // add the share to the date
      acc[date][item.sharedOn] = (acc[date][item.sharedOn] || 0) + 1
    } else {
      // otherwise, set the date and add the share
      acc[date] = { [item.sharedOn]: 1 }
    }
    return acc
  }, {})

  // convert the object into a sorted array
  const result = Object.keys(sharesByDate).map((date) => ({ [date]: sharesByDate[date] }))

  // sort the array by date
  result.sort((a, b) => {
    var dateA = Object.keys(a)[0]
    var dateB = Object.keys(b)[0]
    return new Date(dateA) - new Date(dateB)
  })

  const uniqueDates = []
  const today = new Date()
  const firstDate = Object.keys(result[0])[0]

  let currentDate = new Date(firstDate)

  // Generate missing dates between the first provided date and today's date
  while (currentDate <= today) {
    const formattedDate = currentDate.toLocaleDateString('en-US')
    if (!uniqueDates.includes(formattedDate)) {
      uniqueDates.push(formattedDate)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Add missing dates to the result
  uniqueDates.forEach((date) => {
    if (!result.find((item) => Object.keys(item)[0] === date)) {
      result.push({ [date]: {} })
    }
  })

  // sort the array by date
  result.sort((a, b) => {
    var dateA = Object.keys(a)[0]
    var dateB = Object.keys(b)[0]
    return new Date(dateA) - new Date(dateB)
  })

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
