import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type RoastName = 'Light' | 'Medium' | 'Dark'

export interface FlavorProfile {
  acidity: number
  body: number
  sweetness: number
  bitterness: number
}

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Interpolate between hex colors along stops placed at 0..100. */
export function mixStops(stops: Array<[number, string]>, level: number): string {
  const l = clamp(level)
  let i = 0
  while (i < stops.length - 2 && l > stops[i + 1][0]) i++
  const [p0, c0] = stops[i]
  const [p1, c1] = stops[i + 1]
  const t = p1 === p0 ? 0 : clamp((l - p0) / (p1 - p0), 0, 1)
  const a = parseInt(c0.slice(1), 16)
  const b = parseInt(c1.slice(1), 16)
  const ch = (n: number, s: number) => (n >> s) & 255
  const r = Math.round(lerp(ch(a, 16), ch(b, 16), t))
  const g = Math.round(lerp(ch(a, 8), ch(b, 8), t))
  const bl = Math.round(lerp(ch(a, 0), ch(b, 0), t))
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`
}

/** Profile anchors at light (0), medium (50) and dark (100). Values are 0..1. */
const anchors: Record<keyof FlavorProfile, [number, number, number]> = {
  acidity: [0.9, 0.55, 0.18],
  body: [0.35, 0.65, 0.92],
  sweetness: [0.55, 0.88, 0.5],
  bitterness: [0.12, 0.38, 0.85],
}

export const notesByRoast: Record<RoastName, string[]> = {
  Light: ['Citrus peel', 'Jasmine', 'Red berry', 'Lemongrass'],
  Medium: ['Brown sugar', 'Jackfruit', 'Pandan', 'Honey'],
  Dark: ['Dark chocolate', 'Toasted nuts', 'Gula Melaka', 'Smoky'],
}

export const brewByRoast: Record<RoastName, string> = {
  Light: 'V60 pour-over',
  Medium: 'AeroPress or V60',
  Dark: 'Moka pot or espresso',
}

/** Background stops. The jump at 50 keeps text contrast at WCAG AA on both sides of the flip. */
const backgroundStops: Array<[number, string]> = [
  [0, '#F4E8D2'],
  [49.99, '#D7A97C'],
  [50, '#6E4429'],
  [100, '#1F130D'],
]

/**
 * Multipliers over the 3D bean's baked light-roast colour map (white = as baked).
 * Kept separate from beanStops, which colour the flat fallback bean directly.
 */
const beanTintStops: Array<[number, string]> = [
  [0, '#FFF6EC'],
  [50, '#A06A4C'],
  [100, '#5A2E1A'],
]

const beanStops: Array<[number, string]> = [
  [0, '#B98E5E'],
  [50, '#6A3F22'],
  [100, '#24150D'],
]

export const useRoastLabStore = defineStore('roastLab', () => {
  /** 0 = lightest, 100 = darkest */
  const level = ref(42)

  const setLevel = (value: number) => {
    level.value = Math.round(clamp(value))
  }

  const roastName = computed<RoastName>(() => (level.value < 34 ? 'Light' : level.value < 67 ? 'Medium' : 'Dark'))

  const profile = computed<FlavorProfile>(() => {
    const t = level.value / 100
    const pick = ([l, m, d]: [number, number, number]) => (t <= 0.5 ? lerp(l, m, t * 2) : lerp(m, d, (t - 0.5) * 2))
    return {
      acidity: pick(anchors.acidity),
      body: pick(anchors.body),
      sweetness: pick(anchors.sweetness),
      bitterness: pick(anchors.bitterness),
    }
  })

  const notes = computed(() => notesByRoast[roastName.value])
  const recommendedBrew = computed(() => brewByRoast[roastName.value])
  const isDark = computed(() => level.value >= 50)
  const background = computed(() => mixStops(backgroundStops, level.value))
  const textColor = computed(() => (isDark.value ? '#F6F0E6' : '#2B1B14'))
  const beanColor = computed(() => mixStops(beanStops, level.value))
  const beanTint = computed(() => mixStops(beanTintStops, level.value))
  /** Darker roasts bring oils to the surface: more gloss, less roughness. */
  const beanRoughness = computed(() => lerp(0.75, 0.22, level.value / 100))
  const beanClearcoat = computed(() => lerp(0, 0.9, Math.max(0, (level.value - 40) / 60)))
  const firstCrack = computed(() => level.value >= 30)

  return {
    level,
    setLevel,
    roastName,
    profile,
    notes,
    recommendedBrew,
    isDark,
    background,
    textColor,
    beanColor,
    beanTint,
    beanRoughness,
    beanClearcoat,
    firstCrack,
  }
})
