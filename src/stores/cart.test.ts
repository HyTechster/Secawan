import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { FREE_SHIPPING_THRESHOLD, MAX_QTY, useCartStore } from './cart'
import { productById } from '@/data/products'

const price = (id: string) => productById(id)!.price

describe('cart store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds items and merges the same product and grind', () => {
    const cart = useCartStore()
    cart.add('kabus')
    cart.add('kabus', 2)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(3)
    expect(cart.count).toBe(3)
  })

  it('keeps different grinds as separate lines', () => {
    const cart = useCartStore()
    cart.add('kabus', 1, 'whole')
    cart.add('kabus', 1, 'espresso')
    expect(cart.items).toHaveLength(2)
  })

  it('ignores unknown products and non-positive quantities', () => {
    const cart = useCartStore()
    cart.add('not-a-coffee')
    cart.add('kabus', 0)
    expect(cart.items).toHaveLength(0)
  })

  it('removes items', () => {
    const cart = useCartStore()
    cart.add('kabus')
    cart.add('senja')
    cart.remove(cart.items[0].key)
    expect(cart.items.map((i) => i.productId)).toEqual(['senja'])
  })

  it('updates quantity, removes at zero and caps at the maximum', () => {
    const cart = useCartStore()
    cart.add('pagi')
    const key = cart.items[0].key
    cart.increment(key)
    expect(cart.items[0].qty).toBe(2)
    cart.setQty(key, 999)
    expect(cart.items[0].qty).toBe(MAX_QTY)
    cart.setQty(key, 1)
    cart.decrement(key)
    expect(cart.items).toHaveLength(0)
  })

  it('computes the subtotal from product prices', () => {
    const cart = useCartStore()
    cart.add('kabus', 2)
    cart.add('senja', 1)
    expect(cart.subtotal).toBe(price('kabus') * 2 + price('senja'))
  })

  it('tracks the free shipping threshold', () => {
    const cart = useCartStore()
    cart.add('pagi', 1)
    expect(cart.qualifiesForFreeShipping).toBe(false)
    expect(cart.remainingForFreeShipping).toBe(FREE_SHIPPING_THRESHOLD - price('pagi'))
    expect(cart.freeShippingProgress).toBeCloseTo(price('pagi') / FREE_SHIPPING_THRESHOLD)

    cart.add('pagi', 3)
    expect(cart.qualifiesForFreeShipping).toBe(true)
    expect(cart.remainingForFreeShipping).toBe(0)
    expect(cart.freeShippingProgress).toBe(1)
  })

  it('merges lines when changing grind to one already in the bag', () => {
    const cart = useCartStore()
    cart.add('kabus', 1, 'whole')
    cart.add('kabus', 2, 'filter')
    cart.setGrind('kabus:whole', 'filter')
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ grind: 'filter', qty: 3, key: 'kabus:filter' })
  })

  it('changes grind in place when there is nothing to merge with', () => {
    const cart = useCartStore()
    cart.add('kabus', 1, 'whole')
    cart.setGrind('kabus:whole', 'espresso')
    expect(cart.items[0]).toMatchObject({ grind: 'espresso', key: 'kabus:espresso' })
  })
})
