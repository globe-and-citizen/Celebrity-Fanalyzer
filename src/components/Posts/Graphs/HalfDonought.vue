<template>
  <v-chart class="chart" :option="chartOption" autoresize />
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
    bottom: '0%',
    data: []
  },
  series: [
    {
      name: 'User Activity',
      type: 'pie',
      radius: ['90%'],
      center: ['50%', '50%'],
      data: [{ value: 0 }],
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
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
  const maxRadius = 100
  const radius = Math.min(screenWidth, screenHeight) * 0.19

  return [minRadius, Math.min(radius, maxRadius)]
}

let summedData = {
  clicks: 0,
  keypresses: 0,
  mouseMovements: 0,
  scrolls: 0,
  totalTime: 0
}

function resetSummedData() {
  summedData = {
    clicks: 0,
    keypresses: 0,
    mouseMovements: 0,
    scrolls: 0,
    totalTime: 0
  }
}

function updateChartOption() {
  chartOption.value.title.left = 'center'
  chartOption.value.legend.bottom = '0%'

  chartOption.value.series[0].center = ['50%', '50%']
  chartOption.value.series[0].radius = calculateRadius()

  resetSummedData()

  props.stats?.map((user) => {
    summedData.clicks += user.clicks
    summedData.keypresses += user.keypresses
    summedData.scrolls += user.scrolls
    summedData.totalTime += user.totalTime
    summedData.mouseMovements += user.mouseMovements
  })

  const pieChartData = [
    { value: summedData?.clicks, name: 'Clicks' },
    { value: summedData?.keypresses, name: 'Key-presses' },
    { value: summedData?.mouseMovements, name: 'Mouse movements' },
    { value: summedData?.scrolls, name: 'Scrolls' },
    { value: summedData?.totalTime, name: 'Total Time' }
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
  resetSummedData()
})
</script>

<style scoped>
.chart {
  height: 100%;
  min-height: 330px;
}
</style>
