import { ref, provide, inject, type Ref } from 'vue'

const MONTH_KEY = Symbol('selectedMonth')

export function provideMonth() {
  const selectedMonth = ref<number | null>(null)
  provide(MONTH_KEY, selectedMonth)
  return selectedMonth
}

export function useMonth(): Ref<number | null> {
  const month = inject<Ref<number | null>>(MONTH_KEY)
  if (!month) throw new Error('useMonth must be used inside a component that calls provideMonth')
  return month
}
