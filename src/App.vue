<script setup lang="ts">
import { ref, computed } from 'vue'
import { provideMonth } from './composables/useMonth'

const selectedMonth = provideMonth()

const isDark = ref(false)
const theme = computed(() => (isDark.value ? 'dark' : 'light'))

const months = [
  { title: 'All Months', value: null },
  { title: 'January', value: 0 },
  { title: 'February', value: 1 },
  { title: 'March', value: 2 },
  { title: 'April', value: 3 },
  { title: 'May', value: 4 },
  { title: 'June', value: 5 },
  { title: 'July', value: 6 },
  { title: 'August', value: 7 },
  { title: 'September', value: 8 },
  { title: 'October', value: 9 },
  { title: 'November', value: 10 },
  { title: 'December', value: 11 },
]
</script>

<template>
  <v-app :theme="theme">
    <v-app-bar flat border="b" color="surface">
      <v-app-bar-title>
        <v-icon icon="mdi-chart-box-outline" class="mr-2" color="primary" />
        <span class="font-weight-bold">Analytics Dashboard</span>
        <span class="text-caption text-medium-emphasis ml-2">2025</span>
      </v-app-bar-title>

      <template #append>
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          class="mr-2"
          @click="isDark = !isDark"
        />
        <v-select
          v-model="selectedMonth"
          :items="months"
          item-title="title"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          style="min-width: 160px; max-width: 180px;"
          class="mr-4"
          prepend-inner-icon="mdi-calendar-month"
        />
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
