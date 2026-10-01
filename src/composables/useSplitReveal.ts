import { type Ref } from 'vue'
import { gsap, SplitText } from '@/lib/gsap'
import { useGsapContext } from './useScrollTrigger'

interface SplitRevealOptions {
  /** 'words' rise with a slight rotation, 'lines' slide up from behind a mask. */
  type?: 'words' | 'lines'
  /** Play immediately (for the hero) instead of when scrolled into view. */
  immediate?: boolean
  delay?: number
  start?: string
  /** Wait for this promise (fonts, preloader) before splitting. */
  waitFor?: () => Promise<unknown>
}

/** SplitText reveal bound to the element's lifecycle. Reduced motion shows the text as-is. */
export function useSplitReveal(target: Ref<HTMLElement | null | undefined>, options: SplitRevealOptions = {}) {
  const { type = 'lines', immediate = false, delay = 0, start = 'top 82%', waitFor } = options

  useGsapContext(target, ({ reduced, root, later }) => {
    if (reduced) return
    gsap.set(root, { autoAlpha: 0 })

    const run = () => later(() => {
      gsap.set(root, { autoAlpha: 1 })
      SplitText.create(root, {
        type: type === 'words' ? 'words,lines' : 'lines',
        mask: type === 'lines' ? 'lines' : undefined,
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          const targets = type === 'words' ? self.words : self.lines
          return gsap.from(targets, {
            yPercent: type === 'words' ? 70 : 105,
            rotate: type === 'words' ? 6 : 0,
            opacity: type === 'words' ? 0 : 1,
            transformOrigin: '0% 100%',
            duration: type === 'words' ? 1.1 : 1,
            ease: 'power3.out',
            stagger: type === 'words' ? 0.07 : 0.1,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: root, start, once: true },
          })
        },
      })
    })

    if (waitFor) {
      waitFor().then(run)
    } else {
      document.fonts.ready.then(run)
    }
  })
}
