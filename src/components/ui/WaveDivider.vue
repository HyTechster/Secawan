<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Color of the section below (the wave is filled with it) */
    fill: string
    /** Color of the section above, painted behind the wave */
    from?: string
    flip?: boolean
    variant?: 1 | 2 | 3
  }>(),
  { from: 'transparent', flip: false, variant: 1 },
)

// Paths run past the bottom of the viewBox so the antialiased edge never shows the color above
const paths = {
  1: 'M0,64 C180,10 360,10 540,46 C720,82 900,96 1080,62 C1260,28 1350,30 1440,44 L1440,126 L0,126 Z',
  2: 'M0,40 C200,92 420,98 640,62 C860,26 1020,18 1200,48 C1320,68 1390,72 1440,64 L1440,126 L0,126 Z',
  3: 'M0,80 C160,40 300,24 480,40 C700,60 820,96 1040,84 C1220,74 1340,36 1440,30 L1440,126 L0,126 Z',
} as const
</script>

<template>
  <div class="wave" :style="{ background: from }" aria-hidden="true">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" :style="flip ? 'transform: scaleX(-1)' : undefined">
      <path :d="paths[variant]" :fill="fill" />
    </svg>
  </div>
</template>

<style scoped>
.wave {
  position: relative;
  z-index: 1;
  line-height: 0;
  margin-top: -1px;
}
.wave svg {
  width: 100%;
  height: clamp(40px, 7vw, 110px);
  overflow: visible;
  margin-bottom: -2px;
}
</style>
