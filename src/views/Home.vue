<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useMonth } from '../composables/useMonth'
import rawMetrics from '../data/metrics.json'

interface MonthData {
  month: string
  monthIndex: number
  revenue: number
  visitors: number
  conversions: number
  orders: number
}

const metrics: MonthData[] = rawMetrics

const selectedMonth = useMonth()

// ── Derived dataset ────────────────────────────────────────────────────────
const filtered = computed<MonthData[]>(() =>
  selectedMonth.value === null
    ? metrics
    : metrics.filter((m) => m.monthIndex === selectedMonth.value)
)

const isAll = computed(() => selectedMonth.value === null)

// ── Summary card values ────────────────────────────────────────────────────
const totalRevenue = computed(() =>
  filtered.value.reduce((s, m) => s + m.revenue, 0)
)
const totalVisitors = computed(() =>
  filtered.value.reduce((s, m) => s + m.visitors, 0)
)
const avgConversions = computed(() => {
  if (!filtered.value.length) return 0
  const sum = filtered.value.reduce((s, m) => s + m.conversions, 0)
  return sum / filtered.value.length
})
const totalOrders = computed(() =>
  filtered.value.reduce((s, m) => s + m.orders, 0)
)

// ── Month-over-month delta (only meaningful when a single month is selected) ─
function prevMonth(idx: number): MonthData | undefined {
  return metrics.find((m) => m.monthIndex === idx - 1)
}

const delta = computed(() => {
  if (isAll.value || selectedMonth.value === null) return null
  const cur = filtered.value[0]
  const prev = prevMonth(cur.monthIndex)
  if (!prev) return null
  return {
    revenue: ((cur.revenue - prev.revenue) / prev.revenue) * 100,
    visitors: ((cur.visitors - prev.visitors) / prev.visitors) * 100,
    conversions: cur.conversions - prev.conversions,
    orders: ((cur.orders - prev.orders) / prev.orders) * 100,
  }
})

function deltaIcon(val: number) {
  return val >= 0 ? 'mdi-arrow-up-thin' : 'mdi-arrow-down-thin'
}
function deltaColor(val: number) {
  return val >= 0 ? 'success' : 'error'
}
function fmtPct(val: number) {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}

// ── Palette ────────────────────────────────────────────────────────────────
const BLUE = '#5C9CE5'
const BLUE_BG = 'rgba(92,156,229,0.15)'
const TEAL = '#4DB6AC'
const TEAL_BG = 'rgba(77,182,172,0.18)'
const MUTED = 'rgba(92,156,229,0.35)'

// ── Bar chart – revenue ────────────────────────────────────────────────────
const revenueChartData = computed<ChartData<'bar'>>(() => {
  const allLabels = metrics.map((m) => m.month)
  const allValues = metrics.map((m) => m.revenue)
  const highlight =
    selectedMonth.value === null
      ? allValues.map(() => BLUE)
      : allValues.map((_, i) => (metrics[i].monthIndex === selectedMonth.value ? BLUE : MUTED))

  return {
    labels: allLabels,
    datasets: [
      {
        label: 'Revenue',
        data: allValues,
        backgroundColor: highlight,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }
})

const revenueChartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` $${(ctx.raw as number).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aaa' } },
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: {
        color: '#aaa',
        callback: (v) => `$${(Number(v) / 1000).toFixed(0)}k`,
      },
    },
  },
}))

// ── Line chart – visitors ──────────────────────────────────────────────────
const visitorsChartData = computed<ChartData<'line'>>(() => {
  const allLabels = metrics.map((m) => m.month)
  const allValues = metrics.map((m) => m.visitors)
  const pointColors =
    selectedMonth.value === null
      ? allValues.map(() => TEAL)
      : allValues.map((_, i) => (metrics[i].monthIndex === selectedMonth.value ? TEAL : MUTED))

  return {
    labels: allLabels,
    datasets: [
      {
        label: 'Visitors',
        data: allValues,
        borderColor: TEAL,
        backgroundColor: TEAL_BG,
        pointBackgroundColor: pointColors,
        pointRadius: pointColors.map((c) => (c === TEAL ? 5 : 3)),
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

const visitorsChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${(ctx.raw as number).toLocaleString()} visitors`,
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aaa' } },
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: {
        color: '#aaa',
        callback: (v) => `${(Number(v) / 1000).toFixed(0)}k`,
      },
    },
  },
}))

// ── Area chart – conversions ───────────────────────────────────────────────
const conversionsChartData = computed<ChartData<'line'>>(() => {
  const allLabels = metrics.map((m) => m.month)
  const allValues = metrics.map((m) => m.conversions)
  const pointColors =
    selectedMonth.value === null
      ? allValues.map(() => BLUE)
      : allValues.map((_, i) => (metrics[i].monthIndex === selectedMonth.value ? BLUE : MUTED))

  return {
    labels: allLabels,
    datasets: [
      {
        label: 'Conversion Rate',
        data: allValues,
        borderColor: BLUE,
        backgroundColor: BLUE_BG,
        pointBackgroundColor: pointColors,
        pointRadius: pointColors.map((c) => (c === BLUE ? 5 : 3)),
        tension: 0.4,
        fill: true,
      },
    ],
  }
})

const conversionsChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${(ctx.raw as number).toFixed(1)}%`,
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aaa' } },
    y: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: '#aaa', callback: (v) => `${v}%` },
      min: 0,
      max: 6,
    },
  },
}))

// ── Summary card definitions ───────────────────────────────────────────────
const cards = computed(() => [
  {
    key: 'revenue',
    label: 'Revenue',
    icon: 'mdi-currency-usd',
    tooltip: 'Total revenue from all orders in the selected period.',
    value: `$${totalRevenue.value.toLocaleString()}`,
    sub: isAll.value ? 'Full year' : filtered.value[0]?.month ?? '',
    delta: delta.value?.revenue ?? null,
    deltaLabel: delta.value ? fmtPct(delta.value.revenue) : null,
  },
  {
    key: 'visitors',
    label: 'Visitors',
    icon: 'mdi-account-multiple-outline',
    tooltip: 'Unique visitors who landed on the site during the selected period.',
    value: totalVisitors.value.toLocaleString(),
    sub: isAll.value ? 'Full year' : filtered.value[0]?.month ?? '',
    delta: delta.value?.visitors ?? null,
    deltaLabel: delta.value ? fmtPct(delta.value.visitors) : null,
  },
  {
    key: 'conversions',
    label: 'Conversions',
    icon: 'mdi-percent-outline',
    tooltip: 'Orders divided by visitors, expressed as a percentage. Shown as a monthly average when "All Months" is selected.',
    value: `${avgConversions.value.toFixed(1)}%`,
    sub: isAll.value ? 'Yearly avg' : filtered.value[0]?.month ?? '',
    delta: delta.value?.conversions ?? null,
    deltaLabel: delta.value
      ? `${delta.value.conversions >= 0 ? '+' : ''}${delta.value.conversions.toFixed(2)} pp`
      : null,
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: 'mdi-shopping-outline',
    tooltip: 'Total number of completed orders placed during the selected period.',
    value: totalOrders.value.toLocaleString(),
    sub: isAll.value ? 'Full year' : filtered.value[0]?.month ?? '',
    delta: delta.value?.orders ?? null,
    deltaLabel: delta.value ? fmtPct(delta.value.orders) : null,
  },
])
</script>

<template>
  <v-container fluid class="pa-6">

    <!-- Summary cards -->
    <v-row>
      <v-col
        v-for="card in cards"
        :key="card.key"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-wide">
                {{ card.label }}
              </span>
              <v-tooltip :text="card.tooltip" location="top" max-width="240">
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    icon="mdi-information-outline"
                    size="14"
                    class="ml-1"
                    style="opacity: 0.45; cursor: default;"
                  />
                </template>
              </v-tooltip>
            </div>
            <v-icon :icon="card.icon" size="20" color="primary" />
          </div>
          <div class="text-h4 font-weight-bold mb-1">{{ card.value }}</div>
          <div class="d-flex align-center mt-1">
            <span class="text-caption text-medium-emphasis">{{ card.sub }}</span>
            <template v-if="card.delta !== null">
              <v-icon
                :icon="deltaIcon(card.delta)"
                :color="deltaColor(card.delta)"
                size="16"
                class="ml-2"
              />
              <span :class="`text-caption text-${deltaColor(card.delta)} ml-1`">
                {{ card.deltaLabel }}
              </span>
              <span class="text-caption text-medium-emphasis ml-1">vs prev mo.</span>
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue + Visitors charts -->
    <v-row class="mt-4">
      <v-col cols="12" md="7">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">Monthly Revenue</div>
          <div style="position: relative; height: 280px;">
            <Bar :data="revenueChartData" :options="revenueChartOptions" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">Visitor Traffic</div>
          <div style="position: relative; height: 280px;">
            <Line :data="visitorsChartData" :options="visitorsChartOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Conversions area chart -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">Conversion Rate Trend</div>
          <div style="position: relative; height: 240px;">
            <Line :data="conversionsChartData" :options="conversionsChartOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>
