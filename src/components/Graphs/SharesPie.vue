<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUpdate, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  data: { type: Array, required: true }
})

const option = ref({})

function compute() {
  option.value = {
    title: {
      text: 'Shares',
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
        data: props.data,
        colorBy: 'data',
        color: ['#48982a', '#ea3423', '#f9a61a', '#2e7bb4', '#fc8452', '#9a60b4', '#ea7ccc']
      }
    ]
  }
}

onBeforeUpdate(() => {
  compute()
})

onMounted(() => {
  compute()
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
