import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from './useReducedMotion'

interface MagneticOptions {
  strength?: number
  radius?: number
}

/** Attach magnetic pull to an element. Returns a cleanup function. */
export function attachMagnetic(el: HTMLElement, { strength = 0.35, radius = 1.4 }: MagneticOptions = {}) {
  if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return () => {}
  }
  const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' })

  const onMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const reach = Math.max(rect.width, rect.height) * radius
    if (Math.hypot(dx, dy) > reach) {
      xTo(0)
      yTo(0)
      return
    }
    xTo(dx * strength)
    yTo(dy * strength)
  }
  const onLeave = () => {
    xTo(0)
    yTo(0)
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  el.addEventListener('pointerleave', onLeave)
  return () => {
    window.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    gsap.killTweensOf(el)
    gsap.set(el, { x: 0, y: 0 })
  }
}

export function useMagnetic(target: Ref<HTMLElement | null | undefined>, options?: MagneticOptions) {
  let cleanup = () => {}
  onMounted(() => {
    if (target.value) cleanup = attachMagnetic(target.value, options)
  })
  onBeforeUnmount(() => cleanup())
}
