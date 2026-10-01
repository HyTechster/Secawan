export interface Cafe {
  id: string
  name: string
  town: string
  hours: string
  signature: string
  /** Longitude and latitude, projected onto the stylized map */
  lon: number
  lat: number
}

/** Simple equirectangular projection into the 460 x 540 map viewBox. */
export const project = (lon: number, lat: number): [number, number] => [(lon - 99.6) * 92, (6.95 - lat) * 92]

/** Simplified outline of Peninsular Malaysia, smoothed from ~40 coastline points. */
export const peninsulaPath =
  'M48.8 23.0 C51.5 19.5 64.2 34.7 71.8 38.6 C79.3 42.6 86.6 42.6 93.8 46.9 C101.0 51.2 108.4 58.4 115.0 64.4 C121.6 70.4 127.3 76.7 133.4 82.8 C139.5 88.9 144.1 98.6 151.8 101.2 C159.5 103.8 171.0 97.4 179.4 98.4 C187.8 99.5 194.0 112.5 202.4 107.6 C210.8 102.7 221.6 74.2 230.0 69.0 C238.4 63.8 245.3 71.0 253.0 76.4 C260.7 81.7 267.6 93.2 276.0 101.2 C284.4 109.2 295.5 116.2 303.6 124.2 C311.7 132.2 317.1 138.3 324.8 149.0 C332.4 159.8 344.7 174.3 349.6 188.6 C354.5 202.9 354.5 220.0 354.2 234.6 C353.9 249.2 348.2 263.0 347.8 276.0 C347.3 289.0 350.4 299.8 351.4 312.8 C352.5 325.8 352.7 341.9 354.2 354.2 C355.7 366.5 354.7 376.4 360.6 386.4 C366.6 396.4 381.2 403.3 390.1 414.0 C399.0 424.7 407.4 437.8 414.0 450.8 C420.6 463.8 430.4 482.5 429.6 492.2 C428.9 501.9 417.2 506.5 409.4 508.8 C401.6 511.1 391.2 504.2 382.7 506.0 C374.3 507.8 364.6 520.3 358.8 519.8 C353.0 519.3 356.5 511.7 347.8 503.2 C339.0 494.8 318.9 477.9 306.4 469.2 C293.8 460.5 282.7 456.2 272.3 450.8 C261.9 445.4 255.5 444.7 243.8 437.0 C232.1 429.3 214.7 414.8 202.4 404.8 C190.1 394.8 177.9 384.9 170.2 377.2 C162.5 369.5 162.5 368.8 156.4 358.8 C150.3 348.8 139.5 330.4 133.4 317.4 C127.3 304.4 125.7 291.3 119.6 280.6 C113.5 269.9 102.0 265.3 96.6 253.0 C91.2 240.7 91.2 221.6 87.4 207.0 C83.6 192.4 76.5 179.4 73.6 165.6 C70.7 151.8 71.5 137.2 69.9 124.2 C68.4 111.2 66.9 98.1 64.4 87.4 C61.9 76.7 57.8 70.5 55.2 59.8 C52.6 49.1 46.0 26.5 48.8 23.0Z'

export const cafes: Cafe[] = [
  {
    id: 'georgetown',
    name: 'Secawan Lebuh Chulia',
    town: 'George Town',
    hours: 'Daily, 8am to 6pm',
    signature: 'Nutmeg cold brew',
    lon: 100.25,
    lat: 5.42,
  },
  {
    id: 'ipoh',
    name: 'Secawan Kampar Road',
    town: 'Ipoh',
    hours: 'Tue to Sun, 7am to 5pm',
    signature: 'Liberica white coffee',
    lon: 101.08,
    lat: 4.6,
  },
  {
    id: 'highlands',
    name: 'Secawan Roastery',
    town: 'Tanah Rata',
    hours: 'Daily, 7am to 7pm',
    signature: 'Kabus pour-over at the farm',
    lon: 101.38,
    lat: 4.47,
  },
  {
    id: 'kl',
    name: 'Secawan Bangsar',
    town: 'Kuala Lumpur',
    hours: 'Daily, 7:30am to 9pm',
    signature: 'Gula Melaka latte',
    lon: 101.67,
    lat: 3.13,
  },
  {
    id: 'terengganu',
    name: 'Secawan Pantai',
    town: 'Kuala Terengganu',
    hours: 'Sat to Thu, 8am to 6pm',
    signature: 'Pandan iced latte',
    lon: 103.13,
    lat: 5.33,
  },
  {
    id: 'melaka',
    name: 'Secawan Jonker',
    town: 'Melaka',
    hours: 'Wed to Mon, 9am to 8pm',
    signature: 'Senja espresso tonic',
    lon: 102.25,
    lat: 2.2,
  },
]
