import type { Directive } from 'vue'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

interface ParallaxEl extends HTMLElement {
  __parallaxTween?: gsap.core.Tween
}

/**
 * v-parallax: drifts an element vertically while its parent scrolls past.
 * The value is the travel in percent of the element's height (negative moves up).
 */
export const vParallax: Directive<ParallaxEl, number | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion()) return
    const amount = binding.value ?? -12
    el.__parallaxTween = gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )
  },
  beforeUnmount(el) {
    el.__parallaxTween?.scrollTrigger?.kill()
    el.__parallaxTween?.kill()
  },
}
