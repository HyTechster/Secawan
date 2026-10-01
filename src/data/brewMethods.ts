export interface BrewStep {
  /** Seconds from start when this step begins */
  at: number
  label: string
}

export interface BrewMethod {
  id: 'v60' | 'french-press' | 'moka'
  name: string
  dose: string
  water: string
  time: string
  grind: string
  intro: string
  totalSeconds: number
  steps: BrewStep[]
}

export const brewMethods: BrewMethod[] = [
  {
    id: 'v60',
    name: 'V60',
    dose: '15 g',
    water: '250 g at 93°C',
    time: '2:45',
    grind: 'Medium-fine',
    intro: 'Clean and bright. The way to taste every note in a light roast.',
    totalSeconds: 165,
    steps: [
      { at: 0, label: 'Bloom with 45 g' },
      { at: 45, label: 'Pour slowly to 150 g' },
      { at: 75, label: 'Pour to 250 g' },
      { at: 110, label: 'Swirl and let it drain' },
      { at: 165, label: 'Serve' },
    ],
  },
  {
    id: 'french-press',
    name: 'French Press',
    dose: '30 g',
    water: '500 g at 95°C',
    time: '4:00',
    grind: 'Coarse',
    intro: 'Heavy body and zero fuss. Good for blends and slow Sundays.',
    totalSeconds: 240,
    steps: [
      { at: 0, label: 'Add all the water' },
      { at: 30, label: 'Stir the crust gently' },
      { at: 40, label: 'Lid on, steep' },
      { at: 225, label: 'Press slowly' },
      { at: 240, label: 'Pour it all out' },
    ],
  },
  {
    id: 'moka',
    name: 'Moka Pot',
    dose: '18 g',
    water: '180 g, hot from the kettle',
    time: '3:30',
    grind: 'Fine',
    intro: 'Strong and syrupy. Pour over ice with condensed milk.',
    totalSeconds: 210,
    steps: [
      { at: 0, label: 'Medium heat, lid open' },
      { at: 90, label: 'Coffee starts to flow' },
      { at: 150, label: 'Lower the heat' },
      { at: 180, label: 'Off the heat at the gurgle' },
      { at: 210, label: 'Stir and serve' },
    ],
  },
]
