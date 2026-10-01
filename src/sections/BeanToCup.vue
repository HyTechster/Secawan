<script setup lang="ts">
import { ref } from 'vue'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { journeyStages } from '@/data/story'
import { useGsapContext } from '@/composables/useScrollTrigger'
import { useReducedMotion } from '@/composables/useReducedMotion'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const reduced = useReducedMotion()
const section = ref<HTMLElement | null>(null)

/** Stage nodes in the 1200 x 640 viewBox. Top nodes carry their card above, bottom nodes below. */
const nodes: Array<[number, number]> = [
  [110, 440],
  [350, 220],
  [600, 430],
  [850, 220],
  [1090, 420],
]
const segments = [
  'M110 440 C200 440 250 220 350 220',
  'M350 220 C450 220 500 430 600 430',
  'M600 430 C700 430 750 220 850 220',
  'M850 220 C950 220 1000 420 1090 420',
]
const pathD = 'M110 440 C200 440 250 220 350 220 C450 220 500 430 600 430 C700 430 750 220 850 220 C950 220 1000 420 1090 420'

const r = 30
const circleD = `M0,-${r} A${r},${r} 0 1,1 0,${r} A${r},${r} 0 1,1 0,-${r}Z`

function sunD() {
  let d = 'M0,-11 A11,11 0 1,1 0,11 A11,11 0 1,1 0,-11Z'
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4
    const p = (ang: number, rad: number) => `${(Math.sin(ang) * rad).toFixed(2)},${(-Math.cos(ang) * rad).toFixed(2)}`
    d += ` M${p(a - 0.2, 15)} L${p(a, 26)} L${p(a + 0.2, 15)}Z`
  }
  return d
}

const iconD: Record<string, string> = {
  pick: 'M-21,8 A11,11 0 1,0 1,8 A11,11 0 1,0 -21,8Z M2,12 A10,10 0 1,0 22,12 A10,10 0 1,0 2,12Z M-11,-3 C-10,-13 -2,-19 3,-24 L6,-21 C1,-17 -5,-11 -7,-3Z M4,-23 C12,-28 23,-24 25,-15 C16,-13 8,-15 4,-23Z',
  dry: sunD(),
  roast: 'M0,-27 C9,-15 19,-6 19,8 C19,19 10,26 0,26 C-10,26 -19,19 -19,8 C-19,-2 -11,-8 -8,-17 C-4,-9 -2,-7 0,-3 C3,-11 3,-19 0,-27Z',
  rest: 'M-15,-16 L15,-16 L20,23 Q20,26 17,26 L-17,26 Q-20,26 -20,23Z M-13,-26 L13,-26 L15,-19 L-15,-19Z',
  brew: 'M-22,-6 L14,-6 L14,5 C14,17 6,25 -4,25 C-14,25 -22,17 -22,5Z M15,-2 C27,-2 27,16 13,16 L13,11 C21,11 21,3 15,3Z M-13,-11 C-16,-16 -10,-18 -13,-25 L-10,-25 C-7,-18 -13,-16 -10,-11Z M-1,-11 C-4,-16 2,-18 -1,-25 L2,-25 C5,-18 -1,-16 2,-11Z',
}

useGsapContext(section, ({ reduced: isReduced, root }) => {
  if (isReduced) return
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    const svg = root.querySelector<SVGSVGElement>('[data-journey]')!
    const path = svg.querySelector<SVGPathElement>('[data-path]')!
    const bean = svg.querySelector<SVGGElement>('[data-bean]')!
    const icons = gsap.utils.toArray<SVGPathElement>('[data-icon]', svg)
    const discs = gsap.utils.toArray<SVGCircleElement>('[data-disc]', svg)
    const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root)

    // Where along the full path each stage sits, from the real segment lengths
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.appendChild(probe)
    const lengths = segments.map((d) => {
      probe.setAttribute('d', d)
      return probe.getTotalLength()
    })
    probe.remove()
    const total = lengths.reduce((a, b) => a + b, 0)
    const at = [0]
    lengths.forEach((l, i) => at.push(at[i] + l / total))

    gsap.set(cards, { autoAlpha: 0, y: 24 })
    gsap.set(path, { drawSVG: '0%' })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=280%',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    })
    tl.to(path, { drawSVG: '100%', duration: 1 }, 0)
    tl.to(
      bean,
      { duration: 1, motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 90 } },
      0,
    )
    journeyStages.forEach((stage, i) => {
      if (i === 0) {
        // The first stage is where the bean starts, so it is already revealed
        gsap.set(icons[0], { morphSVG: iconD[stage.id] })
        gsap.set(cards[0], { autoAlpha: 1, y: 0 })
        return
      }
      const t = Math.max(0, at[i] - 0.03)
      tl.to(icons[i], { morphSVG: iconD[stage.id], duration: 0.07, ease: 'power2.out' }, t)
      tl.to(discs[i], { scale: 1.12, duration: 0.07, ease: 'back.out(3)', transformOrigin: '50% 50%' }, t)
      tl.to(cards[i], { autoAlpha: 1, y: 0, duration: 0.06, ease: 'power2.out' }, t)
    })
    tl.to({}, { duration: 0.12 })
    return () => tl.scrollTrigger?.kill()
  })

  mm.add('(max-width: 1023px)', () => {
    const line = root.querySelector('[data-vline]')
    gsap.fromTo(
      line,
      { drawSVG: '0%' },
      { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: root.querySelector('[data-vlist]'), start: 'top 70%', end: 'bottom 70%', scrub: true } },
    )
    gsap.utils.toArray<HTMLElement>('[data-vstage]', root).forEach((el) => {
      gsap.from(el, { autoAlpha: 0, x: 24, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
    })
  })

  ScrollTrigger.refresh()
})
</script>

<template>
  <section id="process" ref="section" class="journey" aria-labelledby="journey-title">
    <div class="shell journey__inner">
      <header class="journey__head">
        <SectionHeading id="journey-title">From cherry to <em>cup.</em></SectionHeading>
        <p class="journey__lede">Five steps, two months, one hillside. Scroll to follow a bean down the mountain.</p>
      </header>

      <!-- Desktop: one pinned, self-drawing path -->
      <div class="journey__stage">
        <svg data-journey class="journey__svg" viewBox="0 0 1200 640" aria-hidden="true">
          <path :d="pathD" fill="none" stroke="rgb(90 56 37 / 0.14)" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" />
          <path data-path :d="pathD" fill="none" stroke="var(--roast)" stroke-width="4" stroke-linecap="round" />
          <g v-for="(stage, i) in journeyStages" :key="stage.id" :transform="`translate(${nodes[i][0]} ${nodes[i][1]})`">
            <circle data-disc r="38" fill="var(--cream)" stroke="var(--roast)" stroke-width="2" />
            <path data-icon :d="reduced ? iconD[stage.id] : circleD" :fill="i % 2 ? 'var(--terracotta)' : 'var(--espresso)'" />
          </g>
          <g v-if="reduced" :transform="`translate(${nodes[4][0]} ${nodes[4][1] - 54})`">
            <ellipse rx="9" ry="12" fill="var(--roast)" />
          </g>
          <g v-else data-bean>
            <ellipse rx="9" ry="12" fill="var(--roast)" stroke="var(--cream)" stroke-width="2.5" />
            <path d="M0,-10 C-3,-4 3,2 0,10" fill="none" stroke="var(--espresso)" stroke-width="2" stroke-linecap="round" />
          </g>
        </svg>
        <div
          v-for="(stage, i) in journeyStages"
          :key="stage.id"
          class="card"
          :class="nodes[i][1] < 300 ? 'card--above' : 'card--below'"
          :style="{ left: `${(nodes[i][0] / 1200) * 100}%`, top: `${(nodes[i][1] / 640) * 100}%` }"
        >
          <div data-card>
            <h3 class="card__title font-display">{{ stage.title }}</h3>
            <p class="card__body">{{ stage.body }}</p>
            <p class="card__note hand">{{ stage.note }}</p>
          </div>
        </div>
      </div>

      <!-- Mobile and tablet: a simpler vertical path with the same stages -->
      <div data-vlist class="vlist">
        <svg class="vlist__line" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
          <path data-vline d="M20 0 C34 120 6 230 20 340 C34 450 6 560 20 670 C34 780 6 890 20 1000" fill="none" stroke="var(--roast)" stroke-width="3" vector-effect="non-scaling-stroke" />
        </svg>
        <ol class="vlist__items">
          <li v-for="(stage, i) in journeyStages" :key="stage.id" data-vstage class="vstage">
            <svg class="vstage__icon" viewBox="-40 -40 80 80" aria-hidden="true">
              <circle r="38" fill="var(--cream)" stroke="var(--roast)" stroke-width="2" />
              <path :d="iconD[stage.id]" :fill="i % 2 ? 'var(--terracotta)' : 'var(--espresso)'" />
            </svg>
            <div>
              <h3 class="card__title font-display">{{ stage.title }}</h3>
              <p class="card__body">{{ stage.body }}</p>
              <p class="card__note hand">{{ stage.note }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.journey {
  position: relative;
  background: var(--paper);
  overflow: hidden;
}
.journey__inner {
  padding-block: clamp(4rem, 8vw, 6rem);
}
.journey__head {
  display: grid;
  gap: 1rem;
  margin-bottom: 2.5rem;
}
.journey__lede {
  max-width: 44ch;
  font-size: var(--step-1);
  color: var(--espresso-soft);
}
.journey__stage {
  display: none;
}
.card__title {
  font-size: 1.6rem;
  font-weight: 500;
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  line-height: 1.1;
}
.card__body {
  margin-top: 0.3rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--espresso-soft);
}
.card__note {
  margin-top: 0.2rem;
  font-size: 1.25rem;
  color: var(--terracotta-ink);
}
.vlist {
  position: relative;
  padding-left: 0.25rem;
}
.vlist__line {
  position: absolute;
  left: 18px;
  top: 30px;
  bottom: 30px;
  width: 40px;
  height: calc(100% - 60px);
}
.vlist__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 2.5rem;
}
.vstage {
  position: relative;
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 1.1rem;
  align-items: center;
}
.vstage__icon {
  width: 76px;
  height: 76px;
}

@media (min-width: 1024px) {
  .journey__inner {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-block: calc(var(--nav-height) + 2rem) 2rem;
  }
  .journey__head {
    grid-template-columns: auto 1fr;
    align-items: end;
    gap: 2.5rem;
    margin-bottom: 0;
  }
  .journey__lede {
    padding-bottom: 0.6rem;
  }
  .journey__stage {
    display: block;
    position: relative;
    width: min(100%, calc((100dvh - 250px) * 1.875));
    margin-inline: auto;
    aspect-ratio: 1200 / 640;
  }
  .journey__svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .card {
    position: absolute;
    width: clamp(190px, 18vw, 240px);
    translate: -50% 0;
    text-align: center;
  }
  .card--above {
    transform: translateY(calc(-100% - 60px));
  }
  .card--below {
    margin-top: 52px;
  }
  .vlist {
    display: none;
  }
}
</style>
