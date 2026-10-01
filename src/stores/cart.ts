import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { productById } from '@/data/products'

export type Grind = 'whole' | 'filter' | 'espresso'

export const grindLabels: Record<Grind, string> = {
  whole: 'Whole bean',
  filter: 'Filter',
  espresso: 'Espresso',
}

export interface CartItem {
  /** productId + grind, so the same coffee in two grinds stays as two lines */
  key: string
  productId: string
  grind: Grind
  qty: number
}

export const FREE_SHIPPING_THRESHOLD = 150
export const MAX_QTY = 20

const keyOf = (productId: string, grind: Grind) => `${productId}:${grind}`

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref<CartItem[]>([])
    const isOpen = ref(false)

    const lines = computed(() =>
      items.value
        .map((item) => {
          const product = productById(item.productId)
          return product ? { ...item, product, lineTotal: product.price * item.qty } : null
        })
        .filter((line): line is NonNullable<typeof line> => line !== null),
    )

    const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
    const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.lineTotal, 0))
    const remainingForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value))
    const freeShippingProgress = computed(() => Math.min(1, subtotal.value / FREE_SHIPPING_THRESHOLD))
    const qualifiesForFreeShipping = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD)

    function add(productId: string, qty = 1, grind: Grind = 'whole') {
      if (!productById(productId) || qty <= 0) return
      const key = keyOf(productId, grind)
      const existing = items.value.find((i) => i.key === key)
      if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty)
      else items.value.push({ key, productId, grind, qty: Math.min(MAX_QTY, qty) })
    }

    function remove(key: string) {
      items.value = items.value.filter((i) => i.key !== key)
    }

    function setQty(key: string, qty: number) {
      if (!Number.isFinite(qty) || qty <= 0) return remove(key)
      const item = items.value.find((i) => i.key === key)
      if (item) item.qty = Math.min(MAX_QTY, Math.floor(qty))
    }

    const increment = (key: string) => {
      const item = items.value.find((i) => i.key === key)
      if (item) setQty(key, item.qty + 1)
    }

    const decrement = (key: string) => {
      const item = items.value.find((i) => i.key === key)
      if (item) setQty(key, item.qty - 1)
    }

    /** Change grind; merges into an existing line if that grind is already in the bag. */
    function setGrind(key: string, grind: Grind) {
      const item = items.value.find((i) => i.key === key)
      if (!item || item.grind === grind) return
      const targetKey = keyOf(item.productId, grind)
      const target = items.value.find((i) => i.key === targetKey)
      if (target) {
        target.qty = Math.min(MAX_QTY, target.qty + item.qty)
        remove(key)
      } else {
        item.grind = grind
        item.key = targetKey
      }
    }

    function clear() {
      items.value = []
    }

    const open = () => (isOpen.value = true)
    const close = () => (isOpen.value = false)

    return {
      items,
      isOpen,
      lines,
      count,
      subtotal,
      remainingForFreeShipping,
      freeShippingProgress,
      qualifiesForFreeShipping,
      add,
      remove,
      setQty,
      increment,
      decrement,
      setGrind,
      clear,
      open,
      close,
    }
  },
  {
    persist: {
      key: 'secawan-cart',
      pick: ['items'],
    },
  },
)
