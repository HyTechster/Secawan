<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import GalleryPhoto from '@/components/ui/GalleryPhoto.vue'
import type { GalleryItem } from '@/data/story'

const props = defineProps<{ items: GalleryItem[] }>()
/** Index of the open item, or null when closed */
const index = defineModel<number | null>('index', { required: true })

const dialog = ref<HTMLElement | null>(null)
const direction = ref<1 | -1>(1)
const open = computed(() => index.value !== null)
const item = computed(() => (index.value === null ? null : props.items[index.value]))

function step(dir: 1 | -1) {
  if (index.value === null) return
  direction.value = dir
  index.value = (index.value + dir + props.items.length) % props.items.length
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}

// Swipe support
let startX = 0
const onPointerDown = (e: PointerEvent) => (startX = e.clientX)
const onPointerUp = (e: PointerEvent) => {
  const dx = e.clientX - startX
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
}

useFocusTrap(dialog, open, { onEscape: () => (index.value = null) })
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="item"
        ref="dialog"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`Gallery: ${item.title}`"
        @keydown="onKey"
      >
        <button type="button" class="lb-btn lb-close" aria-label="Close gallery" @click="index = null">
          <X :size="24" :stroke-width="1.9" aria-hidden="true" />
        </button>
        <figure class="lb-figure" @pointerdown="onPointerDown" @pointerup="onPointerUp">
          <Transition :name="direction === 1 ? 'slide-next' : 'slide-prev'" mode="out-in">
            <div :key="item.id" class="lb-art">
              <GalleryPhoto :image="item.image" :alt="item.alt" eager />
            </div>
          </Transition>
          <figcaption class="lb-caption font-display" aria-live="polite">{{ item.title }}</figcaption>
        </figure>
        <button type="button" class="lb-btn lb-prev" aria-label="Previous image" @click="step(-1)">
          <ChevronLeft :size="26" :stroke-width="1.9" aria-hidden="true" />
        </button>
        <button type="button" class="lb-btn lb-next" aria-label="Next image" @click="step(1)">
          <ChevronRight :size="26" :stroke-width="1.9" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: 4.5rem 1rem 2rem;
  background: rgb(31 19 13 / 0.94);
  color: var(--cream);
}
.lb-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  touch-action: pan-y;
  user-select: none;
}
.lb-art {
  width: min(78vw, calc((100dvh - 11rem) * 0.8));
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-panel);
  overflow: hidden;
}
.lb-caption {
  font-size: 1.5rem;
  font-style: italic;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.lb-btn {
  position: absolute;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgb(246 240 230 / 0.12);
  color: var(--cream);
  transition: background-color 0.3s ease;
}
.lb-btn:hover {
  background: rgb(246 240 230 / 0.24);
}
.lb-close {
  top: 18px;
  right: 18px;
}
.lb-prev,
.lb-next {
  top: 50%;
  margin-top: -26px;
}
.lb-prev {
  left: clamp(8px, 3vw, 40px);
}
.lb-next {
  right: clamp(8px, 3vw, 40px);
}
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.4s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.35s var(--ease-settle),
    opacity 0.35s ease;
}
.slide-next-enter-from,
.slide-prev-leave-to {
  transform: translateX(40px) rotate(2deg);
  opacity: 0;
}
.slide-next-leave-to,
.slide-prev-enter-from {
  transform: translateX(-40px) rotate(-2deg);
  opacity: 0;
}
</style>
