<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'

const data: ChartData<'bar'> = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Sales',
      backgroundColor: '#1976D2',
      data: [40, 39, 60, 81, 56, 95, 72],
    },
  ],
}

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <div style="position: relative; height: 320px;">
    <Bar :data="data" :options="options" />
  </div>
</template>
