<script setup lang="ts">
import { computed, ref } from 'vue'

const model = defineModel<number>({ required: true })
const props = withDefaults(defineProps<{ label: string; valueText: string; dark?: boolean }>(), { dark: false })

const track = ref<HTMLElement | null>(null)
const dragging = ref(false)

const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)))

function setFromPointer(e: PointerEvent) {
  const rect = track.value!.getBoundingClientRect()
  model.value = clamp(((e.clientX - rect.left) / rect.width) * 100)
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  setFromPointer(e)
}
function onPointerMove(e: PointerEvent) {
  if (dragging.value) setFromPointer(e)
}
function onPointerUp() {
  dragging.value = false
}

function onKeydown(e: KeyboardEvent) {
  const big = 10
  const step = e.shiftKey ? big : 1
  const map: Record<string, number> = {
    ArrowRight: model.value + step,
    ArrowUp: model.value + step,
    ArrowLeft: model.value - step,
    ArrowDown: model.value - step,
    PageUp: model.value + big,
    PageDown: model.value - big,
    Home: 0,
    End: 100,
  }
  if (!(e.key in map)) return
  e.preventDefault()
  model.value = clamp(map[e.key])
}

const presets = [
  { label: 'Light', value: 15 },
  { label: 'Medium', value: 50 },
  { label: 'Dark', value: 85 },
]

const thumbStyle = computed(() => ({ left: `${model.value}%` }))
const dark = computed(() => props.dark)
</script>

<template>
  <div class="slider" :class="{ 'is-dark': dark }">
    <div
      ref="track"
      class="slider__track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="slider__rail" aria-hidden="true" />
      <div
        class="slider__thumb"
        :class="{ 'is-dragging': dragging }"
        :style="thumbStyle"
        role="slider"
        tabindex="0"
        :aria-label="label"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="model"
        :aria-valuetext="valueText"
        data-cursor="Drag"
        @keydown="onKeydown"
      >
        <svg viewBox="0 0 24 32" width="22" height="30" aria-hidden="true">
          <ellipse cx="12" cy="16" rx="10" ry="14" fill="currentColor" />
          <path d="M12 3c-3 5 3 9 0 13s3 9 0 13" fill="none" stroke="var(--cream)" stroke-width="2" stroke-linecap="round" opacity="0.7" />
        </svg>
      </div>
    </div>
    <div class="slider__presets">
      <button v-for="p in presets" :key="p.label" type="button" class="slider__preset" @click="model = p.value">
        {{ p.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider__track {
  position: relative;
  height: 64px;
  touch-action: none;
  cursor: pointer;
}
.slider__rail {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 14px;
  margin-top: -7px;
  border-radius: 99px;
  background: linear-gradient(90deg, #c9a173 0%, #a87447 30%, #6a3f22 62%, #24150d 100%);
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.25), 0 0 0 3px rgb(246 240 230 / 0.35);
}
.slider__thumb {
  position: absolute;
  top: 50%;
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--cream);
  color: var(--roast);
  box-shadow:
    0 0 0 2px rgb(43 27 20 / 0.12),
    0 10px 24px -8px rgb(43 27 20 / 0.55);
  transition:
    scale 0.35s var(--ease-spring),
    rotate 0.35s var(--ease-spring);
}
.slider__thumb:hover,
.slider__thumb.is-dragging {
  scale: 1.1;
  rotate: 12deg;
}
.slider__presets {
  display: flex;
  justify-content: space-between;
  margin-top: 0.4rem;
}
.slider__preset {
  padding: 0.4rem 0.2rem;
  font-weight: 700;
  font-size: 0.92rem;
  color: inherit;
  opacity: 0.85;
}
.slider__preset:hover {
  opacity: 1;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.is-dark .slider__thumb {
  background: var(--cream);
}
</style>
