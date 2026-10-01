<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '@/lib/gsap'
import { useUiStore } from '@/stores/ui'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

const ui = useUiStore()
const visible = ref(!prefersReducedMotion())
const percent = ref(0)

const root = ref<HTMLElement | null>(null)
const liquid = ref<SVGGElement | null>(null)
const wave = ref<SVGPathElement | null>(null)
const steam = ref<SVGPathElement | null>(null)
const cup = ref<SVGGElement | null>(null)

// Liquid travels from the cup floor (y 164) up to the brim (y 74)
const EMPTY_Y = 164
const FULL_Y = 74

let ctx: gsap.Context | null = null
let tick: (() => void) | null = null
let safety: number | undefined

function exit() {
  if (tick) gsap.ticker.remove(tick)
  tick = null
  ctx?.add(() => {
    gsap
      .timeline({
        onComplete: () => {
          visible.value = false
          ui.markEntered()
        },
      })
      .fromTo(steam.value, { drawSVG: '0% 0%', opacity: 1 }, { drawSVG: '0% 100%', duration: 0.7, ease: 'sine.inOut' })
      .to(steam.value, { drawSVG: '100% 100%', opacity: 0, duration: 0.5, ease: 'sine.in' }, '>-0.1')
      .to(cup.value, { scale: 1.35, opacity: 0, duration: 0.7, ease: 'power2.in', transformOrigin: '50% 60%' }, '<')
      .to(root.value, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  })
}

onMounted(() => {
  document.fonts.ready.then(() => (ui.fontsReady = true))
  // Never hold the page hostage: proceed after 6 seconds no matter what
  safety = window.setTimeout(() => {
    ui.fontsReady = true
    ui.heroReady = true
  }, 6000)

  if (!visible.value) {
    ui.markEntered()
    return
  }

  ctx = gsap.context(() => {
    gsap.to(wave.value, { x: -100, duration: 1.4, ease: 'none', repeat: -1 })
  }, root.value!)

  const startedAt = performance.now()
  let fill = 0
  tick = () => {
    const elapsed = (performance.now() - startedAt) / 1000
    const real = ui.loadProgress
    const goal = real >= 1 ? 1 : Math.min(0.88, 0.12 + (elapsed / 2.4) * 0.6 + real * 0.25)
    fill += (goal - fill) * 0.06
    percent.value = Math.round(fill * 100)
    gsap.set(liquid.value, { y: EMPTY_Y - (EMPTY_Y - FULL_Y) * fill })
    if (real >= 1 && fill > 0.985 && elapsed > 1.4) exit()
  }
  gsap.ticker.add(tick)
})

onBeforeUnmount(() => {
  if (tick) gsap.ticker.remove(tick)
  window.clearTimeout(safety)
  ctx?.revert()
})
</script>

<template>
  <div
    v-if="visible"
    ref="root"
    class="preloader"
    role="progressbar"
    aria-label="Loading Secawan"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percent"
  >
    <svg viewBox="0 -20 200 220" class="preloader__cup" aria-hidden="true">
      <defs>
        <clipPath id="preloader-cup-inside">
          <path d="M44 72 H156 C156 126 136 160 100 160 C64 160 44 126 44 72Z" />
        </clipPath>
      </defs>
      <path
        ref="steam"
        d="M100 54 C86 40 114 30 100 14 C90 2 106 -6 100 -16"
        fill="none"
        stroke="var(--sage)"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0"
      />
      <g ref="cup">
        <ellipse cx="100" cy="176" rx="74" ry="10" fill="var(--paper)" />
        <path d="M156 88 C192 86 192 136 152 138" fill="none" stroke="var(--espresso)" stroke-width="9" stroke-linecap="round" />
        <path d="M38 66 H162 C162 128 140 168 100 168 C60 168 38 128 38 66Z" fill="var(--cream)" stroke="var(--espresso)" stroke-width="6" stroke-linejoin="round" />
        <g clip-path="url(#preloader-cup-inside)">
          <g ref="liquid" :transform="`translate(0 ${EMPTY_Y})`">
            <path
              ref="wave"
              d="M-100 0 Q-75 -8 -50 0 T0 0 T50 0 T100 0 T150 0 T200 0 T250 0 T300 0 T350 0 V200 H-100Z"
              fill="var(--roast)"
            />
            <path d="M-100 4 H350" stroke="var(--crema)" stroke-width="3" opacity="0.5" />
          </g>
        </g>
      </g>
    </svg>
    <p class="preloader__label">
      <span class="hand">pouring your cup</span>
      <span class="preloader__pct">{{ percent }}%</span>
    </p>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: var(--z-preloader);
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1.25rem;
  background: var(--cream);
}
.preloader__cup {
  width: min(42vw, 190px);
  overflow: visible;
}
.preloader__label {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  color: var(--espresso);
}
.preloader__label .hand {
  font-size: 1.6rem;
}
.preloader__pct {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 0.95rem;
  min-width: 3.2ch;
  color: var(--espresso-soft);
}
</style>
