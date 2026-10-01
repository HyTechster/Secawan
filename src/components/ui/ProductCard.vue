<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@lucide/vue'
import type { Product } from '@/data/products'
import { categoryLabels } from '@/data/products'
import { useTilt } from '@/composables/useTilt'
import CoffeeBag from './CoffeeBag.vue'

const props = defineProps<{ product: Product; highlightNote?: string | null }>()
const emit = defineEmits<{ add: [product: Product, from: HTMLElement] }>()

const card = ref<HTMLElement | null>(null)
const button = ref<HTMLElement | null>(null)
useTilt(card, { max: 7 })

const onAdd = () => emit('add', props.product, button.value!)
</script>

<template>
  <article ref="card" class="card" data-cursor="View">
    <div class="card__media" :style="{ '--tint': product.label }">
      <div class="card__bag">
        <CoffeeBag :product-id="product.id" :name="product.name" :roast="product.roast" />
      </div>
      <span class="card__glare" aria-hidden="true" />
    </div>
    <div class="card__body">
      <div class="card__row">
        <h3 class="card__name font-display">{{ product.name }}</h3>
        <p class="card__price">RM {{ product.price }}</p>
      </div>
      <p class="card__meta">{{ categoryLabels[product.category] }}. {{ product.origin }}</p>
      <ul class="card__notes" :aria-label="`Tasting notes for ${product.name}`">
        <li v-for="note in product.notes" :key="note" :class="{ 'is-match': note === highlightNote }">{{ note }}</li>
      </ul>
      <button ref="button" type="button" class="card__add" data-cursor="Add" @click="onAdd">
        <Plus :size="18" :stroke-width="2.2" aria-hidden="true" />
        Add to bag
        <span class="sr-only">: {{ product.name }}, RM {{ product.price }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-card);
  background: #fbf7f0;
  box-shadow: var(--shadow-soft);
  transition: box-shadow 0.5s var(--ease-settle);
  will-change: transform;
}
.card:hover {
  box-shadow: var(--shadow-lift);
}
.card__media {
  position: relative;
  aspect-ratio: 1;
  margin: 10px 10px 0;
  border-radius: calc(var(--radius-card) - 8px);
  background:
    radial-gradient(70% 60% at 50% 70%, color-mix(in srgb, var(--tint) 35%, transparent), transparent 70%),
    var(--paper);
  overflow: hidden;
  display: grid;
  place-items: center;
}
/* The render has transparent margin around the pouch, so the image runs larger than the bag */
.card__bag {
  position: absolute;
  inset: 0;
  transform-origin: 50% 88%;
  transition: transform 0.6s var(--ease-spring);
}
/* Fill the frame so the render's soft floor shadow never ends in a visible edge */
.card__bag :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 62%;
}
.card:hover .card__bag {
  animation: breathe 2.4s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.045, 1.06) translateY(-4px); }
}
.card__glare {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgb(255 255 255 / 0.55), transparent 55%);
  opacity: var(--glare-o, 0);
  mix-blend-mode: soft-light;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.1rem 1.25rem 1.25rem;
}
.card__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.card__name {
  font-size: 1.55rem;
  font-weight: 450;
  line-height: 1.1;
}
.card__price {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.card__meta {
  font-size: 0.88rem;
  color: var(--espresso-soft);
}
.card__notes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  list-style: none;
  padding: 0;
  margin: 0.2rem 0 0.4rem;
}
.card__notes li {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-control);
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--paper);
}
.card__notes li.is-match {
  background: var(--espresso);
  color: var(--cream);
}
.card__add {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-control);
  background: var(--espresso);
  color: var(--cream);
  font-weight: 700;
  font-size: 0.95rem;
  transition:
    background-color 0.3s ease,
    transform 0.3s var(--ease-spring);
}
.card__add:hover {
  background: var(--terracotta);
  color: #1c110b;
}
.card__add:active {
  transform: scale(0.96);
}
</style>
