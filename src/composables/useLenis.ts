import Lenis from 'lenis'
import { shallowRef } from 'vue'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from './useReducedMotion'

const lenis = shallowRef<Lenis | null>(null)
let tickerFn: ((time: number) => void) | null = null

function start() {
  if (lenis.value || prefersReducedMotion()) return
  const instance = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
  })
  instance.on('scroll', ScrollTrigger.update)
  tickerFn = (time) => instance.raf(time * 1000)
  gsap.ticker.add(tickerFn)
  gsap.ticker.lagSmoothing(0)
  lenis.value = instance
}

function destroy() {
  if (tickerFn) gsap.ticker.remove(tickerFn)
  lenis.value?.destroy()
  lenis.value = null
  tickerFn = null
}

interface ScrollOptions {
  offset?: number
  immediate?: boolean
  onComplete?: () => void
}

/** Smooth-scroll to an element, selector or y position. Falls back to native scrolling. */
function scrollTo(target: string | HTMLElement | number, options: ScrollOptions = {}) {
  const offset = options.offset ?? -24
  if (lenis.value) {
    lenis.value.scrollTo(target, {
      offset,
      immediate: options.immediate,
      duration: 1.4,
      onComplete: options.onComplete,
    })
    return
  }
  let y = 0
  if (typeof target === 'number') y = target
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    if (!el) return
    y = el.getBoundingClientRect().top + window.scrollY + offset
  }
  window.scrollTo({ top: y, behavior: 'auto' })
  options.onComplete?.()
}

function stop() {
  lenis.value?.stop()
  document.body.classList.add('is-locked')
}

function resume() {
  lenis.value?.start()
  document.body.classList.remove('is-locked')
}

export function useLenis() {
  return { lenis, start, destroy, scrollTo, stop, resume }
}
