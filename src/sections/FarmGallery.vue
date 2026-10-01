<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { gsap } from '@/lib/gsap'
import { gallery } from '@/data/story'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import GalleryPhoto from '@/components/ui/GalleryPhoto.vue'
import Lightbox from '@/components/layout/Lightbox.vue'

const [emblaRef, emblaApi] = emblaCarouselVue({ dragFree: true, align: 'start', containScroll: 'trimSnaps', loop: false })
const openIndex = ref<number | null>(null)
const canPrev = ref(false)
const canNext = ref(true)

let lastProgress = 0
let slides: HTMLElement[] = []

watch(
  emblaApi,
  (api) => {
    if (!api) return
    slides = api.slideNodes()
    const sync = () => {
      canPrev.value = api.canScrollPrev()
      canNext.value = api.canScrollNext()
    }
    sync()
    api.on('select', sync).on('reInit', sync)

    if (prefersReducedMotion()) return
    // Cards lean in the direction of travel while dragging, then straighten when released
    api.on('scroll', () => {
      const p = api.scrollProgress()
      const velocity = (p - lastProgress) * 1000
      lastProgress = p
      const tilt = gsap.utils.clamp(-7, 7, -velocity * 0.9)
      gsap.to(slides, { rotation: tilt, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
    })
    api.on('pointerUp', () => gsap.to(slides, { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' }))
    api.on('settle', () => gsap.to(slides, { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' }))
  },
  { immediate: true },
)

// Embla swallows the click that ends a drag, so a click here is always intentional
const open = (i: number) => (openIndex.value = i)

/** Keep keyboard focus visible: scroll the focused slide into the viewport */
const onFocus = (i: number) => emblaApi.value?.scrollTo(Math.min(i, emblaApi.value.scrollSnapList().length - 1))

onBeforeUnmount(() => gsap.killTweensOf(slides))
</script>

<template>
  <section class="gallery" aria-labelledby="gallery-title">
    <div class="shell gallery__head">
      <SectionHeading id="gallery-title">Notes from the <em>roastery.</em></SectionHeading>
      <div class="gallery__nav">
        <button type="button" class="nav-btn" :disabled="!canPrev" aria-label="Previous images" @click="emblaApi?.scrollPrev()">
          <ChevronLeft :size="22" :stroke-width="2" aria-hidden="true" />
        </button>
        <button type="button" class="nav-btn" :disabled="!canNext" aria-label="Next images" @click="emblaApi?.scrollNext()">
          <ChevronRight :size="22" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div :ref="(el) => (emblaRef = el as HTMLElement)" class="embla" aria-roledescription="carousel" aria-label="Farm gallery, drag to explore">
      <ul class="embla__container">
        <li v-for="(item, i) in gallery" :key="item.id" class="embla__slide" :class="`is-${i % 3}`" aria-roledescription="slide">
          <button type="button" class="slide" data-cursor="View" :aria-label="`Open ${item.title}`" @click="open(i)" @focus="onFocus(i)">
            <span class="slide__art">
              <GalleryPhoto :image="item.image" :alt="item.alt" />
            </span>
            <span class="slide__title font-display">{{ item.title }}</span>
          </button>
        </li>
      </ul>
    </div>
    <p class="shell gallery__hint hand" aria-hidden="true">drag me, gently</p>

    <Lightbox v-model:index="openIndex" :items="gallery" />
  </section>
</template>

<style scoped>
.gallery {
  background: var(--cream);
  padding-block: clamp(4.5rem, 9vw, 8rem);
  overflow: hidden;
}
.gallery__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.gallery__nav {
  display: flex;
  gap: 0.5rem;
}
.nav-btn {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--paper);
  color: var(--espresso);
  transition:
    background-color 0.3s ease,
    opacity 0.3s ease;
}
.nav-btn:hover:not(:disabled) {
  background: var(--espresso);
  color: var(--cream);
}
.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.embla {
  overflow: visible;
  padding-left: max(clamp(1rem, 4vw, 3rem), calc((100vw - 1360px) / 2 + 3rem));
  cursor: grab;
}
.embla:active {
  cursor: grabbing;
}
.embla__container {
  display: flex;
  gap: clamp(0.9rem, 2vw, 1.5rem);
  list-style: none;
  padding: 0;
  margin: 0;
  touch-action: pan-y pinch-zoom;
}
.embla__slide {
  flex: 0 0 auto;
  width: clamp(240px, 26vw, 380px);
  transform-origin: 50% 100%;
}
.embla__slide.is-1 {
  margin-top: 2.5rem;
}
.embla__slide.is-2 {
  width: clamp(260px, 30vw, 440px);
}
.slide {
  display: grid;
  gap: 0.8rem;
  width: 100%;
  text-align: left;
  color: var(--espresso);
}
.slide__art {
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: transform 0.6s var(--ease-settle);
}
.slide:hover .slide__art {
  transform: scale(0.98);
}
.slide__title {
  font-size: 1.3rem;
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.gallery__hint {
  margin-top: 1.5rem;
  font-size: 1.35rem;
  color: var(--roast);
}
</style>
