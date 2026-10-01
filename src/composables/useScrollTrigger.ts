import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from './useReducedMotion'

interface SetupContext {
  reduced: boolean
  root: HTMLElement
  /** Run deferred work (after fonts, preloader, etc.) inside the same context so it is reverted too. */
  later: (fn: () => void) => void
}

type Setup = (ctx: SetupContext) => void | (() => void)

/**
 * Runs GSAP setup inside a gsap.context() scoped to `root` on mount and reverts it before unmount.
 * Every tween, ScrollTrigger and SplitText made inside `setup` (or `later`) is cleaned up automatically.
 */
export function useGsapContext(root: Ref<HTMLElement | null | undefined>, setup: Setup) {
  let ctx: gsap.Context | null = null
  let extraCleanup: void | (() => void)

  const later = (fn: () => void) => {
    if (ctx) ctx.add(fn)
  }

  onMounted(() => {
    if (!root.value) return
    const el = root.value
    ctx = gsap.context(() => {
      extraCleanup = setup({ reduced: prefersReducedMotion(), root: el, later })
    }, el)
  })

  onBeforeUnmount(() => {
    if (typeof extraCleanup === 'function') extraCleanup()
    ctx?.revert()
    ctx = null
  })
}

let refreshTimer: number | undefined

/** Debounced global refresh, used when lazy sections mount and change the page height. */
export function refreshScrollTriggers() {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120)
}
