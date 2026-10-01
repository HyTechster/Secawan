<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BrewStep } from '@/data/brewMethods'
import { formatClock } from '@/stores/brewTimer'

/**
 * Circular brew timeline. The progress arc doubles as a scrubber: drag the knob (or anywhere on
 * the dial) round the clock to move through the recipe. Step markers sit on the track.
 * Keyboard: arrows move 5 s, Page Up/Down 30 s, Home/End jump to the ends.
 */
const props = defineProps<{
  elapsed: number
  total: number
  steps: BrewStep[]
  currentStep: string
}>()

const emit = defineEmits<{
  seek: [seconds: number]
  dragstart: []
  dragend: []
}>()

const SIZE = 240
const C = SIZE / 2
const R = 96
const CIRC = 2 * Math.PI * R

const progress = computed(() => Math.min(1, props.elapsed / props.total))
const angle = computed(() => progress.value * 2 * Math.PI)
const pointAt = (a: number, r = R) => ({ x: C + r * Math.sin(a), y: C - r * Math.cos(a) })
const knob = computed(() => pointAt(angle.value))
const markers = computed(() =>
  props.steps.filter((s) => s.at > 0 && s.at < props.total).map((s) => ({ ...s, ...pointAt((s.at / props.total) * 2 * Math.PI) })),
)

const svg = ref<SVGSVGElement | null>(null)
const dragging = ref(false)
/** Pulses the knob until the visitor has tried it once */
const touched = ref(false)
let last = 0

function timeFromPointer(e: PointerEvent) {
  const rect = svg.value!.getBoundingClientRect()
  const x = e.clientX - (rect.left + rect.width / 2)
  const y = e.clientY - (rect.top + rect.height / 2)
  let a = Math.atan2(x, -y)
  if (a < 0) a += 2 * Math.PI
  let t = (a / (2 * Math.PI)) * props.total
  // Crossing twelve o'clock mid-drag should stop at the ends, not wrap round
  if (dragging.value && Math.abs(t - last) > props.total / 2) t = last > props.total / 2 ? props.total : 0
  last = t
  return t
}

function onDown(e: PointerEvent) {
  dragging.value = true
  touched.value = true
  last = props.elapsed
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  emit('dragstart')
  emit('seek', timeFromPointer(e))
}
function onMove(e: PointerEvent) {
  if (dragging.value) emit('seek', timeFromPointer(e))
}
function onUp() {
  if (!dragging.value) return
  dragging.value = false
  emit('dragend')
}

function onKey(e: KeyboardEvent) {
  const map: Record<string, number> = {
    ArrowRight: props.elapsed + 5,
    ArrowUp: props.elapsed + 5,
    ArrowLeft: props.elapsed - 5,
    ArrowDown: props.elapsed - 5,
    PageUp: props.elapsed + 30,
    PageDown: props.elapsed - 30,
    Home: 0,
    End: props.total,
  }
  if (!(e.key in map)) return
  e.preventDefault()
  touched.value = true
  emit('seek', map[e.key])
}
</script>

<template>
  <div class="dial" :class="{ 'is-dragging': dragging, 'is-fresh': !touched }">
    <svg
      ref="svg"
      class="dial__svg"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      role="slider"
      tabindex="0"
      aria-label="Brew time. Drag round the dial to scrub through the recipe."
      aria-valuemin="0"
      :aria-valuemax="total"
      :aria-valuenow="Math.round(elapsed)"
      :aria-valuetext="`${formatClock(elapsed)}, ${currentStep}`"
      data-cursor="Drag"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
    >
      <!-- Faint minute ticks make it read as a clock face you can turn -->
      <g class="dial__ticks" aria-hidden="true">
        <line
          v-for="i in 60"
          :key="i"
          :x1="C"
          :y1="C - R - 18"
          :x2="C"
          :y2="C - R - (i % 5 === 1 ? 24 : 21)"
          :transform="`rotate(${(i - 1) * 6} ${C} ${C})`"
        />
      </g>
      <circle :cx="C" :cy="C" :r="R" class="dial__track" />
      <circle
        :cx="C"
        :cy="C"
        :r="R"
        class="dial__progress"
        :stroke-dasharray="CIRC"
        :stroke-dashoffset="CIRC * (1 - progress)"
        :transform="`rotate(-90 ${C} ${C})`"
      />
      <circle v-for="m in markers" :key="m.at" :cx="m.x" :cy="m.y" r="4.5" class="dial__marker" :class="{ 'is-passed': elapsed >= m.at }" />
      <g class="dial__knob" :transform="`translate(${knob.x} ${knob.y})`">
        <circle r="22" class="dial__halo" />
        <circle r="14" class="dial__knob-body" />
        <circle r="4" class="dial__knob-dot" />
      </g>
    </svg>
    <div class="dial__readout">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dial {
  position: relative;
  width: min(100%, 280px);
  aspect-ratio: 1;
}
.dial__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  touch-action: none;
  cursor: grab;
  border-radius: 50%;
}
.is-dragging .dial__svg {
  cursor: grabbing;
}
.dial__svg:focus {
  outline: none;
}
.dial__svg:focus-visible {
  outline: 2.5px solid var(--terracotta);
  outline-offset: 6px;
}
.dial__ticks line {
  stroke: rgb(43 27 20 / 0.22);
  stroke-width: 1.5;
  stroke-linecap: round;
}
.dial__track {
  fill: none;
  stroke: rgb(43 27 20 / 0.1);
  stroke-width: 12;
}
.dial__progress {
  fill: none;
  stroke: var(--terracotta);
  stroke-width: 12;
  stroke-linecap: round;
}
.dial__marker {
  fill: var(--cream);
  stroke: rgb(43 27 20 / 0.45);
  stroke-width: 2;
  transition: fill 0.3s ease;
}
.dial__marker.is-passed {
  fill: var(--espresso);
  stroke: var(--cream);
}
.dial__knob {
  pointer-events: none;
}
.dial__halo {
  fill: var(--terracotta);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}
.is-fresh .dial__halo {
  animation: halo 2s ease-out infinite;
}
.dial__knob-body {
  fill: var(--cream);
  stroke: var(--espresso);
  stroke-width: 3;
  filter: drop-shadow(0 3px 5px rgb(43 27 20 / 0.35));
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.3s var(--ease-spring);
}
.dial__svg:hover .dial__knob-body,
.is-dragging .dial__knob-body {
  transform: scale(1.18);
}
.dial__knob-dot {
  fill: var(--terracotta);
}
@keyframes halo {
  0% {
    transform: scale(0.6);
    opacity: 0.45;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
.dial__readout {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 0.15rem;
  pointer-events: none;
}
</style>
