<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { BarChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUpdate, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TitleComponent, TooltipComponent])

const props = defineProps({
  data: { type: Array, required: true },
  title: { type: String, required: false }
})

const option = ref({})

function compute() {
  option.value = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'category',
      data: props.data.map((item) => item.label)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Likes',
        type: 'bar',
        stack: 'Total',
        data: props.data.map((item) => item.likes),
        color: '#48982a'
      },
      {
        name: 'Dislikes',
        type: 'bar',
        stack: 'Total',
        data: props.data.map((item) => -item.dislikes),
        color: '#ea3423'
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
