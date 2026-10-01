<script setup lang="ts">
import { computed, defineAsyncComponent, markRaw, ref, shallowRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentVisibility, useIntersectionObserver, useMouse, useWindowSize } from '@vueuse/core'
import { useRoastLabStore } from '@/stores/roastLab'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { hasWebGL } from '@/lib/webgl'
import { createSceneMotion } from '@/three/types'
import { loadCupAssets, type CupAssets } from '@/three/assets'
import RoastSlider from '@/components/ui/RoastSlider.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const RoastBean = defineAsyncComponent(() => import('@/three/RoastBean.vue'))

const lab = useRoastLabStore()
const { level, roastName, profile, notes, recommendedBrew, background, textColor, isDark, beanColor, beanTint, beanRoughness, beanClearcoat } =
  storeToRefs(lab)

const reduced = useReducedMotion()
const webgl = ref(hasWebGL())
// Same Blender bean as the hero (cached after the first load)
const assets = shallowRef<CupAssets | null>(null)
if (webgl.value) {
  loadCupAssets()
    .then((a) => (assets.value = markRaw(a)))
    .catch(() => (webgl.value = false))
}
const section = ref<HTMLElement | null>(null)

const motion = markRaw(createSceneMotion())
const { x, y } = useMouse({ type: 'client', touch: false })
const { width, height } = useWindowSize()
watch([x, y], ([mx, my]) => {
  motion.pointer.x = (mx / width.value) * 2 - 1
  motion.pointer.y = -((my / height.value) * 2 - 1)
})

const inView = ref(false)
useIntersectionObserver(section, ([entry]) => (inView.value = !!entry?.isIntersecting))
const visibility = useDocumentVisibility()
const active = computed(() => inView.value && visibility.value === 'visible')

const sliderValue = computed({ get: () => level.value, set: (v: number) => lab.setLevel(v) })
const valueText = computed(() => `${roastName.value} roast, ${level.value} out of 100`)

const bars = computed(() => [
  { key: 'Acidity', value: profile.value.acidity },
  { key: 'Body', value: profile.value.body },
  { key: 'Sweetness', value: profile.value.sweetness },
  { key: 'Bitterness', value: profile.value.bitterness },
])
</script>

<template>
  <section
    ref="section"
    class="lab"
    :class="{ 'is-dark': isDark }"
    :style="{ backgroundColor: background, color: textColor }"
    aria-labelledby="lab-title"
  >
    <div class="shell lab__grid">
      <div class="lab__controls">
        <SectionHeading id="lab-title">Find your <em>roast.</em></SectionHeading>
        <p class="lab__lede">Drag the bean through the drum. Watch the color, the gloss and the cup change with it.</p>

        <RoastSlider v-model="sliderValue" class="lab__slider" label="Roast level" :value-text="valueText" :dark="isDark" />

        <div class="lab__readout" aria-live="polite">
          <p class="lab__brew">
            <span class="lab__brew-label">Recommended brew</span>
            <Transition name="swap" mode="out-in">
              <strong :key="recommendedBrew" class="font-display">{{ recommendedBrew }}</strong>
            </Transition>
          </p>
          <p class="sr-only">{{ roastName }} roast tastes of {{ notes.join(', ') }}.</p>
        </div>

        <TransitionGroup tag="ul" name="chip" class="lab__chips" aria-label="Tasting notes">
          <li v-for="note in notes" :key="note" class="lab__chip">{{ note }}</li>
        </TransitionGroup>

        <dl class="bars">
          <div v-for="bar in bars" :key="bar.key" class="bar">
            <dt>{{ bar.key }}</dt>
            <dd>
              <span class="bar__fill" :style="{ transform: `scaleX(${bar.value})` }" />
              <span class="sr-only">{{ Math.round(bar.value * 10) }} out of 10</span>
            </dd>
          </div>
        </dl>
      </div>

      <div class="lab__visual">
        <p class="lab__name font-display" aria-hidden="true">
          <Transition name="swap" mode="out-in">
            <span :key="roastName">{{ roastName }}</span>
          </Transition>
        </p>
        <div class="lab__bean" aria-hidden="true">
          <RoastBean
            v-if="webgl && assets"
            :assets="assets"
            :tint="beanTint"
            :roughness="beanRoughness"
            :clearcoat="beanClearcoat"
            :active="active"
            :reduced="reduced"
            :motion="motion"
          />
          <svg v-else-if="!webgl" viewBox="0 0 24 32" class="lab__bean-fallback">
            <ellipse cx="12" cy="16" rx="10" ry="14" :fill="beanColor" />
            <path d="M12 3c-3 5 3 9 0 13s3 9 0 13" fill="none" stroke="#1F130D" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </div>
        <p class="sr-only">A single coffee bean that darkens and turns glossy as the roast level rises.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lab {
  position: relative;
  padding-block: clamp(4.5rem, 9vw, 8rem);
  transition:
    background-color 0.5s ease,
    color 0.5s ease;
  overflow: hidden;
}
.lab__grid {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}
.lab__lede {
  margin-top: 1rem;
  max-width: 40ch;
  font-size: var(--step-1);
  opacity: 0.88;
}
.lab__slider {
  margin-top: 2.5rem;
  max-width: 34rem;
}
.lab__readout {
  margin-top: 1.75rem;
}
.lab__brew {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.75rem;
}
.lab__brew-label {
  font-weight: 600;
  opacity: 0.85;
}
.lab__brew strong {
  font-size: 1.6rem;
  font-weight: 500;
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.lab__chips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
  min-height: 2.8rem;
}
.lab__chip {
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-control);
  font-weight: 600;
  font-size: 0.92rem;
  background: rgb(43 27 20 / 0.08);
  box-shadow: inset 0 0 0 1px rgb(43 27 20 / 0.14);
}
.is-dark .lab__chip {
  background: rgb(246 240 230 / 0.1);
  box-shadow: inset 0 0 0 1px rgb(246 240 230 / 0.24);
}
.chip-enter-active,
.chip-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.45s var(--ease-spring);
}
.chip-leave-active {
  position: absolute;
}
.chip-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.85);
}
.chip-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.85);
}
.chip-move {
  transition: transform 0.45s var(--ease-settle);
}
.bars {
  display: grid;
  gap: 0.9rem;
  margin-top: 2rem;
  max-width: 30rem;
}
.bar {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  align-items: center;
  gap: 1rem;
}
.bar dt {
  font-weight: 600;
  font-size: 0.95rem;
}
.bar dd {
  position: relative;
  height: 10px;
  margin: 0;
  /* A hairline guide, not a filled track */
  --hairline: color-mix(in srgb, currentColor 28%, transparent);
  background: linear-gradient(var(--hairline), var(--hairline)) 0 50% / 100% 1px no-repeat;
}
.bar__fill {
  position: absolute;
  inset: 0;
  border-radius: 99px;
  background: var(--terracotta);
  transform-origin: left;
  transition: transform 0.7s var(--ease-settle);
}
.is-dark .bar__fill {
  background: var(--crema);
}
.lab__visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 340px;
}
.lab__name {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(4.5rem, 14vw, 11rem);
  font-style: italic;
  font-weight: 400;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  opacity: 0.12;
  pointer-events: none;
  letter-spacing: -0.04em;
}
.lab__bean {
  position: relative;
  width: min(100%, 520px);
  aspect-ratio: 1;
  /* Visual only; let touches scroll the page instead of being caught by the canvas */
  pointer-events: none;
}
.lab__bean :deep(canvas) {
  pointer-events: none !important;
  touch-action: pan-y !important;
}
.lab__bean-fallback {
  width: 50%;
  margin: 25% auto;
}
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.3s var(--ease-settle);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
@media (min-width: 1024px) {
  .lab__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 4rem;
  }
}
</style>
