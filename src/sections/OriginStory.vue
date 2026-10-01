<script setup lang="ts">
import { computed, ref } from 'vue'
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap'
import { originChapters } from '@/data/story'
import { useGsapContext } from '@/composables/useScrollTrigger'
import { useCountUp } from '@/composables/useCountUp'
import { useReducedMotion } from '@/composables/useReducedMotion'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const reduced = useReducedMotion()
const section = ref<HTMLElement | null>(null)

const MAX_ALTITUDE = 1500
const progress = ref(0)
const altitudeTarget = computed(() => (reduced.value ? MAX_ALTITUDE : Math.round((progress.value * MAX_ALTITUDE) / 50) * 50))
const altitude = useCountUp(altitudeTarget, { duration: 0.6, round: 10 })
const altitudeLabel = computed(() => altitude.value.toLocaleString('en-US'))
const ticks = [0, 250, 500, 750, 1000, 1250, 1500]
const base = import.meta.env.BASE_URL

useGsapContext(section, ({ reduced: isReduced, root, later }) => {
  if (isReduced) return
  const mm = gsap.matchMedia()

  // Each layer travels at its own speed. Near hills drop away fastest, so it feels like climbing.
  const layers: Array<[string, number]> = [
    ['[data-layer="sun"]', -18],
    ['[data-layer="far"]', 6],
    ['[data-layer="mist-1"]', 10],
    ['[data-layer="mid"]', 14],
    ['[data-layer="terrace"]', 24],
    ['[data-layer="mist-2"]', 30],
    ['[data-layer="near"]', 42],
  ]

  mm.add('(min-width: 1024px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => (progress.value = self.progress),
      },
    })
    layers.forEach(([sel, y]) => tl.to(sel, { yPercent: y, ease: 'none' }, 0))
  })

  mm.add('(max-width: 1023px)', () => {
    const panel = root.querySelector('[data-panel]')
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => (progress.value = self.progress),
      },
    })
    layers.forEach(([sel, y]) => tl.to(sel, { yPercent: y * 0.6, ease: 'none' }, 0))
  })

  // Story copy reveals line by line from behind a mask
  document.fonts.ready.then(() =>
    later(() => {
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1,
              stagger: 0.09,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }),
        })
      })
      ScrollTrigger.refresh()
    }),
  )
})
</script>

<template>
  <section id="story" ref="section" class="story" aria-labelledby="story-title">
    <div class="shell story__grid">
      <div class="story__copy">
        <div class="story__intro">
          <SectionHeading id="story-title">Where the <em>mist</em> does the work.</SectionHeading>
        </div>
        <article v-for="chapter in originChapters" :key="chapter.title" class="chapter">
          <h3 class="chapter__title font-display" data-split>{{ chapter.title }}</h3>
          <p class="chapter__body" data-split>{{ chapter.body }}</p>
        </article>
      </div>

      <div class="story__visual">
        <div data-panel class="panel">
          <!--
            A clay diorama of the highlands, rendered in Blender as separate layers
            (design/blender: "Secawan Diorama"), so each one can travel at its own speed.
          -->
          <div class="landscape" aria-hidden="true">
            <img data-layer="sun" class="layer layer--sky" :src="`${base}images/highlands/sky.webp`" alt="" width="1100" height="1320" decoding="async" />
            <img data-layer="far" class="layer" :src="`${base}images/highlands/far.webp`" alt="" width="1100" height="1320" decoding="async" />
            <svg data-layer="mist-1" class="layer" viewBox="0 0 750 900" preserveAspectRatio="xMidYMax slice">
              <defs>
                <linearGradient id="story-mist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#F6F0E6" stop-opacity="0" />
                  <stop offset="0.5" stop-color="#F6F0E6" stop-opacity="0.8" />
                  <stop offset="1" stop-color="#F6F0E6" stop-opacity="0" />
                </linearGradient>
              </defs>
              <g class="drift drift--slow">
                <rect x="-300" y="430" width="1200" height="110" fill="url(#story-mist)" />
              </g>
            </svg>
            <img data-layer="mid" class="layer" :src="`${base}images/highlands/mid.webp`" alt="" width="1100" height="1320" decoding="async" />
            <img data-layer="terrace" class="layer" :src="`${base}images/highlands/terrace.webp`" alt="" width="1100" height="1320" decoding="async" />
            <svg data-layer="mist-2" class="layer" viewBox="0 0 750 900" preserveAspectRatio="xMidYMax slice">
              <g class="drift drift--fast">
                <rect x="-300" y="690" width="1200" height="90" fill="url(#story-mist)" />
              </g>
            </svg>
            <img data-layer="near" class="layer" :src="`${base}images/highlands/near.webp`" alt="" width="1100" height="1320" decoding="async" />
          </div>

          <div class="meter" role="img" :aria-label="`Altitude ${altitudeLabel} metres`">
            <div class="meter__scale" aria-hidden="true">
              <span v-for="t in ticks" :key="t" class="meter__tick" :style="{ bottom: `${(t / 1500) * 100}%` }">
                {{ t === 0 ? 'sea' : t.toLocaleString('en-US') }}
              </span>
              <span class="meter__marker" :style="{ transform: `translateY(${-(altitude / 1500) * 100}%)` }" />
            </div>
            <p class="meter__value" aria-hidden="true">
              <span class="font-display">{{ altitudeLabel }}</span> m
            </p>
          </div>
        </div>
        <p class="story__note hand" aria-hidden="true">the cloud line sits around 1,200 m</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.story {
  position: relative;
  background: linear-gradient(180deg, var(--cream) 0%, var(--mist) 100%);
  padding-block: clamp(4rem, 8vw, 7rem);
}
.story__grid {
  display: grid;
  gap: 3rem;
}
.story__visual {
  order: -1;
}
.panel {
  position: relative;
  height: 72vh;
  min-height: 420px;
  border-radius: var(--radius-panel);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  isolation: isolate;
}
.landscape {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #f2dfc0 0%, #f6efe4 48%, #e3e7df 100%);
}
/* Every layer is the same 5:6 render, anchored to the bottom, so they stay registered at any panel size */
.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 100%;
  will-change: transform;
}
/* Clay clouds come out of the renderer a touch cool; warm them to match the sky */
.layer--sky {
  filter: brightness(1.06) sepia(0.14);
}
.layer:is([data-layer='mid'], [data-layer='terrace'], [data-layer='near']) {
  filter: drop-shadow(0 -6px 14px rgb(43 27 20 / 0.12));
}
.drift {
  animation: drift 26s ease-in-out infinite alternate;
}
.drift--fast {
  animation-duration: 17s;
  animation-direction: alternate-reverse;
}
@keyframes drift {
  from {
    transform: translateX(-120px);
  }
  to {
    transform: translateX(120px);
  }
}
.meter {
  position: absolute;
  left: 1.25rem;
  top: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  align-items: flex-end;
  gap: 0.9rem;
  color: var(--espresso);
}
.meter__scale {
  position: relative;
  width: 3px;
  height: 100%;
  border-radius: 2px;
  background: rgb(43 27 20 / 0.18);
}
.meter__tick {
  position: absolute;
  left: 12px;
  translate: 0 50%;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgb(43 27 20 / 0.72);
  white-space: nowrap;
}
.meter__tick::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 50%;
  width: 7px;
  height: 1.5px;
  background: currentColor;
}
.meter__marker {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 16px;
  height: 100%;
  margin-left: -8px;
  pointer-events: none;
}
.meter__marker::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--terracotta);
  box-shadow: 0 0 0 4px rgb(246 240 230 / 0.85);
}
.meter__value {
  position: absolute;
  left: 4rem;
  top: 0;
  padding: 0.5rem 0.9rem;
  border-radius: 16px;
  background: rgb(246 240 230 / 0.88);
  backdrop-filter: blur(6px);
  font-weight: 700;
  white-space: nowrap;
}
.meter__value .font-display {
  font-size: 2rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.story__note {
  margin-top: 0.9rem;
  font-size: 1.4rem;
  color: var(--roast);
  text-align: right;
  rotate: -2deg;
}
.story__intro {
  margin-bottom: 2rem;
}
.chapter {
  max-width: 34rem;
  padding-block: 2rem;
}
.chapter__title {
  font-size: var(--step-3);
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 1rem;
}
.chapter__body {
  font-size: var(--step-1);
  color: var(--espresso-soft);
  max-width: 60ch;
}

@media (min-width: 1024px) {
  .story__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: clamp(3rem, 6vw, 6rem);
  }
  .story__visual {
    order: 0;
  }
  .story__visual {
    position: sticky;
    top: calc(var(--nav-height) + 36px);
    align-self: start;
    height: calc(100dvh - var(--nav-height) - 72px);
    display: flex;
    flex-direction: column;
  }
  .panel {
    flex: 1;
    height: auto;
  }
  .chapter {
    min-height: 62vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .story__intro {
    min-height: 40vh;
    display: flex;
    align-items: flex-end;
  }
}
</style>
