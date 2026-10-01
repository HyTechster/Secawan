import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from './useReducedMotion'

interface TiltOptions {
  max?: number
  perspective?: number
}

/**
 * 3D tilt that follows the pointer, plus a glare position exposed as CSS variables
 * (--glare-x, --glare-y, --glare-o) on the element for a radial-gradient highlight.
 */
export function useTilt(target: Ref<HTMLElement | null | undefined>, { max = 8, perspective = 900 }: TiltOptions = {}) {
  const active = ref(false)
  let cleanup = () => {}

  onMounted(() => {
    const el = target.value
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    gsap.set(el, { transformPerspective: perspective, transformStyle: 'preserve-3d' })
    const rxTo = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' })
    const ryTo = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' })

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      ryTo((px - 0.5) * max * 2)
      rxTo(-(py - 0.5) * max * 2)
      el.style.setProperty('--glare-x', `${px * 100}%`)
      el.style.setProperty('--glare-y', `${py * 100}%`)
    }
    const onEnter = () => {
      active.value = true
      el.style.setProperty('--glare-o', '1')
    }
    const onLeave = () => {
      active.value = false
      rxTo(0)
      ryTo(0)
      el.style.setProperty('--glare-o', '0')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    cleanup = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
    }
  })

  onBeforeUnmount(() => cleanup())
  return { active }
}
