<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useMonth } from '../composables/useMonth'
import rawMetrics from '../data/metrics.json'
import rawMetrics2024 from '../data/metrics-2024.json'

interface MonthData {
  month: string
  monthIndex: number
  shipments: number
  onTimeRate: number
  exceptionRate: number
  openExceptions: number
}

const metrics: MonthData[] = rawMetrics as MonthData[]
const metrics2024: MonthData[] = rawMetrics2024 as MonthData[]
const selectedMonth = useMonth()

const filtered = computed<MonthData[]>(() =>
  selectedMonth.value === null
    ? metrics
    : metrics.filter((m) => m.monthIndex === selectedMonth.value)
)
const isAll = computed(() => selectedMonth.value === null)

const prior = computed<MonthData[]>(() =>
  selectedMonth.value === null
    ? metrics2024
    : metrics2024.filter((m) => m.monthIndex === selectedMonth.value)
)

const priorShipments = computed(() => prior.value.reduce((s, m) => s + m.shipments, 0))
const priorOnTimeRate = computed(() => {
  if (!prior.value.length) return 0
  return prior.value.reduce((s, m) => s + m.onTimeRate, 0) / prior.value.length
})
const priorExceptionRate = computed(() => {
  if (!prior.value.length) return 0
  return prior.value.reduce((s, m) => s + m.exceptionRate, 0) / prior.value.length
})
const priorOpenExceptions = computed(() => prior.value.reduce((s, m) => s + m.openExceptions, 0))

function yoyPct(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

const totalShipments = computed(() => filtered.value.reduce((s, m) => s + m.shipments, 0))
const avgOnTimeRate = computed(() => {
  if (!filtered.value.length) return 0
  return filtered.value.reduce((s, m) => s + m.onTimeRate, 0) / filtered.value.length
})
const avgExceptionRate = computed(() => {
  if (!filtered.value.length) return 0
  return filtered.value.reduce((s, m) => s + m.exceptionRate, 0) / filtered.value.length
})
const totalOpenExceptions = computed(() => filtered.value.reduce((s, m) => s + m.openExceptions, 0))

function prevMonth(idx: number): MonthData | undefined {
  return metrics.find((m) => m.monthIndex === idx - 1)
}

const delta = computed(() => {
  if (isAll.value || selectedMonth.value === null) return null
  const cur = filtered.value[0]
  const prev = prevMonth(cur.monthIndex)
  if (!prev) return null
  return {
    shipments: ((cur.shipments - prev.shipments) / prev.shipments) * 100,
    onTimeRate: cur.onTimeRate - prev.onTimeRate,
    exceptionRate: cur.exceptionRate - prev.exceptionRate,
    openExceptions: ((cur.openExceptions - prev.openExceptions) / prev.openExceptions) * 100,
  }
})

function deltaIcon(val: number) {
  return val >= 0 ? 'mdi-arrow-up-thin' : 'mdi-arrow-down-thin'
}
function deltaColor(val: number, lowerIsBetter = false) {
  const positive = val >= 0
  return (positive !== lowerIsBetter) ? 'success' : 'error'
}
function fmtPct(val: number) { return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%` }
function fmtPp(val: number) { return `${val >= 0 ? '+' : ''}${val.toFixed(1)} pp` }

const BLUE = '#5C9CE5'
const BLUE_BG = 'rgba(92,156,229,0.15)'
const TEAL = '#4DB6AC'
const TEAL_BG = 'rgba(77,182,172,0.18)'
const MUTED = 'rgba(92,156,229,0.30)'

const shipmentsChartData = computed<ChartData<'bar'>>(() => {
  const labels = metrics.map((m) => m.month)
  const values = metrics.map((m) => m.shipments)
  const bg = selectedMonth.value === null
    ? values.map(() => BLUE)
    : values.map((_, i) => (metrics[i].monthIndex === selectedMonth.value ? BLUE : MUTED))
  return { labels, datasets: [{ label: 'Shipments', data: values, backgroundColor: bg, borderRadius: 4, borderSkipped: false }] }
})
const shipmentsChartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${(ctx.raw as number).toLocaleString()} shipments` } } },
  scales: {
    x: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888' } },
    y: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888', callback: (v) => `${(Number(v)/1000).toFixed(1)}k` } },
  },
}))

const onTimeChartData = computed<ChartData<'line'>>(() => {
  const labels = metrics.map((m) => m.month)
  const values = metrics.map((m) => m.onTimeRate)
  const pts = selectedMonth.value === null
    ? values.map(() => TEAL)
    : values.map((_, i) => (metrics[i].monthIndex === selectedMonth.value ? TEAL : MUTED))
  return { labels, datasets: [{ label: 'On-Time Rate', data: values, borderColor: TEAL, backgroundColor: TEAL_BG, pointBackgroundColor: pts, pointRadius: pts.map((c) => (c === TEAL ? 5 : 3)), tension: 0.35, fill: true }] }
})
const onTimeChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${(ctx.raw as number).toFixed(1)}%` } } },
  scales: {
    x: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888' } },
    y: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888', callback: (v) => `${v}%` }, min: 75, max: 100 },
  },
}))

const exceptionChartData = computed<ChartData<'line'>>(() => {
  const labels = metrics.map((m) => m.month)
  const values = metrics.map((m) => m.exceptionRate)
  const pts = selectedMonth.value === null
    ? values.map(() => BLUE)
    : values.map((_, i) => (metrics[i].monthIndex === selectedMonth.value ? BLUE : MUTED))
  return { labels, datasets: [{ label: 'Exception Rate', data: values, borderColor: BLUE, backgroundColor: BLUE_BG, pointBackgroundColor: pts, pointRadius: pts.map((c) => (c === BLUE ? 5 : 3)), tension: 0.4, fill: true }] }
})
const exceptionChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${(ctx.raw as number).toFixed(1)}%` } } },
  scales: {
    x: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888' } },
    y: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888', callback: (v) => `${v}%` }, min: 0, max: 6 },
  },
}))

const cards = computed(() => [
  {
    key: 'shipments', label: 'Shipment Volume', icon: 'mdi-truck-delivery-outline',
    tooltip: 'Total number of shipments dispatched during the selected period.',
    value: totalShipments.value.toLocaleString(),
    sub: isAll.value ? 'Full year' : filtered.value[0]?.month ?? '',
    delta: delta.value?.shipments ?? null, deltaLabel: delta.value ? fmtPct(delta.value.shipments) : null,
    lowerIsBetter: false, yoy: yoyPct(totalShipments.value, priorShipments.value), yoyLower: false,
  },
  {
    key: 'ontime', label: 'On-Time Delivery', icon: 'mdi-check-circle-outline',
    tooltip: 'Percentage of shipments delivered on or before the committed delivery date.',
    value: `${avgOnTimeRate.value.toFixed(1)}%`,
    sub: isAll.value ? 'Yearly avg' : filtered.value[0]?.month ?? '',
    delta: delta.value?.onTimeRate ?? null, deltaLabel: delta.value ? fmtPp(delta.value.onTimeRate) : null,
    lowerIsBetter: false, yoy: yoyPct(avgOnTimeRate.value, priorOnTimeRate.value), yoyLower: false,
  },
  {
    key: 'exceptions', label: 'Exception Rate', icon: 'mdi-alert-circle-outline',
    tooltip: 'Percentage of shipments that triggered an exception (damage, delay, or misdirect).',
    value: `${avgExceptionRate.value.toFixed(1)}%`,
    sub: isAll.value ? 'Yearly avg' : filtered.value[0]?.month ?? '',
    delta: delta.value?.exceptionRate ?? null, deltaLabel: delta.value ? fmtPp(delta.value.exceptionRate) : null,
    lowerIsBetter: true, yoy: yoyPct(avgExceptionRate.value, priorExceptionRate.value), yoyLower: true,
  },
  {
    key: 'openexceptions', label: 'Open Exceptions', icon: 'mdi-clipboard-alert-outline',
    tooltip: 'Count of unresolved exceptions currently awaiting action by the ops team.',
    value: totalOpenExceptions.value.toLocaleString(),
    sub: isAll.value ? 'Full year' : filtered.value[0]?.month ?? '',
    delta: delta.value?.openExceptions ?? null, deltaLabel: delta.value ? fmtPct(delta.value.openExceptions) : null,
    lowerIsBetter: true, yoy: yoyPct(totalOpenExceptions.value, priorOpenExceptions.value), yoyLower: true,
  },
])
</script>

<template>
  <v-container fluid class="pa-6">

    <v-row>
      <v-col v-for="card in cards" :key="card.key" cols="12" sm="6" lg="3">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                {{ card.label }}
              </span>
              <v-tooltip :text="card.tooltip" location="top" max-width="240">
                <template #activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="14" class="ml-1" style="opacity:0.45;cursor:default;" />
                </template>
              </v-tooltip>
            </div>
            <v-icon :icon="card.icon" size="20" color="primary" />
          </div>

          <div class="d-flex align-center mb-1">
            <span class="text-h4 font-weight-bold">{{ card.value }}</span>
            <v-chip
              :color="(card.yoy >= 0) !== card.yoyLower ? 'success' : 'error'"
              size="x-small" variant="tonal" class="font-weight-medium ml-2" style="font-size:11px;"
            >
              {{ card.yoy >= 0 ? '▲' : '▼' }} {{ Math.abs(card.yoy).toFixed(1) }}% YoY
            </v-chip>
          </div>

          <div class="d-flex align-center mt-1">
            <span class="text-caption text-medium-emphasis">{{ card.sub }}</span>
            <template v-if="card.delta !== null">
              <v-icon :icon="deltaIcon(card.delta)" :color="deltaColor(card.delta, card.lowerIsBetter)" size="16" class="ml-2" />
              <span :class="`text-caption text-${deltaColor(card.delta, card.lowerIsBetter)} ml-1`">{{ card.deltaLabel }}</span>
              <span class="text-caption text-medium-emphasis ml-1">vs prev mo.</span>
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="7">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">Monthly Shipment Volume</div>
          <div style="position:relative;height:280px;">
            <Bar :data="shipmentsChartData" :options="shipmentsChartOptions" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">On-Time Delivery Rate</div>
          <div style="position:relative;height:280px;">
            <Line :data="onTimeChartData" :options="onTimeChartOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card variant="flat" border rounded="lg" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">Exception Rate Trend</div>
          <div style="position:relative;height:240px;">
            <Line :data="exceptionChartData" :options="exceptionChartOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>
