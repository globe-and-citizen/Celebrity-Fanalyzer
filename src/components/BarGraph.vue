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
    data: props.data.map((d) => d.name)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: props.data.map((d) => d.value)
    }
  ]
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
