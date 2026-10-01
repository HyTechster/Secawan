<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Clock, Coffee } from '@lucide/vue'
import { gsap } from '@/lib/gsap'
import { cafes, peninsulaPath, project } from '@/data/cafes'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const activeId = ref<string | null>('highlands')
const active = computed(() => cafes.find((c) => c.id === activeId.value) ?? null)
const pins = cafes.map((c) => ({ ...c, xy: project(c.lon, c.lat) }))

// Highland spine: soft relief blobs along the Titiwangsa range
const relief = [
  [130, 150, 34],
  [150, 205, 40],
  [170, 260, 36],
  [190, 312, 30],
].map(([lon, lat, r]) => ({ x: lon, y: lat, r }))

const mapEl = ref<SVGSVGElement | null>(null)
const { stop } = useIntersectionObserver(
  mapEl,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    stop()
    if (prefersReducedMotion() || !mapEl.value) return
    gsap.from(mapEl.value.querySelectorAll('[data-pin]'), {
      y: -60,
      opacity: 0,
      duration: 0.9,
      ease: 'bounce.out',
      stagger: 0.12,
    })
  },
  { threshold: 0.3 },
)
</script>

<template>
  <section class="visit" aria-labelledby="visit-title">
    <div class="shell visit__grid">
      <div class="visit__copy">
        <SectionHeading id="visit-title">Find us <em>for a cup.</em></SectionHeading>
        <p class="visit__lede">Six cafés from the island to the south. The roastery sits up in the hills, and yes, we pour there too.</p>

        <ul class="cafes">
          <li v-for="cafe in cafes" :key="cafe.id">
            <button
              type="button"
              class="cafe"
              :class="{ 'is-active': activeId === cafe.id }"
              :aria-pressed="activeId === cafe.id"
              @mouseenter="activeId = cafe.id"
              @focus="activeId = cafe.id"
              @click="activeId = cafe.id"
            >
              <span class="cafe__town font-display">{{ cafe.town }}</span>
              <span class="cafe__name">{{ cafe.name }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="visit__map">
        <svg ref="mapEl" viewBox="0 0 460 540" class="map" role="img" aria-label="Map of Peninsular Malaysia with Secawan café locations">
          <defs>
            <pattern id="sea-lines" width="40" height="18" patternUnits="userSpaceOnUse">
              <path d="M0 9 Q10 3 20 9 T40 9" fill="none" stroke="rgb(79 106 75 / 0.16)" stroke-width="1.5" />
            </pattern>
          </defs>
          <rect width="460" height="540" fill="url(#sea-lines)" />
          <path :d="peninsulaPath" fill="var(--cream)" stroke="var(--roast)" stroke-width="2" stroke-linejoin="round" />
          <ellipse cx="58" cy="141" rx="8" ry="11" fill="var(--cream)" stroke="var(--roast)" stroke-width="2" />
          <g fill="var(--sage)" opacity="0.35">
            <circle v-for="(b, i) in relief" :key="i" :cx="b.x" :cy="b.y" :r="b.r" />
          </g>
          <text x="180" y="272" class="map__hills hand">the highlands</text>

          <g
            v-for="pin in pins"
            :key="pin.id"
            :transform="`translate(${pin.xy[0]} ${pin.xy[1]})`"
            class="pin"
            :class="{ 'is-active': activeId === pin.id }"
            @mouseenter="activeId = pin.id"
          >
            <g data-pin>
              <g class="pin__body">
                <circle class="pin__pulse" r="10" fill="var(--terracotta)" />
                <path d="M0 0 C-10 -12 -12 -18 -12 -22 A12 12 0 1 1 12 -22 C12 -18 10 -12 0 0Z" fill="var(--terracotta)" stroke="var(--espresso)" stroke-width="1.5" />
                <circle cy="-22" r="4.5" fill="var(--cream)" />
              </g>
            </g>
          </g>
        </svg>

        <Transition name="card" mode="out-in">
          <div v-if="active" :key="active.id" class="cafe-card" aria-live="polite">
            <p class="cafe-card__name font-display">{{ active.name }}</p>
            <p class="cafe-card__row"><Clock :size="15" :stroke-width="2" aria-hidden="true" /> {{ active.hours }}</p>
            <p class="cafe-card__row"><Coffee :size="15" :stroke-width="2" aria-hidden="true" /> {{ active.signature }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.visit {
  background: var(--paper);
  padding-block: clamp(4.5rem, 9vw, 8rem);
}
.visit__grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}
.visit__lede {
  margin-top: 1rem;
  max-width: 40ch;
  font-size: var(--step-1);
  color: var(--espresso-soft);
}
.cafes {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}
.cafe {
  width: 100%;
  display: grid;
  gap: 0.1rem;
  padding: 0.8rem 1rem;
  border-radius: 20px;
  text-align: left;
  color: var(--espresso);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
.cafe:hover,
.cafe.is-active {
  background: var(--espresso);
  color: var(--cream);
}
.cafe__town {
  font-size: 1.25rem;
  font-weight: 450;
}
.cafe__name {
  font-size: 0.85rem;
  opacity: 0.85;
}
.visit__map {
  position: relative;
  width: min(100%, 520px);
  margin-inline: auto;
}
.map {
  width: 100%;
  height: auto;
  overflow: visible;
}
.map__hills {
  font-size: 18px;
  fill: var(--sage-ink);
}
.pin {
  cursor: pointer;
}
.pin__body {
  transition: transform 0.4s var(--ease-spring);
}
.pin.is-active .pin__body {
  transform: scale(1.3);
}
.pin__pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 2.2s ease-out infinite;
  opacity: 0;
}
@keyframes pulse {
  0% { transform: scale(0.4); opacity: 0.55; }
  100% { transform: scale(2.6); opacity: 0; }
}
/* Parked in the open sea to the south-west so it never hides a pin */
.cafe-card {
  position: absolute;
  z-index: 2;
  left: 0;
  bottom: 6%;
  width: min(240px, 52%);
  padding: 0.9rem 1rem;
  border-radius: 20px;
  background: var(--espresso);
  color: var(--cream);
  box-shadow: var(--shadow-lift);
  pointer-events: none;
}
.cafe-card__name {
  font-size: 1.15rem;
  margin-bottom: 0.35rem;
}
.cafe-card__row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.86rem;
}
.card-enter-active,
.card-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.3s var(--ease-spring);
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
@media (min-width: 1024px) {
  .visit__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 4rem;
  }
}
</style>
