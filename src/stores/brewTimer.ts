import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { brewMethods, type BrewMethod } from '@/data/brewMethods'

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const useBrewTimerStore = defineStore('brewTimer', () => {
  const methodId = ref<BrewMethod['id']>('v60')
  const elapsed = ref(0)
  const running = ref(false)

  const method = computed(() => brewMethods.find((m) => m.id === methodId.value) ?? brewMethods[0])
  const total = computed(() => method.value.totalSeconds)
  const progress = computed(() => Math.min(1, elapsed.value / total.value))
  const isDone = computed(() => elapsed.value >= total.value)
  const remaining = computed(() => Math.max(0, total.value - elapsed.value))

  /** Index of the latest step whose start time has passed. */
  const currentStepIndex = computed(() => {
    const steps = method.value.steps
    let index = 0
    for (let i = 0; i < steps.length; i++) if (elapsed.value >= steps[i].at) index = i
    return index
  })

  const clock = computed(() => formatClock(elapsed.value))

  function selectMethod(id: BrewMethod['id']) {
    if (id === methodId.value) return
    methodId.value = id
    reset()
  }

  function start() {
    if (isDone.value) elapsed.value = 0
    running.value = true
  }

  function pause() {
    running.value = false
  }

  function toggle() {
    if (running.value) pause()
    else start()
  }

  function reset() {
    running.value = false
    elapsed.value = 0
  }

  /** Advance by `seconds`. Stops automatically at the end of the recipe. */
  function tick(seconds = 1) {
    if (!running.value) return
    elapsed.value = Math.min(total.value, elapsed.value + seconds)
    if (elapsed.value >= total.value) running.value = false
  }

  /** Jump to a point in the recipe (scrubbing the ring, or picking a step). Keeps the play or pause state. */
  function seek(seconds: number) {
    elapsed.value = Math.min(total.value, Math.max(0, seconds))
    if (elapsed.value >= total.value) running.value = false
  }

  return {
    methodId,
    elapsed,
    running,
    method,
    total,
    progress,
    isDone,
    remaining,
    currentStepIndex,
    clock,
    selectMethod,
    start,
    pause,
    toggle,
    reset,
    tick,
    seek,
  }
})
