<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { BarChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ref } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent])

const props = defineProps({
  data: { type: Array, required: true },
  title: { type: String, required: false }
})

const option = ref({
  title: {
    text: props.title,
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  xAxis: {
    type: 'category',
    // data: props.data.map((d) => d.name)
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    // TODO: use data from props
    // https://echarts.apache.org/examples/en/editor.html?c=bar-negative
  },
  yAxis: {
    type: 'value'
  },
  // series: [
  //   {
  //     type: 'bar',
  //     data: props.data.map((d) => d.value),
  //     colorBy: 'data',
  //     color: ['#48982a', '#ea3423', '#f9a61a', '#2e7bb4', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  //   }
  // ]
  series: [
    {
      name: 'Likes',
      type: 'bar',
      stack: 'Total',
      data: [320, 302, 341, 374, 390, 450, 420],
      color: '#48982a'
    },
    {
      name: 'Dislikes',
      type: 'bar',
      stack: 'Total',
      data: [-120, -132, -101, -134, -190, -230, -210],
      color: '#ea3423'
    }
  ]
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
