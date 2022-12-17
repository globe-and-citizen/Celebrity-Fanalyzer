<template>
  <Bar :options="chartOptions" :data="chartData" datasetIdKey="Likes" class="shadow-1 q-pa-md" style="border-radius: 5px" />
</template>

<script>
import { Bar } from 'vue-chartjs'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'LikeDislikeBarChart',
  components: { Bar },
  props: {
    likes: {
      type: Number,
      required: true
    },
    dislikes: {
      type: Number,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: ['Likes', 'Dislikes'],
        datasets: [
          {
            data: [this.likes, this.dislikes],
            label: 'Likes and Dislikes',
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)'
            ],
          },
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    }
  }
}
</script>
