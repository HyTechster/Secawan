export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: 'Story', href: '#story' },
  { label: 'Roast Lab', href: '#roast-lab' },
  { label: 'Shop', href: '#shop' },
  { label: 'Brew', href: '#brew' },
  { label: 'Visit', href: '#visit' },
]

export const marqueeNotes = ['Dark chocolate', 'Jackfruit', 'Brown sugar', 'Pandan', 'Citrus peel', 'Toasted nuts']

export interface StoryChapter {
  title: string
  body: string
}

export const originChapters: StoryChapter[] = [
  {
    title: 'It starts in the mist.',
    body: 'Our farms sit on the ridges of the Titiwangsa range, where cloud rolls through the rows every morning and the days stay cool enough for cherries to ripen slowly.',
  },
  {
    title: 'Slow cherries, sweeter cups.',
    body: 'At 1,500 metres a coffee cherry can take nine months to ripen. That patience turns into sugar, and that sugar is what you taste as brown sugar and jackfruit.',
  },
  {
    title: 'Twelve farms, one handshake.',
    body: 'We buy from twelve families we know by name. Every bag tells you whose hillside it came from and the week it was picked.',
  },
]

export interface JourneyStage {
  id: 'pick' | 'dry' | 'roast' | 'rest' | 'brew'
  title: string
  body: string
  note: string
}

export const journeyStages: JourneyStage[] = [
  { id: 'pick', title: 'Pick', body: 'Only the reddest cherries, by hand, in the first light.', note: 'three passes per tree' },
  { id: 'dry', title: 'Dry', body: 'Raised beds under the highland sun for up to 20 days.', note: 'turned every hour' },
  { id: 'roast', title: 'Roast', body: 'Small batches in our 12 kg drum, the morning they ship.', note: 'listen for first crack' },
  { id: 'rest', title: 'Rest', body: 'Two days for the gas to settle and the sweetness to open.', note: 'patience, again' },
  { id: 'brew', title: 'Brew', body: 'At your table, any way you like. We will show you ours.', note: 'still warm' },
]

export interface Stat {
  value: number
  suffix: string
  label: string
}

export const stats: Stat[] = [
  { value: 1500, suffix: ' m', label: 'altitude at our highest farm' },
  { value: 48, suffix: ' h', label: 'from roast to your door' },
  { value: 12, suffix: '', label: 'partner farms, all family run' },
  { value: 100, suffix: '%', label: 'traceable lots, down to the week' },
]

export interface GalleryItem {
  id: string
  /** File name in public/images/gallery (Blender renders, see design/blender) */
  image: string
  title: string
  alt: string
}

export const gallery: GalleryItem[] = [
  { id: 'g1', image: 'still-warm', title: 'Still warm', alt: 'A cream cup of black coffee on a terracotta saucer, beans scattered on an oak table' },
  { id: 'g2', image: 'fresh-bags', title: 'This week’s roast', alt: 'Three kraft coffee pouches labelled Senja, Kabus and Nangka on an oak table' },
  { id: 'g3', image: 'first-pour', title: 'First pour', alt: 'A gooseneck kettle pouring into a white V60 dripper on a glass server' },
  { id: 'g4', image: 'roasted', title: 'Out of the drum', alt: 'Close-up of freshly roasted coffee beans on wood' },
  { id: 'g5', image: 'the-press', title: 'Four minutes, then press', alt: 'A French press full of coffee with beans beside it' },
  { id: 'g6', image: 'moka', title: 'At the gurgle', alt: 'An aluminium moka pot with its lid open' },
]
