import type { Directive } from 'vue'
import { attachMagnetic } from '@/composables/useMagnetic'

interface MagneticEl extends HTMLElement {
  __magneticCleanup?: () => void
}

/** v-magnetic: the element leans toward the pointer. Optional value sets the strength. */
export const vMagnetic: Directive<MagneticEl, number | undefined> = {
  mounted(el, binding) {
    if (binding.value === 0) return
    el.__magneticCleanup = attachMagnetic(el, { strength: binding.value ?? 0.35 })
  },
  beforeUnmount(el) {
    el.__magneticCleanup?.()
  },
}
