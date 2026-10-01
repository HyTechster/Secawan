<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import BaseButton from '@/components/ui/BaseButton.vue'

const open = defineModel<boolean>('open', { required: true })
const dialog = ref<HTMLElement | null>(null)
const base = import.meta.env.BASE_URL

useFocusTrap(dialog, open, { onEscape: () => (open.value = false), lockScroll: false })
</script>

<template>
  <Transition name="pop">
    <div v-if="open" class="scrim" @click.self="open = false">
      <div ref="dialog" class="modal" role="dialog" aria-modal="true" aria-labelledby="demo-title" aria-describedby="demo-text">
        <img :src="`${base}images/cup.webp`" alt="" width="140" height="122" class="modal__art" decoding="async" />
        <h2 id="demo-title" class="font-display modal__title">Thanks for <em>stopping by.</em></h2>
        <p id="demo-text" class="modal__text">
          Secawan is a portfolio piece, so the beans stay on the shelf and no payment is taken. Your bag is saved if you want to
          keep browsing.
        </p>
        <BaseButton variant="dark" @click="open = false">Back to the beans</BaseButton>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(43 27 20 / 0.5);
}
.modal {
  width: min(460px, 100%);
  padding: 2.4rem 2rem 2rem;
  border-radius: var(--radius-panel);
  background: var(--cream);
  box-shadow: var(--shadow-lift);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}
.modal__art {
  margin-bottom: 0.25rem;
}
.modal__title {
  font-size: 2rem;
  font-weight: 450;
  line-height: 1.1;
}
.modal__text {
  color: var(--espresso-soft);
  max-width: 36ch;
  margin-bottom: 0.5rem;
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.3s ease;
}
.pop-enter-active .modal,
.pop-leave-active .modal {
  transition: transform 0.45s var(--ease-spring);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}
.pop-enter-from .modal,
.pop-leave-to .modal {
  transform: scale(0.9) translateY(16px);
}
</style>
