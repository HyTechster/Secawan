import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** Page-level loading state shared by the preloader, hero and nav. */
export const useUiStore = defineStore('ui', () => {
  const fontsReady = ref(false)
  const heroReady = ref(false)
  /** True once the preloader has finished its exit and the page is interactive. */
  const entered = ref(false)

  /** Bumped to ask the nav to slide back into view (for example when something lands in the bag). */
  const navPeek = ref(0)
  const peekNav = () => navPeek.value++

  const loadProgress = computed(() => (Number(fontsReady.value) + Number(heroReady.value)) / 2)

  let resolveEntered: () => void
  const enteredPromise = new Promise<void>((resolve) => (resolveEntered = resolve))

  function markEntered() {
    entered.value = true
    resolveEntered()
  }

  return {
    fontsReady,
    heroReady,
    entered,
    loadProgress,
    navPeek,
    peekNav,
    markEntered,
    whenEntered: () => enteredPromise,
  }
})
