/// <reference types="vite/client" />

import type { vReveal } from './directives/reveal'
import type { vMagnetic } from './directives/magnetic'
import type { vParallax } from './directives/parallax'

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
    vMagnetic: typeof vMagnetic
    vParallax: typeof vParallax
  }
}

export {}
