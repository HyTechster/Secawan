<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { categoryLabels, type Product, type ProductCategory } from '@/data/products'
import { useFiltersStore } from '@/stores/filters'
import { useCartStore } from '@/stores/cart'
import { useFlyToCart } from '@/composables/useFlyToCart'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import Chip from '@/components/ui/Chip.vue'
import ProductCard from '@/components/ui/ProductCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const filters = useFiltersStore()
const { category, note, filteredProducts } = storeToRefs(filters)
const cart = useCartStore()
const { fly } = useFlyToCart()

const categories = Object.entries(categoryLabels) as Array<[ProductCategory | 'all', string]>
const announcement = ref('')

/** Freeze a leaving card where it is, so the absolute-positioned leave does not collapse it. */
function freeze(el: Element) {
  const node = el as HTMLElement
  Object.assign(node.style, {
    width: `${node.offsetWidth}px`,
    height: `${node.offsetHeight}px`,
    left: `${node.offsetLeft}px`,
    top: `${node.offsetTop}px`,
  })
}

async function add(product: Product, from: HTMLElement) {
  await fly(from)
  cart.add(product.id)
  announcement.value = `${product.name} added to your bag.`
}
</script>

<template>
  <section id="shop" class="shop" aria-labelledby="shop-title">
    <div class="shell">
      <SectionHeading id="shop-title">Shop the <em>beans.</em></SectionHeading>
      <p class="shop__lede">Roasted on Monday and Thursday mornings. Every bag ships within 48 hours of roasting.</p>

      <div class="shop__filters" role="group" aria-label="Filter coffees">
        <Chip
          v-for="[value, label] in categories"
          :key="value"
          :selected="category === value"
          @click="filters.setCategory(value)"
        >
          {{ label }}
        </Chip>
        <Transition name="pop">
          <Chip v-if="note" :key="note" removable selected class="shop__note-chip" :aria-label="`Remove ${note} filter`" @remove="filters.setNote(null)">
            Note: {{ note }}
          </Chip>
        </Transition>
      </div>

      <TransitionGroup v-if="filteredProducts.length" tag="ul" name="grid" class="shop__grid" @before-leave="freeze">
        <li v-for="product in filteredProducts" :key="product.id" class="shop__item">
          <ProductCard :product="product" :highlight-note="note" @add="add" />
        </li>
      </TransitionGroup>

      <div v-else class="shop__empty">
        <p class="font-display shop__empty-title">No beans match <em>that pairing</em> yet.</p>
        <p>Try another family, or clear the filters to see the full shelf.</p>
        <BaseButton variant="dark" @click="filters.clearAll()">Clear filters</BaseButton>
      </div>

      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </div>
  </section>
</template>

<style scoped>
.shop {
  background: var(--cream);
  padding-block: clamp(4rem, 8vw, 7rem) clamp(5rem, 10vw, 9rem);
}
.shop__lede {
  margin-top: 1rem;
  max-width: 44ch;
  font-size: var(--step-1);
  color: var(--espresso-soft);
}
.shop__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 2.25rem 2rem;
}
.shop__note-chip {
  background: var(--terracotta) !important;
  color: #1c110b !important;
}
.shop__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
  list-style: none;
  padding: 0;
  margin: 0;
}
.shop__item {
  min-width: 0;
}
.grid-move {
  transition: transform 0.6s var(--ease-settle);
}
.grid-enter-active {
  transition:
    opacity 0.5s ease 0.1s,
    transform 0.6s var(--ease-spring) 0.1s;
}
.grid-leave-active {
  position: absolute;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(16px);
}
.shop__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 3rem 2rem;
  border-radius: var(--radius-panel);
  background: var(--paper);
}
.shop__empty-title {
  font-size: var(--step-2);
}
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.4s var(--ease-spring);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
