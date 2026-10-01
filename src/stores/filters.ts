import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { products, type ProductCategory } from '@/data/products'

export const useFiltersStore = defineStore('filters', () => {
  const category = ref<ProductCategory | 'all'>('all')
  /** Note picked on the flavor wheel, shown as a removable chip in the shop */
  const note = ref<string | null>(null)

  const filteredProducts = computed(() =>
    products.filter(
      (p) => (category.value === 'all' || p.category === category.value) && (!note.value || p.notes.includes(note.value)),
    ),
  )

  const setCategory = (value: ProductCategory | 'all') => (category.value = value)
  const setNote = (value: string | null) => (note.value = value)
  const clearAll = () => {
    category.value = 'all'
    note.value = null
  }

  return { category, note, filteredProducts, setCategory, setNote, clearAll }
})
