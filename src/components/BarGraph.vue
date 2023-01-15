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

const dislikes = props.data.map((d) => {
  console.log()
  return d.dislikes
})
const likes = props.data.map((d) => {
  return d.likes
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
    data: props.data.map((d, index) => {
      const date = new Date()
      let end = new Date()
      date.setTime(d.date)
      if(index+1<props.data.length){
        end.setTime(props.data[index+1].date)
      }
      if((end-date)<=86400000){
        return date.getDate()
      }
      return `${date.getDate()}-${end.getDate()}`
    })
    // TODO: use data from props
    // https://echarts.apache.org/examples/en/editor.html?c=bar-negative
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Likes',
      type: 'bar',
      stack: 'Total',
      // data: [320, 302, 341, 374, 390, 450, 420],
      data: likes,
      color: '#48982a'
    },
    {
      name: 'Dislikes',
      type: 'bar',
      stack: 'Total',
      // data: [-120, -132, -101, -134, -190, -230, -210],
      data: dislikes.map((value) => value * -1),
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
