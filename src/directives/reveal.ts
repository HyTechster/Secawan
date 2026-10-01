import type { Directive } from 'vue'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

type RevealValue = number | { delay?: number; y?: number } | undefined

interface RevealEl extends HTMLElement {
  __revealObserver?: IntersectionObserver
  __revealTween?: gsap.core.Tween
}

/** v-reveal: fades and lifts an element in the first time it enters the viewport. */
export const vReveal: Directive<RevealEl, RevealValue> = {
  mounted(el, binding) {
    if (prefersReducedMotion()) return
    const opts = typeof binding.value === 'number' ? { delay: binding.value } : (binding.value ?? {})
    gsap.set(el, { opacity: 0, y: opts.y ?? 28 })
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer.disconnect()
        el.__revealTween = gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          delay: opts.delay ?? 0,
          clearProps: 'transform',
        })
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(el)
    el.__revealObserver = observer
  },
  beforeUnmount(el) {
    el.__revealObserver?.disconnect()
    el.__revealTween?.kill()
  },
}
