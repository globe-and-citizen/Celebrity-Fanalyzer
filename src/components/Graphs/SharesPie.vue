<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, watchEffect } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  data: { type: Array, required: true },
  interval: { type: String, default: 'day' }
})

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
      text: `${sharesCount.value} Shares`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '55%',
        data: shares,
        colorBy: 'data',
        color: shares.value.map((share) => share.color)
      }
    ]
  }
}

const intervalFunctions = {
  day: (shareDate, now) => shareDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  week: (shareDate, now) => {
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    return shareDate >= weekStart
  },
  all: () => true
}

watchEffect(() => {
  shares.value = platforms
    .map((platform) => {
      const count = props.data.reduce((acc, share) => {
        const shareDate = new Date(share.createdAt.seconds * 1000)
        const now = new Date()

        if (platform.name.toLowerCase() === share.sharedOn.toLowerCase() && intervalFunctions[props.interval](shareDate, now)) {
          return acc + 1
        }
        return acc
      }, 0)

      return { name: platform.name, value: count, color: platform.color }
    })
    .filter((platform) => platform.value > 0)

  sharesCount.value = shares.value.reduce((acc, share) => acc + share.value, 0)

  compute()
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
