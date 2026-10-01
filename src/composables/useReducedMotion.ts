import { computed, type ComputedRef } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'

let shared: ComputedRef<boolean> | null = null

/**
 * Single source of truth for reduced motion.
 * Also honours `?reduced-motion` in the URL so the static mode can be reviewed on any device.
 */
export function useReducedMotion(): ComputedRef<boolean> {
  if (shared) return shared
  const preference = usePreferredReducedMotion()
  const forced =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('reduced-motion')
  shared = computed(() => forced || preference.value === 'reduce')
  return shared
}

/** Non-reactive read for code that runs once (GSAP setup, canvas loops). */
export function prefersReducedMotion(): boolean {
  return useReducedMotion().value
}
