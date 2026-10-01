import { gsap } from '@/lib/gsap'
import { useUiStore } from '@/stores/ui'
import { prefersReducedMotion } from './useReducedMotion'

const BEAN_SVG = `<svg viewBox="0 0 24 32" width="22" height="28" aria-hidden="true">
  <ellipse cx="12" cy="16" rx="10" ry="14" fill="#5A3825"/>
  <path d="M12 3c-3 5 3 9 0 13s3 9 0 13" fill="none" stroke="#2B1B14" stroke-width="2" stroke-linecap="round"/>
</svg>`

/**
 * Arcs a small bean from `from` to the nav cart button along a bezier path,
 * then resolves so the caller can commit the cart change (and the badge bounces).
 */
export function useFlyToCart() {
  const ui = useUiStore()

  function fly(from: HTMLElement): Promise<void> {
    // The nav may be tucked away after scrolling down; bring it back for the landing
    ui.peekNav()
    const cart = document.getElementById('cart-button')
    if (!cart || prefersReducedMotion()) return Promise.resolve()

    const a = from.getBoundingClientRect()
    const b = cart.getBoundingClientRect()
    // Aim for where the cart rests once the nav has slid back, not where it is mid-slide
    const wrap = cart.closest<HTMLElement>('.nav-wrap')
    const navOffset = wrap ? new DOMMatrix(getComputedStyle(wrap).transform).m42 : 0
    const start = { x: a.left + a.width / 2 - 11, y: a.top + a.height / 2 - 14 }
    const end = { x: b.left + b.width / 2 - 11, y: b.top - navOffset + b.height / 2 - 14 }
    const control = {
      x: (start.x + end.x) / 2 + (end.x > start.x ? -80 : 80),
      y: Math.min(start.y, end.y) - Math.max(140, Math.abs(end.x - start.x) * 0.25),
    }

    const bean = document.createElement('div')
    bean.innerHTML = BEAN_SVG
    Object.assign(bean.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      zIndex: 'var(--z-modal)',
      pointerEvents: 'none',
      willChange: 'transform',
    })
    document.body.appendChild(bean)
    gsap.set(bean, { x: start.x, y: start.y })

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          bean.remove()
          resolve()
        },
      })
      tl.to(bean, {
        duration: 0.85,
        ease: 'power1.inOut',
        motionPath: {
          path: [start, control, end],
          type: 'quadratic',
        },
      })
        .to(bean, { rotation: 540, duration: 0.85, ease: 'power1.inOut' }, 0)
        .fromTo(bean, { scale: 1.3 }, { scale: 0.55, duration: 0.85, ease: 'power2.in' }, 0)
    })
  }

  return { fly }
}
