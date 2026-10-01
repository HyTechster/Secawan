/**
 * Device pixel ratio range for the WebGL canvases.
 * Phones get a lower cap: the physically based materials are fill-rate heavy,
 * and the difference between 1.5x and 2x+ is hard to see on a small screen.
 */
export function canvasDpr(): [number, number] {
  const small = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  return small ? [1, 1.5] : [1, 2]
}
