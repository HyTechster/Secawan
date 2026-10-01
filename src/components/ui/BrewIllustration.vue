<script setup lang="ts">
import { computed } from 'vue'
import type { BrewMethod } from '@/data/brewMethods'

/**
 * Blender renders of each brewer (design/blender: "Secawan Brew" scene) in two states.
 * The finished state fades in at the matching moment of each recipe:
 * the V60 once the pours are done, the press at the plunge, the moka at the gurgle.
 */
const props = defineProps<{
  method: BrewMethod['id']
  /** 0..1, how far through the recipe */
  progress: number
  running: boolean
}>()

const base = import.meta.env.BASE_URL
const files = { v60: 'v60', 'french-press': 'press', moka: 'moka' } as const
const alts: Record<BrewMethod['id'], [string, string]> = {
  v60: ['A gooseneck kettle pours into a white V60 dripper on a glass server', 'The V60 server, now full of coffee'],
  'french-press': ['A French press steeping with the plunger raised', 'The French press with the plunger pressed down'],
  moka: ['An aluminium moka pot with its lid closed', 'The moka pot with its lid open and coffee inside'],
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const finished = computed(() => {
  const p = props.progress
  // Short windows so scrubbing never sits on a half-faded ghost of both states
  if (props.method === 'v60') return smooth(0.62, 0.7, p)
  if (props.method === 'french-press') return smooth(0.88, 0.98, p)
  return smooth(0.78, 0.9, p)
})
const name = computed(() => files[props.method])
</script>

<template>
  <div class="brew-art" :class="{ 'is-running': running }">
    <img
      class="brew-art__img"
      :src="`${base}images/brew/${name}-start.webp`"
      :alt="finished < 0.5 ? alts[method][0] : ''"
      :aria-hidden="finished >= 0.5"
      :style="{ opacity: 1 - finished }"
      width="760"
      height="760"
      loading="lazy"
      decoding="async"
    />
    <img
      class="brew-art__img brew-art__img--end"
      :src="`${base}images/brew/${name}-end.webp`"
      :alt="finished >= 0.5 ? alts[method][1] : ''"
      :aria-hidden="finished < 0.5"
      :style="{ opacity: finished }"
      width="760"
      height="760"
      loading="lazy"
      decoding="async"
    />
    <svg class="brew-art__steam" :class="`is-${method}`" viewBox="0 0 120 160" aria-hidden="true">
      <path d="M40 150 C24 120 56 104 40 74 C28 52 46 36 38 10" />
      <path d="M72 150 C60 126 86 110 72 84 C62 66 78 52 70 30" />
    </svg>
  </div>
</template>

<style scoped>
.brew-art {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  /* The renders carry a soft floor shadow; feather the frame so it never ends in an edge */
  -webkit-mask-image: radial-gradient(closest-side, #000 78%, transparent 100%);
  mask-image: radial-gradient(closest-side, #000 78%, transparent 100%);
}
.brew-art__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
/* Both layers fade so transparent areas of the finished render never show the start state */
.brew-art__img {
  transition: opacity 0.5s ease;
}
.brew-art__steam {
  position: absolute;
  width: 16%;
  left: 42%;
  top: 6%;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.brew-art__steam.is-french-press {
  left: 40%;
  top: 14%;
}
.brew-art__steam.is-moka {
  left: 30%;
  top: 12%;
}
.is-running .brew-art__steam {
  opacity: 0.8;
}
.brew-art__steam path {
  fill: none;
  stroke: rgb(255 255 255 / 0.9);
  stroke-width: 6;
  stroke-linecap: round;
  filter: blur(1.5px);
  animation: rise 2.6s ease-in-out infinite;
}
.brew-art__steam path:nth-child(2) {
  animation-delay: 1.2s;
}
@keyframes rise {
  0% {
    transform: translateY(18px);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  100% {
    transform: translateY(-16px);
    opacity: 0;
  }
}
</style>
