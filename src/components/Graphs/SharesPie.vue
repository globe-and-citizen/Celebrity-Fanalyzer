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
  data: { type: Array, required: true }
})

const option = ref({})
const platforms = {
  clipboard: 'Clipboard',
  discord: 'Discord',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  odnoklassniki: 'Odnoklassniki',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
  telegram: 'Telegram',
  twitter: 'Twitter',
  whatsapp: 'WhatsApp'
}

const shares = ref([])

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
        data: shares,
        colorBy: 'data',
        color: ['#48982a', '#ea3423', '#f9a61a', '#2e7bb4', '#fc8452', '#9a60b4', '#ea7ccc']
      }
    ]
  }
}

watchEffect(() => {
  shares.value = Object.entries(platforms)
    .map(([key, name]) => {
      const count = props.data?.reduce((acc, share) => {
        return share.sharedOn === key ? acc + 1 : acc
      }, 0)
      return { name, value: count }
    })
    .filter((platform) => platform.value > 0)

  compute()
})
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
