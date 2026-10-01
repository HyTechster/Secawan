<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Check } from '@lucide/vue'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import BlobBackdrop from '@/components/ui/BlobBackdrop.vue'

const email = ref('')
const touched = ref(false)
const state = ref<'idle' | 'sending' | 'done'>('idle')
const row = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

/** Restart the shake animation without remounting the input (which would drop focus). */
function shake() {
  const el = row.value
  if (!el) return
  el.classList.remove('is-shaking')
  void el.offsetWidth
  el.classList.add('is-shaking')
}

const valid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))
const error = computed(() => (touched.value && !valid.value ? 'That address looks a little off. Try name@example.com.' : ''))

let raf = 0

function submit() {
  touched.value = true
  if (!valid.value) {
    shake()
    return
  }
  // Simulated: nothing leaves the browser
  state.value = 'sending'
  window.setTimeout(() => {
    state.value = 'done'
    rainBeans()
  }, 650)
}

/** A short, light canvas shower of beans. Skipped under reduced motion. */
function rainBeans() {
  const el = canvas.value
  if (!el || prefersReducedMotion()) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const { width, height } = el.getBoundingClientRect()
  el.width = width * dpr
  el.height = height * dpr
  const ctx = el.getContext('2d')!
  ctx.scale(dpr, dpr)
  const colors = ['#5A3825', '#3D2619', '#6B4329', '#2B1B14']
  const beans = Array.from({ length: 70 }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.6,
    vy: 2 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 1.2,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.15,
    s: 0.7 + Math.random() * 0.6,
    c: colors[Math.floor(Math.random() * colors.length)],
  }))
  const start = performance.now()
  const draw = (now: number) => {
    const t = now - start
    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = t > 1800 ? Math.max(0, 1 - (t - 1800) / 600) : 1
    for (const b of beans) {
      b.vy += 0.12
      b.x += b.vx
      b.y += b.vy
      b.rot += b.vr
      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(b.rot)
      ctx.scale(b.s, b.s)
      ctx.fillStyle = b.c
      ctx.beginPath()
      ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(246,240,230,0.45)'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(0, -8)
      ctx.bezierCurveTo(-3, -3, 3, 3, 0, 8)
      ctx.stroke()
      ctx.restore()
    }
    if (t < 2400) raf = requestAnimationFrame(draw)
    else ctx.clearRect(0, 0, width, height)
  }
  raf = requestAnimationFrame(draw)
}

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <section id="newsletter" class="cta" aria-labelledby="cta-title">
    <BlobBackdrop class="cta__blob cta__blob--a" color="var(--crema)" :opacity="0.55" />
    <BlobBackdrop class="cta__blob cta__blob--b" color="var(--sage)" :opacity="0.35" />
    <canvas ref="canvas" class="cta__rain" aria-hidden="true" />

    <div class="shell cta__inner">
      <h2 id="cta-title" v-reveal class="display font-display cta__title">Fresh roast, <em>first sip.</em></h2>
      <p v-reveal="0.1" class="cta__lede">One short email when a new lot lands. No spam, just beans.</p>

      <form class="form" novalidate @submit.prevent="submit">
        <label for="cta-email" class="form__label">Email address</label>
        <div ref="row" class="form__row">
          <input
            id="cta-email"
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            inputmode="email"
            placeholder="you@example.com"
            class="form__input"
            :aria-invalid="!!error"
            :aria-describedby="error ? 'cta-error' : 'cta-help'"
            :disabled="state === 'done'"
            @blur="touched = email.length > 0"
          />
          <button
            type="submit"
            class="form__btn"
            :class="{ 'is-done': state === 'done' }"
            :disabled="state !== 'idle'"
            :aria-label="state === 'done' ? 'Subscribed' : undefined"
          >
            <Transition name="morph" mode="out-in">
              <Check v-if="state === 'done'" key="check" :size="24" :stroke-width="2.6" aria-hidden="true" />
              <span v-else-if="state === 'sending'" key="sending">Pouring</span>
              <span v-else key="idle">Subscribe</span>
            </Transition>
          </button>
        </div>
        <p v-if="error" id="cta-error" class="form__error" role="alert">{{ error }}</p>
        <p v-else-if="state === 'done'" class="form__success" role="status">You are on the list. The first sip is on us.</p>
        <p v-else id="cta-help" class="form__help">We send about one email a month.</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.cta {
  position: relative;
  overflow: hidden;
  background: var(--cream);
  padding-block: clamp(5rem, 11vw, 10rem);
  isolation: isolate;
}
.cta__blob {
  width: min(70vw, 720px);
  aspect-ratio: 1;
}
.cta__blob--a {
  left: -12%;
  top: -18%;
}
.cta__blob--b {
  right: -14%;
  bottom: -30%;
}
.cta__rain {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.cta__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.cta__title {
  font-size: var(--step-5);
  font-weight: 380;
  line-height: 1.02;
  letter-spacing: -0.035em;
  max-width: 12ch;
}
.cta__lede {
  margin-top: 1.25rem;
  font-size: var(--step-1);
  color: var(--espresso-soft);
}
.form {
  margin-top: 2.5rem;
  width: min(100%, 520px);
  display: grid;
  gap: 0.5rem;
  text-align: left;
}
.form__label {
  font-weight: 700;
  font-size: 0.95rem;
}
.form__row {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: var(--radius-control);
  background: #fffaf2;
  box-shadow:
    inset 0 0 0 1.5px rgb(43 27 20 / 0.22),
    var(--shadow-soft);
}
.form__row:focus-within {
  box-shadow:
    inset 0 0 0 2px var(--terracotta),
    var(--shadow-soft);
}
.form__row.is-shaking {
  animation: shake 0.45s var(--ease-settle);
}
@keyframes shake {
  20% { transform: translateX(-8px); }
  40% { transform: translateX(7px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(2px); }
}
.form__input {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 0;
  background: transparent;
  font: inherit;
  color: var(--espresso);
  outline: none;
}
.form__input::placeholder {
  color: #7a6a60;
}
.form__btn {
  display: grid;
  place-items: center;
  min-width: 8.5rem;
  height: 52px;
  padding: 0 1.4rem;
  border-radius: var(--radius-control);
  background: var(--terracotta);
  color: #1c110b;
  font-weight: 800;
  transition:
    min-width 0.5s var(--ease-spring),
    background-color 0.4s ease,
    border-radius 0.4s ease;
}
.form__btn.is-done {
  min-width: 52px;
  padding: 0;
  background: var(--sage-ink);
  color: var(--cream);
}
.form__btn:disabled {
  cursor: default;
}
.form__error {
  color: #a3341b;
  font-weight: 600;
  font-size: 0.92rem;
}
.form__success {
  color: var(--sage-ink);
  font-weight: 700;
}
.form__help {
  color: var(--espresso-soft);
  font-size: 0.92rem;
}
.morph-enter-active,
.morph-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.3s var(--ease-spring);
}
.morph-enter-from,
.morph-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
