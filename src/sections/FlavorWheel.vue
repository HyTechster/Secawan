<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { hierarchy, partition, type HierarchyRectangularNode } from 'd3-hierarchy'
import { arc } from 'd3-shape'
import { useIntersectionObserver } from '@vueuse/core'
import { gsap } from '@/lib/gsap'
import { flavorCategories } from '@/data/flavors'
import { useFiltersStore } from '@/stores/filters'
import { useLenis } from '@/composables/useLenis'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import SectionHeading from '@/components/ui/SectionHeading.vue'

interface Datum {
  name: string
  color?: string
  ink?: string
  description?: string
  children?: Datum[]
  value?: number
}

type Node = HierarchyRectangularNode<Datum>
interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}

const filters = useFiltersStore()
const { scrollTo } = useLenis()

// D3 does the math: a partition laid out over a full turn and three rings
const data: Datum = {
  name: 'Flavors',
  children: flavorCategories.map((c) => ({
    name: c.name,
    color: c.color,
    ink: c.ink,
    children: c.notes.map((n) => ({ name: n.name, description: n.description, value: 1 })),
  })),
}
const root = partition<Datum>().size([2 * Math.PI, 3])(hierarchy(data).sum((d) => d.value ?? 0))
const nodes: Node[] = root.descendants().filter((d) => d.depth > 0)

const colorOf = (d: Node) => (d.depth === 1 ? d.data.color! : d.parent!.data.color!)
const inkOf = (d: Node) => (d.depth === 1 ? d.data.ink! : d.parent!.data.ink!)

/** Ring radius for a partition depth (0 = centre, 1 = inner edge of the first ring). */
const RADII = { hole: 78, ring: 100 }
const radius = (y: number) => (y <= 1 ? y * RADII.hole : RADII.hole + (y - 1) * RADII.ring)

const arcPath = arc<Box>()
  .startAngle((d) => d.x0)
  .endAngle((d) => d.x1)
  .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.012))
  .padRadius(RADII.hole * 2)
  .innerRadius((d) => radius(d.y0))
  .outerRadius((d) => Math.max(radius(d.y0), radius(d.y1) - 3))
  .cornerRadius(8)

const focus = shallowRef<Node>(root)
const boxes = ref<Box[]>(nodes.map((d) => ({ x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 })))

/** Zoomable sunburst: re-project every node relative to the focused category. */
function targetFor(d: Node, f: Node): Box {
  const span = f.x1 - f.x0
  return {
    x0: Math.max(0, Math.min(1, (d.x0 - f.x0) / span)) * 2 * Math.PI,
    x1: Math.max(0, Math.min(1, (d.x1 - f.x0) / span)) * 2 * Math.PI,
    y0: Math.max(0, d.y0 - f.depth),
    y1: Math.max(0, d.y1 - f.depth),
  }
}

let zoomTween: gsap.core.Tween | null = null
function zoomTo(f: Node) {
  focus.value = f
  const from = boxes.value.map((b) => ({ ...b }))
  const to = nodes.map((d) => targetFor(d, f))
  zoomTween?.kill()
  if (prefersReducedMotion()) {
    boxes.value = to
    return
  }
  const state = { t: 0 }
  zoomTween = gsap.to(state, {
    t: 1,
    duration: 0.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      const t = state.t
      boxes.value = from.map((a, i) => ({
        x0: a.x0 + (to[i].x0 - a.x0) * t,
        x1: a.x1 + (to[i].x1 - a.x1) * t,
        y0: a.y0 + (to[i].y0 - a.y0) * t,
        y1: a.y1 + (to[i].y1 - a.y1) * t,
      }))
    },
  })
}

const visible = (b: Box) => b.y1 <= 3.01 && b.y0 >= 0.99 && b.x1 - b.x0 > 0.001

const segments = computed(() =>
  nodes.map((d, i) => {
    const b = boxes.value[i]
    const mid = (b.x0 + b.x1) / 2
    const r = (radius(b.y0) + radius(b.y1)) / 2
    const angleDeg = (mid * 180) / Math.PI
    const arcLength = (b.x1 - b.x0) * r
    return {
      node: d,
      key: `${d.parent?.data.name}-${d.data.name}`,
      d: arcPath(b) ?? '',
      show: visible(b),
      color: colorOf(d),
      ink: inkOf(d),
      isLeaf: !d.children,
      mid,
      label: d.data.name,
      showLabel: visible(b) && arcLength > (d.children ? 70 : 34),
      // Radial labels, flipped on the left half so they never read upside down
      labelTransform: `rotate(${angleDeg - 90}) translate(${r},0) rotate(${angleDeg < 180 ? 0 : 180})`,
      horizontal: !d.children ? false : arcLength > 120,
      centroid: [Math.sin(mid) * r, -Math.cos(mid) * r] as const,
    }
  }),
)

const hovered = ref<string | null>(null)
const tip = computed(() => {
  const s = segments.value.find((x) => x.key === hovered.value)
  if (!s || !s.show) return null
  return {
    title: s.label,
    text: s.isLeaf ? s.node.data.description : `${s.node.children?.length} notes. Click to open.`,
    x: s.centroid[0],
    y: s.centroid[1],
  }
})

function activate(s: (typeof segments.value)[number]) {
  if (!s.show) return
  if (!s.isLeaf) {
    zoomTo(focus.value === s.node ? root : s.node)
    return
  }
  filters.setCategory('all')
  filters.setNote(s.label)
  scrollTo('#shop')
}

const centerLabel = computed(() => (focus.value === root ? 'Flavors' : focus.value.data.name))

// Draw the wheel in, segment by segment, the first time it is seen
const wheel = ref<SVGGElement | null>(null)
const { stop } = useIntersectionObserver(
  wheel,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    stop()
    if (prefersReducedMotion() || !wheel.value) return
    gsap.from(wheel.value.querySelectorAll('[data-seg]'), {
      opacity: 0,
      scale: 0.6,
      rotation: -25,
      svgOrigin: '0 0',
      duration: 0.9,
      ease: 'back.out(1.4)',
      stagger: { each: 0.035, from: 'start' },
      clearProps: 'transform,opacity',
    })
  },
  { threshold: 0.35 },
)
</script>

<template>
  <section class="flavors" aria-labelledby="flavors-title">
    <div class="shell flavors__grid">
      <div class="flavors__copy">
        <SectionHeading id="flavors-title">Taste in <em>circles.</em></SectionHeading>
        <p class="flavors__lede">
          Open a family, then pick a note. We will show you every bag that carries it.
        </p>
        <Transition name="fade" mode="out-in">
          <div :key="centerLabel" class="flavors__focus">
            <p class="font-display flavors__focus-title">{{ centerLabel === 'Flavors' ? 'Six families' : centerLabel }}</p>
            <ul class="flavors__legend">
              <li v-for="c in focus === root ? flavorCategories : flavorCategories.filter((x) => x.name === centerLabel)" :key="c.name">
                <span class="swatch" :style="{ background: c.color }" aria-hidden="true" />
                {{ focus === root ? c.name : c.notes.map((n) => n.name).join(', ') }}
              </li>
            </ul>
          </div>
        </Transition>
        <p class="flavors__hint hand">tip: click the centre to zoom back out</p>
      </div>

      <div class="flavors__wheel">
        <svg viewBox="-320 -320 640 640" class="wheel" role="group" aria-label="Flavor wheel">
          <g ref="wheel">
            <g
              v-for="s in segments"
              v-show="s.show"
              :key="s.key"
              data-seg
              :data-cursor="s.isLeaf ? 'Shop' : 'Open'"
            >
              <g
                class="seg"
                :class="{ 'is-hovered': hovered === s.key }"
                :style="{ '--dx': `${Math.sin(s.mid) * 9}px`, '--dy': `${-Math.cos(s.mid) * 9}px` }"
                role="button"
                :tabindex="s.show ? 0 : -1"
                :aria-label="s.isLeaf ? `${s.label}: show beans with this note` : `${s.label} family: open`"
                @mouseenter="hovered = s.key"
                @mouseleave="hovered = null"
                @focus="hovered = s.key"
                @blur="hovered = null"
                @click="activate(s)"
                @keydown.enter.prevent="activate(s)"
                @keydown.space.prevent="activate(s)"
              >
                <path :d="s.d" :fill="s.color" :opacity="s.isLeaf ? 0.82 : 1" />
                <text
                  v-if="s.showLabel"
                  :transform="s.horizontal ? `translate(${s.centroid[0]},${s.centroid[1]})` : s.labelTransform"
                  :fill="s.ink"
                  text-anchor="middle"
                  dominant-baseline="central"
                  class="seg__label"
                  :class="{ 'is-leaf': s.isLeaf }"
                >
                  {{ s.label }}
                </text>
              </g>
            </g>
          </g>
          <g
            class="wheel__center"
            role="button"
            tabindex="0"
            :aria-label="focus === root ? 'Flavor wheel' : 'Zoom back out to all flavor families'"
            @click="zoomTo(root)"
            @keydown.enter.prevent="zoomTo(root)"
          >
            <circle :r="RADII.hole - 6" fill="var(--paper)" />
            <text text-anchor="middle" dominant-baseline="central" class="wheel__center-text">{{ centerLabel }}</text>
          </g>
        </svg>
        <Transition name="fade">
          <div
            v-if="tip"
            class="tip"
            :style="{ left: `${((tip.x + 320) / 640) * 100}%`, top: `${((tip.y + 320) / 640) * 100}%` }"
            role="tooltip"
          >
            <strong>{{ tip.title }}</strong>
            <span>{{ tip.text }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flavors {
  background: var(--cream);
  padding-block: clamp(4.5rem, 9vw, 8rem);
}
.flavors__grid {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}
.flavors__lede {
  margin-top: 1rem;
  max-width: 38ch;
  font-size: var(--step-1);
  color: var(--espresso-soft);
}
.flavors__focus {
  margin-top: 2rem;
}
.flavors__focus-title {
  font-size: 1.6rem;
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  margin-bottom: 0.75rem;
}
.flavors__legend {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, max-content));
  gap: 0.5rem 1.5rem;
  font-weight: 600;
}
.flavors__legend li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex: none;
}
.flavors__hint {
  margin-top: 1.5rem;
  font-size: 1.35rem;
  color: var(--roast);
}
.flavors__wheel {
  position: relative;
  width: min(100%, 620px);
  margin-inline: auto;
}
.wheel {
  width: 100%;
  height: auto;
  overflow: visible;
}
.seg {
  cursor: pointer;
  outline: none;
  transition: transform 0.4s var(--ease-spring);
}
.seg.is-hovered {
  transform: translate(var(--dx), var(--dy));
}
.seg:focus-visible path {
  stroke: var(--terracotta);
  stroke-width: 3;
}
.seg path {
  transition: filter 0.3s ease;
}
.seg.is-hovered path {
  filter: brightness(1.06) drop-shadow(0 6px 10px rgb(43 27 20 / 0.25));
}
.seg__label {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 700;
  pointer-events: none;
}
.seg__label.is-leaf {
  font-size: 12.5px;
  font-weight: 600;
}
.wheel__center {
  cursor: pointer;
  outline: none;
}
.wheel__center:focus-visible circle {
  stroke: var(--terracotta);
  stroke-width: 3;
}
.wheel__center-text {
  font-family: var(--font-display);
  font-size: 17px;
  font-style: italic;
  fill: var(--espresso);
}
.tip {
  position: absolute;
  z-index: 2;
  width: 220px;
  translate: -50% calc(-100% - 18px);
  padding: 0.8rem 1rem;
  border-radius: 18px;
  background: var(--espresso);
  color: var(--cream);
  box-shadow: var(--shadow-lift);
  pointer-events: none;
  display: grid;
  gap: 0.2rem;
  font-size: 0.88rem;
  line-height: 1.4;
}
.tip strong {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (min-width: 1024px) {
  .flavors__grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 4rem;
  }
}
</style>
