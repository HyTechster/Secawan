<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { stats } from '@/data/story'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import Odometer from '@/components/ui/Odometer.vue'

const root = ref<HTMLElement | null>(null)
// Start every counter at zero and let it roll up the first time the band is seen
const values = ref(stats.map((s) => (prefersReducedMotion() ? s.value : 0)))

const { stop } = useIntersectionObserver(
  root,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    values.value = stats.map((s) => s.value)
    stop()
  },
  { threshold: 0.4 },
)
</script>

<template>
  <section ref="root" class="numbers" aria-labelledby="numbers-title">
    <div class="shell">
      <h2 id="numbers-title" class="sr-only">Secawan in numbers</h2>
      <ul class="numbers__grid">
        <li v-for="(stat, i) in stats" :key="stat.label" class="stat">
          <Odometer class="stat__value font-display" :value="values[i]" :suffix="stat.suffix" :duration="1600 + i * 200" />
          <p class="stat__label">{{ stat.label }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.numbers {
  background: var(--espresso);
  color: var(--cream);
  padding-block: clamp(3.5rem, 7vw, 6rem);
}
.numbers__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.stat__value {
  font-size: clamp(2.6rem, 1.5rem + 4vw, 5.2rem);
  font-weight: 380;
  letter-spacing: -0.03em;
  color: var(--crema);
}
.stat__label {
  margin-top: 0.5rem;
  max-width: 18ch;
  color: rgb(246 240 230 / 0.82);
  font-weight: 500;
}
@media (min-width: 1024px) {
  .numbers__grid {
    grid-template-columns: 1.25fr 1fr 1fr 1fr;
  }
  .stat:not(:first-child) {
    padding-left: 1.5rem;
    border-left: 1px solid rgb(246 240 230 / 0.14);
  }
}
</style>
