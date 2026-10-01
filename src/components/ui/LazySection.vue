<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { refreshScrollTriggers } from '@/composables/useScrollTrigger'

const props = withDefaults(
  defineProps<{
    /** Anchor id, so nav links work before the section has loaded */
    id?: string
    /** Reserved height while the real section loads, to avoid layout shift */
    minHeight?: string
    rootMargin?: string
    label?: string
  }>(),
  { minHeight: '80vh', rootMargin: '600px 0px', label: 'Loading section' },
)

const root = ref<HTMLElement | null>(null)
const visible = ref(false)

const { stop } = useIntersectionObserver(
  root,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    visible.value = true
    stop()
    nextTick(refreshScrollTriggers)
  },
  { rootMargin: props.rootMargin },
)

const onLoaded = () => refreshScrollTriggers()
</script>

<template>
  <div :id="id" ref="root" class="lazy-section" :style="visible ? undefined : { minHeight }">
    <Suspense v-if="visible" @resolve="onLoaded">
      <slot />
      <template #fallback>
        <slot name="skeleton">
          <div class="skeleton" :style="{ minHeight }" role="status" :aria-label="label" />
        </slot>
      </template>
    </Suspense>
    <slot v-else name="skeleton">
      <div class="skeleton" :style="{ minHeight }" role="status" :aria-label="label" />
    </slot>
  </div>
</template>

<style scoped>
.skeleton {
  margin: 2rem clamp(1rem, 4vw, 3rem);
  border-radius: var(--radius-panel);
  background: linear-gradient(100deg, var(--paper) 40%, #f3ebdf 50%, var(--paper) 60%) 0 0 / 300% 100%;
  animation: shimmer 1.8s linear infinite;
}
@keyframes shimmer {
  to {
    background-position: -150% 0;
  }
}
</style>
