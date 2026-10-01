<script setup lang="ts">
import { ref } from 'vue'
import { useSplitReveal } from '@/composables/useSplitReveal'

const props = withDefaults(
  defineProps<{
    id: string
    level?: 'h2' | 'h3'
    align?: 'left' | 'center'
    size?: 4 | 5
    reveal?: boolean
  }>(),
  { level: 'h2', align: 'left', size: 4, reveal: true },
)

const heading = ref<HTMLElement | null>(null)
if (props.reveal) useSplitReveal(heading, { type: 'lines' })
</script>

<template>
  <component
    :is="level"
    :id="id"
    ref="heading"
    class="display font-display"
    :class="[size === 5 ? 'text-step-5' : 'text-step-4', align === 'center' ? 'text-center mx-auto' : '']"
    style="font-weight: 420; max-width: 18ch"
  >
    <slot />
  </component>
</template>
