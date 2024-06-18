<template>
  <v-chart class="chart" :option="chartOption" autoresize />
</template>

<script setup>
import { use } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'

const props = defineProps({ userRating: {}, title: String })
let rating = ref(0)
let screenWidth = ref(window.innerWidth)
use([TooltipComponent, TitleComponent, GaugeChart, CanvasRenderer])

const getChartOption = (width) => ({
  title: {
    text: props.title,
    left: 'center',
    fontSize: width < 720 ? 12 : 18
  },
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%'
  },
  series: [
    {
      name: 'Popularity',
      type: 'gauge',
      detail: {
        fontSize: width < 720 ? 15 : 30,
        offsetCenter: [0, '-35%'],
        valueAnimation: true,
        formatter: function (value) {
          return Math.round(value * 1) + '%'
        },
        color: 'inherit'
      },
      data: [{ value: 0 }],
      startAngle: 180,
      endAngle: 0,
      center: width < 720 ? ['50%', '68%'] : ['50%', '80%'],
      radius: width < 720 ? '80%' : '90%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.2, '#FF6E76'],
            [0.4, '#FDDD60'],
            [0.6, '#58D9F9'],
            [0.8, '#b5e1c3'],
            [1, '#7CFFB2']
          ]
        }
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      splitLine: {
        length: 20,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      axisLabel: {
        color: '#464646',
        fontSize: width < 720 ? 10 : 15,
        distance: width < 720 ? -50 : -60,
        rotate: 'tangential',
        formatter: function (value) {
          if (value === 10) {
            return 'Very Unpopular'
          } else if (value === 30) {
            return 'Unpopular'
          } else if (value === 50) {
            return 'Getting closer'
          } else if (value === 70) {
            return 'Popular'
          } else if (value === 90) {
            return 'Top '
          }
          return ''
        }
      },
      pointer: {
        length: '50%',
        width: 6
      },
      title: {
        offsetCenter: [0, '80%'],
        fontSize: 20
      }
    }
  ]
})

const chartOption = ref(getChartOption(screenWidth.value))

function updateChartOption() {
  rating.value = props.userRating?.userRating || 0
  chartOption.value.series[0].data[0].value = Math.ceil(rating.value)
}

watchEffect(() => {
  updateChartOption()
})

onMounted(() => {
  window.addEventListener('resize', () => {
    screenWidth.value = window.innerWidth
    chartOption.value = getChartOption(screenWidth.value)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartOption)
})
</script>

<style scoped>
.chart {
  height: 100%;

  @media (max-width: 720px) {
    height: 35vh;
  }
}
</style>
