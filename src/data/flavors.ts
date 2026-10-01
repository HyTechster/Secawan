export interface FlavorNote {
  name: string
  description: string
}

export interface FlavorCategory {
  name: string
  color: string
  ink: string
  notes: FlavorNote[]
}

/** Flavor wheel: categories and the notes our lots actually show on the cupping table. */
export const flavorCategories: FlavorCategory[] = [
  {
    name: 'Fruity',
    color: '#D0673F',
    ink: '#F6F0E6',
    notes: [
      { name: 'Jackfruit', description: 'Ripe, tropical and a little floral. Typical of our Liberica.' },
      { name: 'Citrus peel', description: 'Bright zest that lifts the finish of a light roast.' },
      { name: 'Red berry', description: 'Soft, jammy sweetness from slow-dried cherries.' },
    ],
  },
  {
    name: 'Sweet',
    color: '#E8B97A',
    ink: '#2B1B14',
    notes: [
      { name: 'Brown sugar', description: 'Round caramel sweetness from a careful medium roast.' },
      { name: 'Gula Melaka', description: 'Smoky palm sugar depth, rich and lingering.' },
      { name: 'Honey', description: 'Silky and floral, common in honey-processed lots.' },
    ],
  },
  {
    name: 'Cocoa & Nut',
    color: '#5A3825',
    ink: '#F6F0E6',
    notes: [
      { name: 'Dark chocolate', description: 'Bittersweet and heavy, the backbone of our blends.' },
      { name: 'Toasted nuts', description: 'Warm almond and peanut notes from a longer roast.' },
      { name: 'Cocoa nib', description: 'Dry, crunchy cocoa on the finish.' },
    ],
  },
  {
    name: 'Floral & Herbal',
    color: '#8FA68A',
    ink: '#2B1B14',
    notes: [
      { name: 'Pandan', description: 'Grassy vanilla sweetness, a highland signature.' },
      { name: 'Jasmine', description: 'Light and perfumed, best in a V60.' },
      { name: 'Lemongrass', description: 'Clean, green and zesty.' },
    ],
  },
  {
    name: 'Spice',
    color: '#B98A5E',
    ink: '#2B1B14',
    notes: [
      { name: 'Cinnamon', description: 'Sweet warm spice in the aftertaste.' },
      { name: 'Clove', description: 'Deep, almost medicinal warmth in dark roasts.' },
      { name: 'Cardamom', description: 'Fragrant and cooling, a rare find.' },
    ],
  },
  {
    name: 'Roasted',
    color: '#3D2619',
    ink: '#F6F0E6',
    notes: [
      { name: 'Caramelized', description: 'Burnt-sugar edges from the end of the roast.' },
      { name: 'Smoky', description: 'Wood-fire depth that loves condensed milk.' },
      { name: 'Toast', description: 'Golden bread crust, mellow and comforting.' },
    ],
  },
]

export const allNotes = flavorCategories.flatMap((c) => c.notes.map((n) => n.name))
