let cached: boolean | null = null

/**
 * True when the browser can create a WebGL context. Cached after the first check.
 * `?no-webgl` in the URL forces the static fallbacks, for review.
 */
export function hasWebGL(): boolean {
  if (cached !== null) return cached
  if (new URLSearchParams(window.location.search).has('no-webgl')) return (cached = false)
  try {
    const canvas = document.createElement('canvas')
    cached = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    cached = false
  }
  return cached
}
