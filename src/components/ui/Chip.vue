<script setup lang="ts">
import { X } from '@lucide/vue'

withDefaults(
  defineProps<{
    selected?: boolean
    removable?: boolean
    tone?: 'light' | 'dark'
    as?: 'button' | 'span'
  }>(),
  { selected: false, removable: false, tone: 'light', as: 'button' },
)

defineEmits<{ remove: [] }>()
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    class="chip"
    :class="[`chip--${tone}`, { 'is-selected': selected }]"
    :aria-pressed="as === 'button' && !removable ? selected : undefined"
    v-motion
    :initial="{ scale: 1 }"
    :hovered="{ scale: 1.04, transition: { type: 'spring', stiffness: 380, damping: 18 } }"
    :tapped="{ scale: 0.96 }"
    @click="removable ? $emit('remove') : undefined"
  >
    <slot />
    <X v-if="removable" :size="14" :stroke-width="2.25" aria-hidden="true" />
  </component>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-control);
  font-size: 0.92rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}
.chip--light {
  background: var(--paper);
  color: var(--espresso);
  box-shadow: inset 0 0 0 1px rgb(43 27 20 / 0.08);
}
.chip--light.is-selected {
  background: var(--espresso);
  color: var(--cream);
}
.chip--dark {
  background: rgb(246 240 230 / 0.12);
  color: var(--cream);
  box-shadow: inset 0 0 0 1px rgb(246 240 230 / 0.22);
}
.chip--dark.is-selected {
  background: var(--cream);
  color: var(--espresso);
}
</style>
