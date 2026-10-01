<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/composables/useScrollTrigger'

withDefaults(defineProps<{ color?: string; opacity?: number }>(), { color: 'var(--mist)', opacity: 1 })

const shapes = [
  'M421,306Q392,362,341,394Q290,426,227,420Q164,414,117,370Q70,326,72,262Q74,198,111,146Q148,94,212,77Q276,60,334,92Q392,124,421,187Q450,250,421,306Z',
  'M438,295Q401,340,362,383Q323,426,258,433Q193,440,143,399Q93,358,78,297Q63,236,92,180Q121,124,180,98Q239,72,300,86Q361,100,418,145Q475,190,438,295Z',
  'M397,317Q399,384,333,405Q267,426,206,410Q145,394,103,343Q61,292,79,229Q97,166,144,115Q191,64,262,70Q333,76,371,135Q409,194,402,222Q395,250,397,317Z',
]

const root = ref<HTMLElement | null>(null)

useGsapContext(root, ({ reduced, root: el }) => {
  if (reduced) return
  const path = el.querySelector('path')!
  const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 7, ease: 'sine.inOut' } })
  tl.to(path, { morphSVG: shapes[1] }).to(path, { morphSVG: shapes[2] })
  gsap.to(el.querySelector('svg'), { rotation: 25, duration: 30, ease: 'sine.inOut', repeat: -1, yoyo: true, transformOrigin: '50% 50%' })
})
</script>

<template>
  <div ref="root" class="blob" aria-hidden="true">
    <svg viewBox="0 0 500 500" :style="{ opacity }">
      <path :d="shapes[0]" :fill="color" />
    </svg>
  </div>
</template>

<style scoped>
.blob {
  position: absolute;
  pointer-events: none;
  z-index: 0;
}
.blob svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
