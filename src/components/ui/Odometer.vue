<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    /** Delay between columns, right to left, in ms */
    stagger?: number
    duration?: number
  }>(),
  { prefix: '', suffix: '', decimals: 0, stagger: 70, duration: 1400 },
)

const formatted = computed(() =>
  props.value.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  }),
)

/** Columns keyed from the right so existing digits keep rolling when the number grows. */
const columns = computed(() => {
  const chars = formatted.value.split('')
  return chars.map((char, i) => {
    const fromRight = chars.length - 1 - i
    const isDigit = /\d/.test(char)
    return { key: `c${fromRight}`, char, isDigit, digit: isDigit ? Number(char) : 0, delay: fromRight * props.stagger }
  })
})

const digits = Array.from({ length: 10 }, (_, i) => i)
</script>

<template>
  <span class="odometer">
    <span class="sr-only">{{ prefix }}{{ formatted }}{{ suffix }}</span>
    <span class="odometer__visual" aria-hidden="true">
      <span v-if="prefix">{{ prefix }}</span>
      <span v-for="col in columns" :key="col.key" class="odometer__col" :class="{ 'is-static': !col.isDigit }">
        <template v-if="col.isDigit">
          <span
            class="odometer__strip"
            :style="{
              transform: `translateY(${-col.digit * 10}%)`,
              transitionDelay: `${col.delay}ms`,
              transitionDuration: `${duration}ms`,
            }"
          >
            <span v-for="d in digits" :key="d">{{ d }}</span>
          </span>
        </template>
        <template v-else>{{ col.char }}</template>
      </span>
      <span v-if="suffix">{{ suffix }}</span>
    </span>
  </span>
</template>

<style scoped>
.odometer__visual {
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
/* Keep the space in prefixes and suffixes like "RM " and " m" */
.odometer__visual > span:not(.odometer__col) {
  white-space: pre;
}
.odometer__col {
  position: relative;
  display: inline-block;
  height: 1.1em;
  line-height: 1.1;
  overflow: hidden;
  vertical-align: bottom;
}
.odometer__col.is-static {
  overflow: visible;
}
.odometer__strip {
  display: flex;
  flex-direction: column;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.2, 0.9, 0.25, 1.02);
}
.odometer__strip > span {
  height: 1.1em;
  text-align: center;
}
</style>
