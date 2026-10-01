import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from './useReducedMotion'

interface CountUpOptions {
  duration?: number
  ease?: string
  round?: number
}

/**
 * Tweens a displayed number toward `target` whenever it changes.
 * Returns the animated value; reduced motion jumps straight to the target.
 */
export function useCountUp(target: Ref<number>, { duration = 1.2, ease = 'power2.out', round = 1 }: CountUpOptions = {}) {
  const display = ref(target.value)
  const state = { value: target.value }
  let tween: gsap.core.Tween | null = null

  watch(
    target,
    (next) => {
      tween?.kill()
      if (prefersReducedMotion()) {
        state.value = next
        display.value = next
        return
      }
      tween = gsap.to(state, {
        value: next,
        duration,
        ease,
        onUpdate: () => {
          display.value = Math.round(state.value / round) * round
        },
      })
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => tween?.kill())
  return display
}
