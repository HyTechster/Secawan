<script setup lang="ts">
import { computed, defineAsyncComponent, markRaw, ref, shallowRef, watch } from 'vue'
import { useDocumentVisibility, useIntersectionObserver, useMouse, useWindowSize } from '@vueuse/core'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useUiStore } from '@/stores/ui'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useSplitReveal } from '@/composables/useSplitReveal'
import { useGsapContext } from '@/composables/useScrollTrigger'
import { useLenis } from '@/composables/useLenis'
import { hasWebGL } from '@/lib/webgl'
import { createSceneMotion } from '@/three/types'
import { loadCupAssets, type CupAssets } from '@/three/assets'
import BaseButton from '@/components/ui/BaseButton.vue'

const HeroScene = defineAsyncComponent(() => import('@/three/HeroScene.vue'))

const ui = useUiStore()
const reduced = useReducedMotion()
const { scrollTo } = useLenis()
const webgl = ref(hasWebGL())
if (!webgl.value) ui.heroReady = true

// The Blender-made cup, saucer and beans; if they fail to load, fall back to the static render
const assets = shallowRef<CupAssets | null>(null)
if (webgl.value) {
  loadCupAssets()
    .then((a) => (assets.value = markRaw(a)))
    .catch(() => {
      webgl.value = false
      ui.heroReady = true
    })
}
// Static render of the same cup (made in Blender), used when WebGL is unavailable
const base = import.meta.env.BASE_URL

const section = ref<HTMLElement | null>(null)
const headline = ref<HTMLElement | null>(null)

// Scene inputs live outside Vue reactivity; the render loop reads them every frame
const motion = markRaw(createSceneMotion())
const { x, y } = useMouse({ type: 'client', touch: false })
const { width, height } = useWindowSize()
watch([x, y], ([mx, my]) => {
  motion.pointer.x = (mx / width.value) * 2 - 1
  motion.pointer.y = -((my / height.value) * 2 - 1)
})

const inView = ref(true)
useIntersectionObserver(section, ([entry]) => (inView.value = !!entry?.isIntersecting))
const visibility = useDocumentVisibility()
const active = computed(() => inView.value && visibility.value === 'visible')

useSplitReveal(headline, { type: 'words', immediate: true, waitFor: () => ui.whenEntered(), delay: 0.05 })

useGsapContext(section, ({ reduced: isReduced, root, later }) => {
  if (isReduced) return
  const intro = root.querySelectorAll('[data-intro]')
  const arrow = root.querySelector('[data-arrow]')
  gsap.set(intro, { autoAlpha: 0, y: 24 })
  gsap.set(arrow, { drawSVG: '0%' })

  ui.whenEntered().then(() =>
    later(() => {
      gsap
        .timeline({ delay: 0.45 })
        .to(intro, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power2.out' })
        .to(arrow, { drawSVG: '100%', duration: 0.9, ease: 'sine.inOut' }, '-=0.3')
    }),
  )

  // Leaving the hero: beans scatter, cup turns, camera climbs above the clouds
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => (motion.scroll = self.progress),
  })
  gsap.to('[data-copy]', {
    yPercent: -18,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
  })
})
</script>

<template>
  <section id="top" ref="section" class="hero" aria-labelledby="hero-title">
    <div class="hero__scene" aria-hidden="true">
      <HeroScene
        v-if="webgl && assets"
        :assets="assets"
        :active="active"
        :reduced="reduced"
        :motion="motion"
        @ready="ui.heroReady = true"
      />
      <picture v-else-if="!webgl" class="hero__fallback">
        <source :srcset="`${base}images/hero-cup.avif`" type="image/avif" />
        <img :src="`${base}images/hero-cup.webp`" alt="" width="1600" height="1600" decoding="async" fetchpriority="high" />
      </picture>
    </div>

    <div class="shell hero__inner">
      <div data-copy class="hero__copy">
        <h1 id="hero-title" ref="headline" class="display font-display hero__title">
          Grown <em>above</em> the clouds.
        </h1>
        <p data-intro class="hero__sub">Small-batch coffee from 1,500 metres up, roasted the morning it ships.</p>
        <div data-intro class="hero__ctas">
          <BaseButton size="lg" magnetic href="#shop" data-cursor="Shop" @click.prevent="scrollTo('#shop')">Shop the beans</BaseButton>
          <a href="#story" class="text-link" @click.prevent="scrollTo('#story')">Our story</a>
        </div>
      </div>

      <p data-intro class="hero__note" aria-hidden="true">
        <span class="hand">still warm</span>
        <svg viewBox="0 0 120 60" width="110" height="55">
          <path data-arrow d="M6 40 C30 56 70 52 104 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <path data-arrow d="M90 18 L105 19 L101 33" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </p>
    </div>
    <p class="sr-only">A ceramic cup of coffee steams on its saucer while beans float through the morning mist.</p>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    radial-gradient(70% 60% at 78% 40%, rgb(232 185 122 / 0.28), transparent 70%),
    radial-gradient(60% 50% at 90% 10%, var(--mist), transparent 70%),
    linear-gradient(180deg, #f1ece3 0%, var(--cream) 100%);
}
/* Purely visual: the tilt follows the window pointer, so the canvas never needs touches.
   Letting them through keeps the page scrollable when a finger lands on the cup. */
.hero__scene {
  position: absolute;
  inset: auto 0 0 0;
  height: 56%;
  pointer-events: none;
  touch-action: pan-y;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 22%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 22%);
}
.hero__scene :deep(canvas) {
  display: block;
  /* Backstop for the inline TresCanvas styles; see three/passThrough.ts */
  pointer-events: none !important;
  touch-action: pan-y !important;
}
.hero__fallback,
.hero__fallback img {
  display: block;
  width: 100%;
  height: 100%;
}
.hero__fallback img {
  object-fit: cover;
  object-position: 50% 62%;
}
.hero__inner {
  position: relative;
  z-index: 1;
  align-self: flex-start;
  padding-top: calc(var(--nav-height) + 3.5rem);
  pointer-events: none;
}
.hero__copy {
  max-width: 40rem;
  pointer-events: auto;
}
.hero__title {
  font-size: clamp(3.1rem, 1.6rem + 6.4vw, 7rem);
  line-height: 0.98;
  font-weight: 380;
  letter-spacing: -0.035em;
  max-width: 9ch;
}
.hero__title :deep(em) {
  color: var(--terracotta-ink);
}
.hero__sub {
  margin-top: 1.4rem;
  max-width: 30ch;
  font-size: var(--step-1);
  color: var(--espresso-soft);
}
.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem 1.75rem;
  margin-top: 2rem;
}
.text-link {
  position: relative;
  font-weight: 700;
  color: var(--espresso);
  text-decoration: none;
  padding-block: 0.4rem;
}
.text-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.15rem;
  height: 2px;
  background: currentColor;
  transform-origin: right;
  transform: scaleX(0.35);
  transition: transform 0.5s var(--ease-settle);
}
.text-link:hover::after {
  transform-origin: left;
  transform: scaleX(1);
}
.hero__note {
  display: none;
  position: absolute;
  color: var(--roast);
}
.hero__note .hand {
  font-size: 1.7rem;
  display: block;
  rotate: -6deg;
}

@media (min-width: 900px) {
  .hero {
    align-items: center;
  }
  .hero__scene {
    inset: 0 0 0 auto;
    width: 62%;
    height: 100%;
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 20%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 20%);
  }
  .hero__inner {
    align-self: center;
    padding-top: var(--nav-height);
  }
  .hero__note {
    display: block;
    left: 44%;
    bottom: 15%;
  }
}
</style>
