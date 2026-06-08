<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'

const data: ChartData<'line'> = {
  labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
  datasets: [
    {
      label: 'Revenue ($k)',
      data: [12, 19, 14, 22, 28, 25, 33, 41],
      borderColor: '#43A047',
      backgroundColor: 'rgba(67, 160, 71, 0.2)',
      tension: 0.35,
      fill: true,
    },
  ],
}

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <div style="position: relative; height: 320px;">
    <Line :data="data" :options="options" />
  </div>
</template>
