<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '@/lib/gsap'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

const enabled = ref(false)
const label = ref('')
const root = ref<HTMLElement | null>(null)
const bean = ref<HTMLElement | null>(null)
const bubble = ref<HTMLElement | null>(null)

let cleanup = () => {}

onMounted(() => {
  if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  enabled.value = true
  document.documentElement.classList.add('has-bean-cursor')

  requestAnimationFrame(() => {
    const el = root.value!
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
    const rotTo = gsap.quickTo(bean.value, 'rotation', { duration: 0.5, ease: 'power3.out' })

    let lastX = 0
    let lastY = 0
    let angle = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!visible) {
        visible = true
        gsap.set(el, { x: e.clientX, y: e.clientY })
        gsap.to(el, { opacity: 1, duration: 0.3 })
      }
      xTo(e.clientX)
      yTo(e.clientY)
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      if (Math.hypot(dx, dy) > 3) {
        // Rotate toward movement, taking the shortest way round
        const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90
        const delta =((target - angle + 540) % 360) - 180
        angle += delta
        rotTo(angle)
      }
      lastX = e.clientX
      lastY = e.clientY
    }

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, [role="slider"], [role="tab"]')
      const text = target?.dataset.cursor ?? ''
      label.value = text
      gsap.to(bubble.value, {
        scale: text ? 1 : 0,
        duration: text ? 0.45 : 0.25,
        ease: text ? 'back.out(2)' : 'power2.in',
      })
      gsap.to(bean.value, { scale: text ? 0 : target ? 1.6 : 1, duration: 0.35, ease: 'power3.out' })
    }

    const onLeaveWindow = () => {
      visible = false
      gsap.to(el, { opacity: 0, duration: 0.2 })
    }
    const onDown = () => gsap.to(el, { scale: 0.8, duration: 0.15 })
    const onUp = () => gsap.to(el, { scale: 1, duration: 0.4, ease: 'back.out(3)' })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      gsap.killTweensOf([el, bean.value, bubble.value])
    }
  })
})

onBeforeUnmount(() => {
  cleanup()
  document.documentElement.classList.remove('has-bean-cursor')
})
</script>

<template>
  <div v-if="enabled" ref="root" class="cursor" aria-hidden="true">
    <span ref="bean" class="cursor__bean">
      <svg viewBox="0 0 24 32" width="16" height="21">
        <ellipse cx="12" cy="16" rx="10" ry="14" fill="var(--roast)" />
        <path d="M12 3c-3 5 3 9 0 13s3 9 0 13" fill="none" stroke="var(--espresso)" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    </span>
    <span ref="bubble" class="cursor__bubble">{{ label }}</span>
  </div>
</template>

<style scoped>
.cursor {
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--z-cursor);
  pointer-events: none;
  display: grid;
  place-items: center;
  will-change: transform;
}
.cursor > * {
  grid-area: 1 / 1;
}
.cursor__bean {
  display: block;
  filter: drop-shadow(0 2px 3px rgb(43 27 20 / 0.25));
}
.cursor__bubble {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--espresso);
  color: var(--cream);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transform: scale(0);
}
</style>
