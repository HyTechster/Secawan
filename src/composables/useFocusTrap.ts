import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'
import { useLenis } from './useLenis'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Open dialogs, topmost last. Only the top trap reacts to keys, so nested dialogs behave. */
const stack: symbol[] = []

interface FocusTrapOptions {
  onEscape?: () => void
  /** Element to focus first; defaults to the first focusable */
  initial?: Ref<HTMLElement | null | undefined>
  lockScroll?: boolean
}

/**
 * WAI-ARIA dialog behaviour: traps Tab inside `container` while `active`,
 * closes on Escape, locks page scroll and restores focus to the opener on close.
 */
export function useFocusTrap(
  container: Ref<HTMLElement | null | undefined>,
  active: Ref<boolean>,
  { onEscape, initial, lockScroll = true }: FocusTrapOptions = {},
) {
  const { stop, resume } = useLenis()
  const token = Symbol('focus-trap')
  let opener: HTMLElement | null = null

  const isTop = () => stack[stack.length - 1] === token

  const focusables = () =>
    Array.from(container.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (el) => el.getClientRects().length > 0,
    )

  function onKeydown(e: KeyboardEvent) {
    if (!active.value || !isTop()) return
    if (e.key === 'Escape') {
      e.preventDefault()
      onEscape?.()
      return
    }
    if (e.key !== 'Tab') return
    const items = focusables()
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const current = document.activeElement as HTMLElement | null
    const outside = !current || !container.value?.contains(current)
    if (e.shiftKey && (current === first || outside)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (current === last || outside)) {
      e.preventDefault()
      first.focus()
    }
  }

  function deactivate() {
    const i = stack.indexOf(token)
    if (i === -1) return
    stack.splice(i, 1)
    document.removeEventListener('keydown', onKeydown)
    if (lockScroll) resume()
    opener?.focus({ preventScroll: true })
    opener = null
  }

  watch(active, async (isActive) => {
    if (isActive) {
      opener = document.activeElement as HTMLElement | null
      stack.push(token)
      if (lockScroll) stop()
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      ;(initial?.value ?? focusables()[0])?.focus({ preventScroll: true })
    } else {
      deactivate()
    }
  })

  onBeforeUnmount(deactivate)
}
