<script setup lang="ts">
import SalesChart from '../components/SalesChart.vue'
import RevenueChart from '../components/RevenueChart.vue'
import TrafficChart from '../components/TrafficChart.vue'

const stats = [
  { title: 'Users', value: '1,284', icon: 'mdi-account-group', color: 'primary' },
  { title: 'Revenue', value: '$24,310', icon: 'mdi-currency-usd', color: 'success' },
  { title: 'Orders', value: '342', icon: 'mdi-cart', color: 'warning' },
  { title: 'Pending', value: '17', icon: 'mdi-clock-outline', color: 'error' },
]
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="s in stats" :key="s.title" cols="12" sm="6" md="3">
        <v-card :color="s.color" variant="tonal" class="pa-4">
          <div class="d-flex align-center">
            <v-icon :icon="s.icon" size="40" class="mr-3" />
            <div>
              <div class="text-caption text-uppercase">{{ s.title }}</div>
              <div class="text-h5 font-weight-bold">{{ s.value }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title>Monthly Sales</v-card-title>
          <v-card-text>
            <SalesChart />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <v-card-title>Traffic Sources</v-card-title>
          <v-card-text>
            <TrafficChart />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Revenue Trend</v-card-title>
          <v-card-text>
            <RevenueChart />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
