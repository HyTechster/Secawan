<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'dark' | 'ghost'
    href?: string
    type?: 'button' | 'submit'
    magnetic?: boolean
    size?: 'md' | 'lg'
  }>(),
  { variant: 'primary', type: 'button', magnetic: false, size: 'md' },
)

const tag = computed(() => (props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    v-magnetic="magnetic ? 0.3 : 0"
    :href="href"
    :type="href ? undefined : type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
  >
    <span class="btn__label"><slot /></span>
  </component>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  white-space: nowrap;
  border-radius: var(--radius-control);
  font-weight: 700;
  letter-spacing: 0.005em;
  text-decoration: none;
  isolation: isolate;
  overflow: hidden;
  transition:
    transform 0.35s var(--ease-spring),
    box-shadow 0.35s var(--ease-settle),
    background-color 0.3s ease;
}
.btn--md {
  padding: 0.85rem 1.5rem;
  font-size: 0.98rem;
}
.btn--lg {
  padding: 1.05rem 1.9rem;
  font-size: 1.05rem;
}
.btn:active {
  transform: scale(0.97);
}

/* Terracotta with a deep espresso label: 4.7:1 contrast */
.btn--primary {
  background: var(--terracotta);
  color: #1c110b;
  box-shadow: 0 10px 24px -12px rgb(208 103 63 / 0.7);
}
.btn--primary::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--crema);
  border-radius: inherit;
  transform: translateY(102%);
  transition: transform 0.45s var(--ease-settle);
}
.btn--primary:hover::before {
  transform: translateY(0);
}

.btn--dark {
  background: var(--espresso);
  color: var(--cream);
}
.btn--dark:hover {
  background: var(--roast);
}

.btn--ghost {
  background: transparent;
  color: currentColor;
  box-shadow: inset 0 0 0 1.5px currentColor;
}
.btn--ghost:hover {
  background: rgb(43 27 20 / 0.06);
}
</style>
