<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { Minus, Plus, Trash2, X } from '@lucide/vue'
import { FREE_SHIPPING_THRESHOLD, grindLabels, useCartStore, type Grind } from '@/stores/cart'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useLenis } from '@/composables/useLenis'
import CoffeeBag from '@/components/ui/CoffeeBag.vue'
import Odometer from '@/components/ui/Odometer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DemoModal from './DemoModal.vue'

const cart = useCartStore()
const { scrollTo, stop, resume } = useLenis()
const panel = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLElement | null>(null)
const showDemo = ref(false)

const isOpen = toRef(cart, 'isOpen')
useFocusTrap(panel, isOpen, { onEscape: () => cart.close(), initial: closeBtn, lockScroll: false })

// Lock page scroll for the whole time the drawer is open (including the demo modal on top)
watch(isOpen, (open) => (open ? stop() : resume()))

const shippingMessage = computed(() =>
  cart.qualifiesForFreeShipping
    ? 'Free shipping unlocked. The beans travel on us.'
    : `RM ${cart.remainingForFreeShipping} away from free shipping`,
)

const grinds = Object.entries(grindLabels) as Array<[Grind, string]>
const base = import.meta.env.BASE_URL

function browse() {
  cart.close()
  scrollTo('#shop')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.isOpen" class="backdrop" aria-hidden="true" @click="cart.close()" />
    </Transition>
    <Transition name="drawer">
      <aside
        v-if="cart.isOpen"
        ref="panel"
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header class="drawer__head">
          <h2 id="cart-title" class="font-display drawer__title">
            Your <em>bag</em>
            <span class="drawer__count">{{ cart.count }} {{ cart.count === 1 ? 'item' : 'items' }}</span>
          </h2>
          <button ref="closeBtn" type="button" class="icon-btn" aria-label="Close bag" @click="cart.close()">
            <X :size="22" :stroke-width="1.9" aria-hidden="true" />
          </button>
        </header>

        <div class="shipping" role="status">
          <p class="shipping__text">{{ shippingMessage }}</p>
          <div class="shipping__bar" aria-hidden="true">
            <span class="shipping__fill" :style="{ transform: `scaleX(${cart.freeShippingProgress})` }" />
            <span class="shipping__rider" :style="{ transform: `translateX(${cart.freeShippingProgress * 100}%)` }">
              <svg class="shipping__bean" viewBox="0 0 24 32" width="12" height="16">
                <ellipse cx="12" cy="16" rx="10" ry="14" fill="var(--roast)" />
                <path d="M12 3c-3 5 3 9 0 13s3 9 0 13" fill="none" stroke="var(--espresso)" stroke-width="2.2" />
              </svg>
            </span>
          </div>
          <p class="sr-only">Free shipping from RM {{ FREE_SHIPPING_THRESHOLD }}.</p>
        </div>

        <ul v-if="cart.lines.length" v-auto-animate class="lines">
          <li v-for="line in cart.lines" :key="line.key" class="line">
            <div class="line__bag">
              <CoffeeBag :product-id="line.product.id" :name="line.product.name" :roast="line.product.roast" eager />
            </div>
            <div class="line__body">
              <div class="line__top">
                <h3 class="line__name">{{ line.product.name }}</h3>
                <p class="line__price">RM {{ line.lineTotal }}</p>
              </div>
              <label class="line__grind">
                <span class="sr-only">Grind for {{ line.product.name }}</span>
                <select :value="line.grind" @change="cart.setGrind(line.key, ($event.target as HTMLSelectElement).value as Grind)">
                  <option v-for="[value, text] in grinds" :key="value" :value="value">{{ text }}</option>
                </select>
              </label>
              <div class="line__controls">
                <div class="stepper" role="group" :aria-label="`Quantity of ${line.product.name}`">
                  <button type="button" :aria-label="`One less ${line.product.name}`" @click="cart.decrement(line.key)">
                    <Minus :size="16" :stroke-width="2.2" aria-hidden="true" />
                  </button>
                  <output :aria-label="`${line.qty} in bag`">{{ line.qty }}</output>
                  <button type="button" :aria-label="`One more ${line.product.name}`" @click="cart.increment(line.key)">
                    <Plus :size="16" :stroke-width="2.2" aria-hidden="true" />
                  </button>
                </div>
                <button type="button" class="line__remove" :aria-label="`Remove ${line.product.name}`" @click="cart.remove(line.key)">
                  <Trash2 :size="17" :stroke-width="1.9" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="empty">
          <img :src="`${base}images/cup.webp`" alt="" width="160" height="140" class="empty__cup" decoding="async" />
          <p class="font-display empty__title">Your bag is <em>empty.</em></p>
          <p class="empty__text">Pick a bag of beans and it will land here.</p>
          <BaseButton variant="dark" @click="browse">Browse the beans</BaseButton>
        </div>

        <footer v-if="cart.lines.length" class="drawer__foot">
          <div class="subtotal">
            <span>Subtotal</span>
            <Odometer class="subtotal__value font-display" :value="cart.subtotal" prefix="RM " :duration="900" :stagger="40" />
          </div>
          <BaseButton size="lg" class="w-full" @click="showDemo = true">Checkout</BaseButton>
          <p class="drawer__note">Shipping and grind are confirmed at checkout.</p>
        </footer>
      </aside>
    </Transition>
    <DemoModal v-model:open="showDemo" />
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-drawer);
  background: rgb(43 27 20 / 0.42);
  backdrop-filter: blur(3px);
}
.drawer {
  position: fixed;
  top: 10px;
  right: 10px;
  bottom: 10px;
  z-index: var(--z-drawer);
  width: min(440px, calc(100vw - 20px));
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-panel);
  background: var(--cream);
  box-shadow: var(--shadow-lift);
  overflow: hidden;
}
.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.4rem 1.4rem 0.8rem 1.6rem;
}
.drawer__title {
  font-size: 1.9rem;
  font-weight: 450;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
.drawer__count {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--espresso-soft);
}
.icon-btn {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--paper);
  color: var(--espresso);
}
.shipping {
  margin: 0 1.6rem 0.5rem;
  padding: 1rem 1.1rem;
  border-radius: 20px;
  background: var(--mist);
}
.shipping__text {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
}
.shipping__bar {
  position: relative;
  height: 6px;
  border-radius: 99px;
  background: rgb(43 27 20 / 0.1);
}
.shipping__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--sage-ink);
  transform-origin: left;
  transition: transform 0.8s var(--ease-settle);
}
.shipping__rider {
  position: absolute;
  inset: 0;
  transition: transform 0.8s var(--ease-settle);
}
.shipping__bean {
  position: absolute;
  left: 0;
  top: 50%;
  translate: -50% -50%;
}
.lines {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  margin: 0;
  padding: 0.5rem 1.6rem;
}
.line {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 1rem;
  padding-block: 1rem;
}
.line + .line {
  border-top: 1px solid rgb(43 27 20 / 0.08);
}
.line__bag {
  display: grid;
  place-items: center;
  height: 92px;
  border-radius: 18px;
  background: var(--paper);
  overflow: hidden;
}
.line__bag :deep(img) {
  width: 120%;
  max-width: none;
}
.line__top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.line__name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 500;
}
.line__price {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.line__grind select {
  margin-top: 0.35rem;
  padding: 0.4rem 2rem 0.4rem 0.8rem;
  border-radius: var(--radius-control);
  background: var(--paper)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%232B1B14' stroke-width='1.8'/%3E%3C/svg%3E")
    no-repeat right 0.8rem center;
  appearance: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--espresso);
}
.line__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
}
.stepper {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-control);
  box-shadow: inset 0 0 0 1.5px rgb(43 27 20 / 0.16);
}
.stepper button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: var(--espresso);
}
.stepper output {
  min-width: 2ch;
  text-align: center;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.line__remove {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: var(--espresso-soft);
}
.line__remove:hover {
  color: var(--terracotta-ink);
}
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}
.empty__cup {
  width: 160px;
  height: auto;
}
.empty__title {
  font-size: 1.7rem;
}
.empty__text {
  color: var(--espresso-soft);
  margin-bottom: 0.75rem;
}
.drawer__foot {
  padding: 1.2rem 1.6rem 1.4rem;
  border-top: 1px solid rgb(43 27 20 / 0.08);
  background: var(--paper);
}
.subtotal {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 600;
}
.subtotal__value {
  font-size: 1.8rem;
  font-weight: 500;
}
.drawer__note {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.82rem;
  color: var(--espresso-soft);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.drawer-enter-active {
  transition: transform 0.6s var(--ease-settle);
}
.drawer-leave-active {
  transition: transform 0.4s cubic-bezier(0.5, 0, 0.75, 0);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(calc(100% + 24px));
}
</style>
