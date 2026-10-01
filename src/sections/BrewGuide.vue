<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useIntervalFn, useResizeObserver } from '@vueuse/core'
import { Pause, Play, RotateCcw } from '@lucide/vue'
import { brewMethods, type BrewMethod } from '@/data/brewMethods'
import { formatClock, useBrewTimerStore } from '@/stores/brewTimer'
import TimerDial from '@/components/ui/TimerDial.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BrewIllustration from '@/components/ui/BrewIllustration.vue'

const timer = useBrewTimerStore()
const { method, methodId, running, progress, clock, currentStepIndex, isDone, remaining, elapsed } = storeToRefs(timer)

// Real-time brew timer, ticking ten times a second so the dial sweeps smoothly
const TICK_MS = 100
const { pause, resume } = useIntervalFn(() => timer.tick(TICK_MS / 1000), TICK_MS, { immediate: false })
watch(running, (on) => (on ? resume() : pause()))

const started = computed(() => running.value || elapsed.value > 0)
const scrubbed = ref(false)

// Scrubbing pauses the clock, then picks up where you let go if it was running
let wasRunning = false
function onScrubStart() {
  wasRunning = running.value
  scrubbed.value = true
  timer.pause()
}
function onScrubEnd() {
  if (wasRunning && !isDone.value) timer.start()
}

// Tabs: WAI-ARIA tablist with automatic activation and a sliding indicator
const tablist = ref<HTMLElement | null>(null)
const indicator = ref({ x: 0, w: 0 })
const tabRefs = ref<Record<string, HTMLElement>>({})

function measure() {
  const el = tabRefs.value[methodId.value]
  if (el) indicator.value = { x: el.offsetLeft, w: el.offsetWidth }
}
watch(methodId, () => nextTick(measure))
onMounted(() => document.fonts.ready.then(measure))
useResizeObserver(tablist, measure)

function select(id: BrewMethod['id'], focus = false) {
  timer.selectMethod(id)
  if (focus) nextTick(() => tabRefs.value[id]?.focus())
}

function onTabKey(e: KeyboardEvent) {
  const ids = brewMethods.map((m) => m.id)
  const i = ids.indexOf(methodId.value)
  const next: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: ids.length - 1 }
  if (!(e.key in next)) return
  e.preventDefault()
  select(ids[(next[e.key] + ids.length) % ids.length], true)
}

const facts = computed(() => [
  { label: 'Dose', value: method.value.dose },
  { label: 'Water', value: method.value.water },
  { label: 'Time', value: method.value.time },
  { label: 'Grind', value: method.value.grind },
])

const status = computed(() => {
  if (isDone.value) return 'Done. Enjoy it while it is warm.'
  if (!running.value && progress.value === 0) return 'Ready when you are.'
  if (!running.value) return method.value.steps[currentStepIndex.value].label
  return `${formatClock(remaining.value)} to go`
})
</script>

<template>
  <section id="brew" class="brew" aria-labelledby="brew-title">
    <div class="shell">
      <SectionHeading id="brew-title">Brew it like <em>we do.</em></SectionHeading>

      <div ref="tablist" class="tabs" role="tablist" aria-label="Brew methods" @keydown="onTabKey">
        <span class="tabs__indicator" aria-hidden="true" :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.w}px` }" />
        <button
          v-for="m in brewMethods"
          :id="`tab-${m.id}`"
          :key="m.id"
          :ref="(el) => el && (tabRefs[m.id] = el as HTMLElement)"
          type="button"
          role="tab"
          class="tabs__tab"
          :aria-selected="methodId === m.id"
          :aria-controls="`panel-${m.id}`"
          :tabindex="methodId === m.id ? 0 : -1"
          @click="select(m.id)"
        >
          {{ m.name }}
        </button>
      </div>

      <Transition name="cross" mode="out-in">
        <div
          :id="`panel-${method.id}`"
          :key="method.id"
          class="panel"
          role="tabpanel"
          :aria-labelledby="`tab-${method.id}`"
          tabindex="0"
        >
          <div class="panel__art">
            <BrewIllustration :method="method.id" :progress="progress" :running="running" />
            <p class="panel__intro">{{ method.intro }}</p>
            <dl class="facts">
              <div v-for="f in facts" :key="f.label" class="fact">
                <dt>{{ f.label }}</dt>
                <dd class="font-display">{{ f.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="panel__timer">
            <div class="dial-wrap">
              <TimerDial
                :elapsed="elapsed"
                :total="method.totalSeconds"
                :steps="method.steps"
                :current-step="method.steps[currentStepIndex].label"
                @seek="timer.seek"
                @dragstart="onScrubStart"
                @dragend="onScrubEnd"
              >
                <span class="timer-ring__clock font-display" role="timer" aria-live="off">{{ clock }}</span>
                <span class="timer-ring__status" aria-live="polite">{{ status }}</span>
              </TimerDial>
              <Transition name="hint">
                <p v-if="!scrubbed" class="dial-hint" aria-hidden="true">
                  <svg viewBox="0 0 60 40" width="46" height="31">
                    <path d="M54 34 C40 36 18 30 10 10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                    <path d="M4 16 L10 8 L17 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span class="hand">spin me to peek ahead</span>
                </p>
              </Transition>
            </div>

            <div class="controls">
              <button type="button" class="ctrl ctrl--main" @click="timer.toggle()">
                <component :is="running ? Pause : Play" :size="20" :stroke-width="2.2" aria-hidden="true" />
                {{ running ? 'Pause' : isDone ? 'Brew again' : progress > 0 ? 'Resume' : 'Start' }}
              </button>
              <button type="button" class="ctrl" :disabled="progress === 0 && !running" @click="timer.reset()">
                <RotateCcw :size="18" :stroke-width="2.2" aria-hidden="true" />
                Reset
              </button>
            </div>

            <ol class="steps" aria-label="Steps. Choose one to jump to it.">
              <li
                v-for="(step, i) in method.steps"
                :key="step.at"
                :aria-current="i === currentStepIndex && started ? 'step' : undefined"
              >
                <button
                  type="button"
                  class="step"
                  :class="{ 'is-current': i === currentStepIndex && started, 'is-done': started && i < currentStepIndex }"
                  :aria-label="`Jump to ${formatClock(step.at)}: ${step.label}`"
                  @click="timer.seek(step.at)"
                >
                  <span class="step__time">{{ formatClock(step.at) }}</span>
                  <span>{{ step.label }}</span>
                </button>
              </li>
            </ol>
            <p class="steps__hint hand" aria-hidden="true">tap a step to jump there</p>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.brew {
  background: var(--mist);
  padding-block: clamp(4.5rem, 9vw, 8rem);
}
.tabs {
  position: relative;
  display: inline-flex;
  gap: 0.25rem;
  margin-block: 2rem 2rem;
  padding: 0.35rem;
  border-radius: var(--radius-control);
  background: rgb(246 240 230 / 0.75);
  max-width: 100%;
  overflow-x: auto;
}
.tabs__indicator {
  position: absolute;
  top: 0.35rem;
  bottom: 0.35rem;
  left: 0;
  border-radius: var(--radius-control);
  background: var(--espresso);
  transition:
    transform 0.5s var(--ease-spring),
    width 0.5s var(--ease-spring);
}
.tabs__tab {
  position: relative;
  padding: 0.7rem 1.3rem;
  border-radius: var(--radius-control);
  font-weight: 700;
  white-space: nowrap;
  color: var(--espresso);
  transition: color 0.3s ease;
}
.tabs__tab[aria-selected='true'] {
  color: var(--cream);
}
.panel {
  display: grid;
  gap: 1.5rem;
  border-radius: var(--radius-panel);
}
.panel__art {
  padding: clamp(1.25rem, 3vw, 2rem);
  border-radius: var(--radius-panel);
  background: var(--cream);
  display: grid;
  gap: 1.25rem;
}
.panel__art :deep(.brew-art) {
  max-width: 380px;
  margin: -1rem auto -1.5rem;
}
.panel__intro {
  font-size: var(--step-1);
  color: var(--espresso-soft);
  max-width: 40ch;
}
.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
}
.fact dt {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--espresso-soft);
}
.fact dd {
  margin: 0.1rem 0 0;
  font-size: 1.3rem;
  font-weight: 450;
}
.panel__timer {
  display: grid;
  gap: 1.5rem;
  justify-items: center;
  align-content: start;
  padding: clamp(1.25rem, 3vw, 2rem);
}
.dial-wrap {
  position: relative;
  width: 100%;
  display: grid;
  justify-items: center;
}
.dial-hint {
  position: absolute;
  right: max(0px, calc(50% - 250px));
  top: 64%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: var(--roast);
  rotate: -4deg;
  pointer-events: none;
}
.dial-hint .hand {
  font-size: 1.3rem;
  line-height: 1.1;
  max-width: 9ch;
}
.hint-leave-active {
  transition: opacity 0.5s ease;
}
.hint-leave-to {
  opacity: 0;
}
.timer-ring__clock {
  font-size: 3.4rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.timer-ring__status {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--espresso-soft);
  max-width: 14ch;
  margin-inline: auto;
}
.controls {
  display: flex;
  gap: 0.6rem;
}
.ctrl {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.8rem 1.3rem;
  border-radius: var(--radius-control);
  font-weight: 700;
  background: rgb(43 27 20 / 0.08);
  color: var(--espresso);
  transition: transform 0.3s var(--ease-spring);
}
.ctrl:active {
  transform: scale(0.96);
}
.ctrl:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.ctrl--main {
  background: var(--espresso);
  color: var(--cream);
  min-width: 9.5rem;
  justify-content: center;
}
.steps {
  width: 100%;
  max-width: 26rem;
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.4rem;
}
.step {
  width: 100%;
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: 18px;
  text-align: left;
  color: var(--espresso);
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    transform 0.4s var(--ease-spring);
}
.step:hover:not(.is-current) {
  background: rgb(43 27 20 / 0.06);
}
.steps__hint {
  margin-top: -0.75rem;
  font-size: 1.25rem;
  color: var(--roast);
}
.step__time {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.step.is-done {
  color: var(--espresso-soft);
}
.step.is-current {
  background: var(--espresso);
  color: var(--cream);
  transform: scale(1.02);
}
.cross-enter-active,
.cross-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.4s var(--ease-settle);
}
.cross-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.cross-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (min-width: 900px) {
  .panel {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>
