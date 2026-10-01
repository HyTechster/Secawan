<script setup lang="ts">
import { marqueeNotes } from '@/data/story'
import Marquee from '@/components/ui/Marquee.vue'

const reversed = [...marqueeNotes].reverse()
</script>

<template>
  <section class="notes" aria-labelledby="notes-title">
    <h2 id="notes-title" class="sr-only">Tasting notes you will find in our cups</h2>
    <p class="sr-only">{{ marqueeNotes.join(', ') }}.</p>
    <Marquee class="notes__row notes__row--a" :items="marqueeNotes" :direction="1" :duration="42" />
    <Marquee class="notes__row notes__row--b" :items="reversed" :direction="-1" :duration="48" />
  </section>
</template>

<style scoped>
.notes {
  position: relative;
  padding-block: clamp(2.5rem, 5vw, 4rem);
  background: var(--cream);
  display: grid;
  gap: 0.4rem;
  rotate: -1.5deg;
  margin-inline: -2vw;
}
.notes__row--a :deep(.marquee__chip) {
  background: var(--paper);
  color: var(--espresso);
}
.notes__row--a :deep(.marquee__chip:nth-child(3n + 2)) {
  background: var(--mist);
}
.notes__row--b :deep(.marquee__chip) {
  background: transparent;
  color: var(--roast);
  box-shadow: inset 0 0 0 1.5px rgb(90 56 37 / 0.35);
}
.notes__row--b :deep(.marquee__chip:nth-child(4n + 1)) {
  background: var(--crema);
  color: var(--espresso);
  box-shadow: none;
}
</style>
