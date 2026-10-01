<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ScrollTrigger } from '@/lib/gsap'
import { useUiStore } from '@/stores/ui'
import { useRoastLabStore } from '@/stores/roastLab'
import { useLenis } from '@/composables/useLenis'

import ThePreloader from '@/components/layout/ThePreloader.vue'
import TheNav from '@/components/layout/TheNav.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import CartDrawer from '@/components/layout/CartDrawer.vue'
import CustomCursor from '@/components/layout/CustomCursor.vue'
import LazySection from '@/components/ui/LazySection.vue'
import WaveDivider from '@/components/ui/WaveDivider.vue'

import HeroSection from '@/sections/HeroSection.vue'
import NotesMarquee from '@/sections/NotesMarquee.vue'
import OriginStory from '@/sections/OriginStory.vue'
import BeanToCup from '@/sections/BeanToCup.vue'
import ShopSection from '@/sections/ShopSection.vue'
import BrewGuide from '@/sections/BrewGuide.vue'
import NumbersBand from '@/sections/NumbersBand.vue'
import NewsletterCta from '@/sections/NewsletterCta.vue'

// Heavy sections load only when they approach the viewport
const RoastLab = defineAsyncComponent(() => import('@/sections/RoastLab.vue'))
const FlavorWheel = defineAsyncComponent(() => import('@/sections/FlavorWheel.vue'))
const FarmGallery = defineAsyncComponent(() => import('@/sections/FarmGallery.vue'))
const FindUs = defineAsyncComponent(() => import('@/sections/FindUs.vue'))

const ui = useUiStore()
const { background: labBackground } = storeToRefs(useRoastLabStore())
const { start, destroy, stop, resume } = useLenis()

onMounted(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  start()
  if (!ui.entered) stop()
  ui.whenEntered().then(() => {
    resume()
    ScrollTrigger.refresh()
  })
  document.fonts.ready.then(() => ScrollTrigger.refresh())
})

onBeforeUnmount(destroy)
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <ThePreloader />
  <TheNav />

  <main id="main">
    <HeroSection />
    <NotesMarquee />
    <WaveDivider fill="var(--mist)" from="var(--cream)" :variant="1" />
    <OriginStory />
    <WaveDivider fill="var(--paper)" from="var(--mist)" :variant="2" flip />
    <BeanToCup />
    <WaveDivider :fill="labBackground" from="var(--paper)" :variant="3" />

    <LazySection id="roast-lab" min-height="100vh" label="Loading the roast lab">
      <RoastLab />
    </LazySection>

    <WaveDivider fill="var(--cream)" :from="labBackground" :variant="1" flip />
    <LazySection id="flavors" min-height="90vh" label="Loading the flavor wheel">
      <FlavorWheel />
    </LazySection>

    <ShopSection />
    <WaveDivider fill="var(--mist)" from="var(--cream)" :variant="2" />
    <BrewGuide />
    <WaveDivider fill="var(--espresso)" from="var(--mist)" :variant="3" flip />
    <NumbersBand />
    <WaveDivider fill="var(--cream)" from="var(--espresso)" :variant="1" />

    <LazySection id="gallery" min-height="80vh" label="Loading the farm gallery">
      <FarmGallery />
    </LazySection>

    <WaveDivider fill="var(--paper)" from="var(--cream)" :variant="2" flip />
    <LazySection id="visit" min-height="90vh" label="Loading the café map">
      <FindUs />
    </LazySection>

    <WaveDivider fill="var(--cream)" from="var(--paper)" :variant="3" />
    <NewsletterCta />
    <WaveDivider fill="var(--espresso)" from="var(--cream)" :variant="1" />
  </main>

  <TheFooter />
  <CartDrawer />
  <CustomCursor />
  <div class="grain" aria-hidden="true" />
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: calc(var(--z-preloader) + 1);
  padding: 0.7rem 1.1rem;
  border-radius: var(--radius-control);
  background: var(--espresso);
  color: var(--cream);
  font-weight: 700;
  transform: translateY(-160%);
  transition: transform 0.3s var(--ease-settle);
}
.skip-link:focus-visible {
  transform: translateY(0);
}
</style>
