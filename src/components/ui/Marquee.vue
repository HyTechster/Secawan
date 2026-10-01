<script setup lang="ts">
import { ref } from 'vue'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useScrollTrigger'

const props = withDefaults(
  defineProps<{
    items: string[]
    direction?: 1 | -1
    /** Seconds for one full loop at rest */
    duration?: number
  }>(),
  { direction: 1, duration: 38 },
)

const root = ref<HTMLElement | null>(null)

useGsapContext(root, ({ reduced, root: el }) => {
  if (reduced) return
  const track = el.querySelector<HTMLElement>('[data-track]')!
  const from = props.direction === 1 ? 0 : -50
  const loop = gsap.fromTo(track, { xPercent: from }, { xPercent: from - 50 * props.direction, duration: props.duration, ease: 'none', repeat: -1 })

  // Scroll velocity briefly speeds the loop up, then it settles back
  let settle: gsap.core.Tween | null = null
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate(self) {
      const boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 600)
      settle?.kill()
      loop.timeScale(boost)
      settle = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'sine.out' })
    },
    onToggle(self) {
      if (self.isActive) loop.play()
      else loop.pause()
    },
  })
})
</script>

<template>
  <div ref="root" class="marquee" aria-hidden="true">
    <div data-track class="marquee__track">
      <template v-for="copy in 2" :key="copy">
        <span v-for="item in items" :key="`${copy}-${item}`" class="marquee__chip">
          {{ item }}
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.marquee__track {
  display: flex;
  width: max-content;
  padding-block: 0.5rem;
  will-change: transform;
}
.marquee__chip {
  flex: none;
  padding: 0.9rem 1.6rem;
  /* margin, not gap, so both halves are identical and the -50% loop is seamless */
  margin-right: 0.9rem;
  border-radius: var(--radius-control);
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .marquee__track {
    flex-wrap: wrap;
    width: auto;
    justify-content: center;
  }
  .marquee__track > :nth-child(n + 7) {
    display: none;
  }
}
</style>
