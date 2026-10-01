<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Menu, ShoppingBag, X } from '@lucide/vue'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { navLinks } from '@/data/story'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'
import { useLenis } from '@/composables/useLenis'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

const cart = useCartStore()
const ui = useUiStore()
const { scrollTo } = useLenis()

const hidden = ref(false)
const scrolled = ref(false)
const activeHref = ref<string | null>(null)
const hoverHref = ref<string | null>(null)
const menuOpen = ref(false)

const linksEl = ref<HTMLElement | null>(null)
const blob = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)

const indicatorHref = computed(() => hoverHref.value ?? activeHref.value)
const triggers: ScrollTrigger[] = []

/** Slide the blob to the target link, squashing slightly mid-travel so it reads as liquid. */
function moveBlob(href: string | null) {
  const el = blob.value
  if (!el || !linksEl.value) return
  const link = href ? linksEl.value.querySelector<HTMLElement>(`a[href="${href}"]`) : null
  if (!link) {
    gsap.to(el, { opacity: 0, scale: 0.6, duration: 0.3 })
    return
  }
  const x = link.offsetLeft
  const width = link.offsetWidth
  if (prefersReducedMotion()) {
    gsap.set(el, { x, width, opacity: 1, scale: 1 })
    return
  }
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .to(el, { x, width, opacity: 1, scale: 1, duration: 0.55 }, 0)
    .to(el, { scaleY: 0.78, duration: 0.18, ease: 'sine.out' }, 0)
    .to(el, { scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, 0.18)
}

watch(indicatorHref, moveBlob)
watch(
  () => ui.navPeek,
  () => (hidden.value = false),
)

function go(href: string) {
  menuOpen.value = false
  scrollTo(href, { offset: href === '#top' ? 0 : -16 })
}

onMounted(() => {
  // Hide on scroll down, show on scroll up
  triggers.push(
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll()
        scrolled.value = y > 40
        if (menuOpen.value) return
        hidden.value = self.direction === 1 && y > 320
      },
    }),
  )

  // Track the section in view for the active link
  nextTick(() => {
    for (const link of navLinks) {
      const target = document.querySelector(link.href)
      if (!target) continue
      triggers.push(
        ScrollTrigger.create({
          trigger: target,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) activeHref.value = link.href
            else if (activeHref.value === link.href) activeHref.value = null
          },
        }),
      )
    }
  })
})

onBeforeUnmount(() => triggers.forEach((t) => t.kill()))

useFocusTrap(menuEl, menuOpen, { onEscape: () => (menuOpen.value = false) })
</script>

<template>
  <header class="nav-wrap" :class="{ 'is-hidden': hidden && !menuOpen, 'is-scrolled': scrolled }">
    <nav class="nav" aria-label="Primary">
      <a href="#top" class="nav__brand" aria-label="Secawan, back to top" @click.prevent="go('#top')">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
          <path d="M6 12h17v3c0 5-3.8 9-8.5 9S6 20 6 15z" fill="var(--espresso)" />
          <path d="M23 14h1.5a3 3 0 0 1 0 6H22" fill="none" stroke="var(--espresso)" stroke-width="2.2" stroke-linecap="round" />
          <path d="M12 9c-1.4-2 1.4-3 0-5.5M17 9c-1.4-2 1.4-3 0-5.5" fill="none" stroke="var(--terracotta)" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span class="nav__wordmark">Secawan</span>
      </a>

      <div ref="linksEl" class="nav__links" @mouseleave="hoverHref = null">
        <span ref="blob" class="nav__blob" aria-hidden="true" />
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="nav__link"
          :aria-current="activeHref === link.href ? 'true' : undefined"
          @mouseenter="hoverHref = link.href"
          @focus="hoverHref = link.href"
          @blur="hoverHref = null"
          @click.prevent="go(link.href)"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="nav__actions">
        <button
          id="cart-button"
          type="button"
          class="nav__cart"
          :aria-label="`Open bag, ${cart.count} ${cart.count === 1 ? 'item' : 'items'}`"
          data-cursor="View"
          @click="cart.open()"
        >
          <ShoppingBag :size="20" :stroke-width="1.9" aria-hidden="true" />
          <Transition name="badge" mode="out-in">
            <span v-if="cart.count > 0" :key="cart.count" class="nav__badge" aria-hidden="true">{{ cart.count }}</span>
          </Transition>
        </button>
        <button
          type="button"
          class="nav__menu-btn"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          aria-label="Open menu"
          @click="menuOpen = true"
        >
          <Menu :size="22" :stroke-width="1.9" aria-hidden="true" />
        </button>
      </div>
    </nav>
  </header>

  <Teleport to="body">
    <Transition name="menu">
      <div
        v-if="menuOpen"
        id="mobile-menu"
        ref="menuEl"
        class="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <button type="button" class="menu__close" aria-label="Close menu" @click="menuOpen = false">
          <X :size="26" :stroke-width="1.9" aria-hidden="true" />
        </button>
        <ul class="menu__list">
          <li v-for="(link, i) in navLinks" :key="link.href" :style="{ '--i': i }">
            <a :href="link.href" class="menu__link" @click.prevent="go(link.href)">{{ link.label }}</a>
          </li>
        </ul>
        <p class="menu__note hand">grown above the clouds</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.nav-wrap {
  position: fixed;
  top: 14px;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  display: flex;
  justify-content: center;
  padding-inline: 12px;
  pointer-events: none;
  transition: transform 0.5s var(--ease-settle);
}
.nav-wrap.is-hidden {
  transform: translateY(calc(-100% - 20px));
}
.nav {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(100%, 980px);
  height: var(--nav-height);
  padding: 0 0.5rem 0 1.15rem;
  border-radius: var(--radius-control);
  background: rgb(246 240 230 / 0.82);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  box-shadow:
    inset 0 0 0 1px rgb(43 27 20 / 0.07),
    0 10px 30px -18px rgb(43 27 20 / 0.35);
  transition: box-shadow 0.4s ease;
}
.is-scrolled .nav {
  box-shadow:
    inset 0 0 0 1px rgb(43 27 20 / 0.08),
    0 18px 40px -20px rgb(43 27 20 / 0.45);
}
.nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--espresso);
  text-decoration: none;
}
.nav__wordmark {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 560;
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  letter-spacing: -0.02em;
}
.nav__links {
  position: relative;
  display: none;
  align-items: center;
}
.nav__blob {
  position: absolute;
  left: 0;
  top: 50%;
  height: 40px;
  width: 80px;
  margin-top: -20px;
  border-radius: var(--radius-control);
  background: var(--paper);
  box-shadow: inset 0 0 0 1px rgb(43 27 20 / 0.06);
  opacity: 0;
  transform-origin: 50% 50%;
}
.nav__link {
  position: relative;
  padding: 0.55rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--espresso);
  text-decoration: none;
  white-space: nowrap;
}
.nav__link[aria-current='true'] {
  color: var(--terracotta-ink);
}
.nav__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.nav__cart,
.nav__menu-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: var(--cream);
  background: var(--espresso);
  transition: transform 0.35s var(--ease-spring);
}
.nav__menu-btn {
  background: transparent;
  color: var(--espresso);
}
.nav__cart:hover {
  transform: scale(1.06);
}
.nav__badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-control);
  background: var(--terracotta);
  color: #1c110b;
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 0 0 2.5px var(--cream);
}

.badge-enter-active {
  animation: badge-bounce 0.6s var(--ease-spring);
}
.badge-leave-active {
  transition: transform 0.12s ease-in;
}
.badge-leave-to {
  transform: scale(0.4);
}
@keyframes badge-bounce {
  0% { transform: scale(0.3); }
  45% { transform: scale(1.35) translateY(-4px); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@media (min-width: 900px) {
  .nav__links {
    display: flex;
  }
  .nav__menu-btn {
    display: none;
  }
}

/* Mobile overlay */
.menu {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem clamp(1.5rem, 8vw, 4rem);
  background: var(--sage);
  color: var(--espresso);
}
.menu__close {
  position: absolute;
  top: 22px;
  right: 22px;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--cream);
  color: var(--espresso);
}
.menu__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.menu__link {
  display: inline-block;
  padding: 0.25rem 0;
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 12vw, 4.5rem);
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
  line-height: 1.12;
  color: var(--espresso);
  text-decoration: none;
}
.menu__note {
  margin-top: 2rem;
  font-size: 1.6rem;
}
.menu-enter-active,
.menu-leave-active {
  transition: clip-path 0.6s var(--ease-settle);
}
.menu-enter-from,
.menu-leave-to {
  clip-path: circle(0% at calc(100% - 48px) 48px);
}
.menu-enter-to,
.menu-leave-from {
  clip-path: circle(150% at calc(100% - 48px) 48px);
}
.menu-enter-active li {
  animation: menu-rise 0.7s var(--ease-settle) both;
  animation-delay: calc(0.15s + var(--i) * 0.07s);
}
@keyframes menu-rise {
  from {
    opacity: 0;
    transform: translateY(40px) rotate(3deg);
  }
}
</style>
