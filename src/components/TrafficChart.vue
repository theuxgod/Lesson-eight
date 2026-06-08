<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'

const data: ChartData<'doughnut'> = {
  labels: ['Direct', 'Search', 'Social', 'Referral'],
  datasets: [
    {
      data: [42, 28, 18, 12],
      backgroundColor: ['#1976D2', '#43A047', '#FB8C00', '#E53935'],
    },
  ],
}

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <div style="position: relative; height: 320px;">
    <Doughnut :data="data" :options="options" />
  </div>
</template>
