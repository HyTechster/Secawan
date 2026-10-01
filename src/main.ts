import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import { vReveal } from './directives/reveal'
import { vMagnetic } from './directives/magnetic'
import { vParallax } from './directives/parallax'
import './styles/base.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
  .use(pinia)
  .use(MotionPlugin)
  .use(autoAnimatePlugin)
  .directive('reveal', vReveal)
  .directive('magnetic', vMagnetic)
  .directive('parallax', vParallax)
  .mount('#app')
