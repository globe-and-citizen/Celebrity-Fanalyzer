<template>
  <Bar :options="chartOptions" :data="chartData" datasetIdKey="Likes" class="shadow-1 q-pa-md"
       style="border-radius: 5px" />
</template>

<script>
import { Bar } from 'vue-chartjs'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name:       'StatsBarChart',
  components: { Bar },
  props: {
    week1: {
      type: Array,
      required: true
    },
    week2: {
      type: Array,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels:   ['Page views', 'Unique visits', 'Returning visits', 'First time visits'],
        datasets: [
          {
            data: this.week1,
            label:           'Week 1',
            backgroundColor: ['rgb(255, 99, 132)']
          },
          {
            data: this.week2,
            label:           'Week 2',
            backgroundColor: ['rgb(54, 162, 235)']
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        plugins:    {
          legend: {
            display: true
          }
        }
      }
    }
  }
}
</script>
