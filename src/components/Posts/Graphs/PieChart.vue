<template>
  <div :id="chartId" autoresize></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      chartId: 'piechart', // ID of the chart container element
      myChart: null // Placeholder for the ECharts instance
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      // Initialize ECharts instance
      this.myChart = echarts.init(document.getElementById(this.chartId))

      // Specify chart options
      const option = {
        backgroundColor: 'white',
        title: {
          text: 'Overall statistics',
          left: 'center',
          top: 20,
          textStyle: {
            color: 'black'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        visualMap: {
          show: false,
          min: 80,
          max: 600,
          inRange: {
            colorLightness: [0, 1]
          }
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: [
              { value: 335, name: 'Direct' },
              { value: 310, name: 'Email' },
              { value: 274, name: 'Union Ads' },
              { value: 235, name: 'Video Ads' },
              { value: 400, name: 'Search Engine' }
            ].sort(function (a, b) {
              return a.value - b.value
            }),
            roseType: 'radius',
            label: {
              color: 'black'
            },
            labelLine: {
              lineStyle: {
                color: 'black'
              },
              smooth: 0.2,
              length: 10,
              length2: 20
            },
            itemStyle: {
              color: '#c23531',
              shadowBlur: 200,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200
            }
          }
        ]
      }
      // Set chart options and render the chart
      this.myChart.setOption(option)
    }
  }
}
</script>

<style>
/* Add any custom styles here */
</style>
