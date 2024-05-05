<template>
  <v-chart v-if="props.stats.length" class="chart" :option="chartOption" autoresize />
</template>

<script setup>
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, ToolboxComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'

const props = defineProps({ stats: {}, title: String })

use([LegendComponent, ToolboxComponent, PieChart, CanvasRenderer])
const chartOption = ref({
  title: {
    text: props.title,
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      let detail = ''
      if (params.data.name === 'Total Time') {
        detail = ` seconds`
      }
      return `${params.seriesName} <br/>${params.data.name} : ${params.data.value}${detail}`
    }
  },
  legend: {
    bottom: '1%',
    data: []
  },
  series: [
    {
      name: 'User Activity',
      type: 'pie',
      radius: [],
      center: ['50%', '60%'],
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

function calculateRadius() {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  const minRadius = 20
  const maxRadius = 450
  const radius = Math.min(screenWidth, screenHeight) * 0.21

  return [minRadius, Math.min(radius, maxRadius)]
}

function updateChartOption() {
  chartOption.value.series[0].radius = calculateRadius()

  let summedData = {
    clicks: 0,
    keypresses: 0,
    mousemovements: 0,
    scrolls: 0,
    totaltime: 0
  }
  const userData = props.stats

  userData.map((user) => {
    summedData.clicks += user.clicks
    summedData.keypresses += user.keypresses
    summedData.scrolls += user.scrolls
    summedData.totaltime += user.totaltime
    summedData.mousemovements += user.mousemovements
  })

  const pieChartData = [
    { value: summedData?.clicks, name: 'Clicks' },
    { value: summedData?.keypresses, name: 'Keypresses' },
    { value: summedData?.mousemovements, name: 'Mouse movements' },
    { value: summedData?.scrolls, name: 'Scrolls' },
    { value: summedData?.totaltime, name: 'Total Time' }
  ]

  chartOption.value.series[0].data = pieChartData
  chartOption.value.legend.data = pieChartData.map((item) => item.name)
}

watchEffect(() => {
  updateChartOption()
})

onMounted(() => {
  window.addEventListener('resize', updateChartOption)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartOption)
})
</script>

<style scoped>
.chart {
  height: 70vh;

  @media (max-width: 1024px) {
    height: 55vh;
  }
  @media (max-width: 720px) {
    height: 45vh;
  }
}
</style>
