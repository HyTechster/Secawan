export type ProductCategory = 'single-origin' | 'blend' | 'liberica' | 'decaf'

export interface Product {
  id: string
  name: string
  origin: string
  category: ProductCategory
  notes: string[]
  price: number
  weight: string
  roast: 'Light' | 'Medium' | 'Dark'
  /** Label color on the bag illustration */
  label: string
  labelInk: string
  blurb: string
}

export const categoryLabels: Record<ProductCategory | 'all', string> = {
  all: 'All',
  'single-origin': 'Single Origin',
  blend: 'Blends',
  liberica: 'Liberica',
  decaf: 'Decaf',
}

export const products: Product[] = [
  {
    id: 'kabus',
    name: 'Kabus',
    origin: 'Ringlet terraces, 1,520 m',
    category: 'single-origin',
    notes: ['Jackfruit', 'Brown sugar', 'Citrus peel'],
    price: 58,
    weight: '250 g',
    roast: 'Light',
    label: '#DCE3DD',
    labelInk: '#2B1B14',
    blurb: 'Our flagship lot, picked in the morning mist.',
  },
  {
    id: 'teratak',
    name: 'Teratak',
    origin: 'Kampung Raja, 1,380 m',
    category: 'single-origin',
    notes: ['Pandan', 'Jasmine', 'Honey'],
    price: 62,
    weight: '250 g',
    roast: 'Light',
    label: '#8FA68A',
    labelInk: '#2B1B14',
    blurb: 'Honey-processed and gently floral.',
  },
  {
    id: 'senja',
    name: 'Senja Blend',
    origin: 'Three highland farms',
    category: 'blend',
    notes: ['Dark chocolate', 'Toasted nuts', 'Caramelized'],
    price: 48,
    weight: '250 g',
    roast: 'Dark',
    label: '#5A3825',
    labelInk: '#F6F0E6',
    blurb: 'Built for milk. Thick, sweet and steady.',
  },
  {
    id: 'pagi',
    name: 'Pagi Blend',
    origin: 'Highland and Johor lots',
    category: 'blend',
    notes: ['Brown sugar', 'Cocoa nib', 'Citrus peel'],
    price: 46,
    weight: '250 g',
    roast: 'Medium',
    label: '#E8B97A',
    labelInk: '#2B1B14',
    blurb: 'An everyday cup that tastes like a slow morning.',
  },
  {
    id: 'nangka',
    name: 'Nangka Liberica',
    origin: 'Batu Pahat smallholders',
    category: 'liberica',
    notes: ['Jackfruit', 'Gula Melaka', 'Smoky'],
    price: 54,
    weight: '250 g',
    roast: 'Medium',
    label: '#D0673F',
    labelInk: '#F6F0E6',
    blurb: 'Big, bold, unmistakably Malaysian.',
  },
  {
    id: 'madu',
    name: 'Madu Liberica',
    origin: 'Sungai Ruan, honey process',
    category: 'liberica',
    notes: ['Honey', 'Red berry', 'Clove'],
    price: 59,
    weight: '250 g',
    roast: 'Light',
    label: '#F0D9B5',
    labelInk: '#2B1B14',
    blurb: 'A softer Liberica with a jammy middle.',
  },
  {
    id: 'lena',
    name: 'Lena Decaf',
    origin: 'Swiss Water, highland lot',
    category: 'decaf',
    notes: ['Dark chocolate', 'Toasted nuts', 'Toast'],
    price: 52,
    weight: '250 g',
    roast: 'Medium',
    label: '#3D2619',
    labelInk: '#E8B97A',
    blurb: 'All of the comfort, none of the 2 a.m. thoughts.',
  },
  {
    id: 'rimba',
    name: 'Rimba',
    origin: 'Forest edge, 1,610 m',
    category: 'single-origin',
    notes: ['Red berry', 'Lemongrass', 'Cardamom'],
    price: 68,
    weight: '200 g',
    roast: 'Light',
    label: '#C9D6C4',
    labelInk: '#2B1B14',
    blurb: 'Our highest, rarest lot. Wild and fragrant.',
  },
]

export const productById = (id: string) => products.find((p) => p.id === id)
