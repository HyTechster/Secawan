<script setup lang="ts">
import { ref } from 'vue'
import { siInstagram, siSpotify, siTiktok } from 'simple-icons'
import { gsap } from '@/lib/gsap'
import { useLenis } from '@/composables/useLenis'
import { useGsapContext } from '@/composables/useScrollTrigger'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

const { scrollTo } = useLenis()

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Single origins', href: '#shop' },
      { label: 'Blends', href: '#shop' },
      { label: 'Liberica', href: '#shop' },
      { label: 'Decaf', href: '#shop' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Our story', href: '#story' },
      { label: 'Roast lab', href: '#roast-lab' },
      { label: 'Flavor wheel', href: '#flavors' },
      { label: 'Brew guide', href: '#brew' },
    ],
  },
  {
    title: 'Visit',
    links: [
      { label: 'Our cafés', href: '#visit' },
      { label: 'The roastery', href: '#visit' },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
]

const socials = [
  { name: 'Instagram', icon: siInstagram },
  { name: 'TikTok', icon: siTiktok },
  { name: 'Spotify', icon: siSpotify },
]

const root = ref<HTMLElement | null>(null)
const backCup = ref<SVGGElement | null>(null)

useGsapContext(root, ({ reduced, root: el }) => {
  if (reduced) return
  const wisps = el.querySelectorAll<SVGPathElement>('[data-wisp]')
  wisps.forEach((wisp, i) => {
    gsap.fromTo(
      wisp,
      { drawSVG: '0% 0%', opacity: 0.9 },
      {
        keyframes: [
          { drawSVG: '0% 100%', duration: 1.6, ease: 'sine.inOut' },
          { drawSVG: '100% 100%', opacity: 0, duration: 1.2, ease: 'sine.in' },
        ],
        repeat: -1,
        repeatDelay: 0.6,
        delay: i * 0.9,
      },
    )
  })
})

function backToTop() {
  if (prefersReducedMotion() || !backCup.value) {
    scrollTo(0, { immediate: prefersReducedMotion() })
    return
  }
  gsap
    .timeline()
    .to(backCup.value, { rotation: -38, duration: 0.35, ease: 'back.out(3)', svgOrigin: '20 30' })
    .add(() => scrollTo(0))
    .to(backCup.value, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', svgOrigin: '20 30' }, '+=0.5')
}

const year = new Date().getFullYear()
</script>

<template>
  <footer ref="root" class="footer" aria-labelledby="footer-title">
    <h2 id="footer-title" class="sr-only">Secawan</h2>
    <div class="shell footer__grid">
      <div class="footer__intro">
        <p class="font-display footer__lede">Slow coffee from a <em>high place.</em></p>
        <ul class="socials" aria-label="Secawan on social media">
          <li v-for="s in socials" :key="s.name">
            <a href="#top" class="social" :aria-label="`${s.name} (demo link)`" @click.prevent>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path :d="s.icon.path" fill="currentColor" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
      <nav v-for="col in columns" :key="col.title" class="footer__col" :aria-label="col.title">
        <h3 class="footer__col-title">{{ col.title }}</h3>
        <ul>
          <li v-for="link in col.links" :key="link.label">
            <a :href="link.href" class="footer__link" @click.prevent="scrollTo(link.href)">{{ link.label }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="shell wordmark-wrap">
      <p class="wordmark font-display" aria-hidden="true">
        <span>SEC</span><span class="wordmark__a">A<svg class="wordmark__steam" viewBox="0 0 60 120">
            <path data-wisp d="M30 115 C14 92 46 80 30 56 C18 38 40 26 30 4" />
            <path data-wisp d="M44 112 C34 96 54 86 44 66" />
          </svg></span><span>WAN</span>
      </p>
    </div>

    <div class="shell footer__base">
      <p class="footer__disclaimer">Secawan is a fictional brand created for a design portfolio.</p>
      <p class="footer__credit">Designed &amp; built by Wan Amirul Amir @ HyTechster. © {{ year }}</p>
      <button type="button" class="back-top" @click="backToTop">
        <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
          <g ref="backCup">
            <path d="M9 16h20v4c0 6-4.5 10-10 10S9 26 9 20z" fill="var(--cream)" />
            <path d="M29 18h2a3.5 3.5 0 0 1 0 7h-3" fill="none" stroke="var(--cream)" stroke-width="2.4" stroke-linecap="round" />
            <path d="M15 12c-1.6-2.4 1.6-3.4 0-6M22 12c-1.6-2.4 1.6-3.4 0-6" fill="none" stroke="var(--crema)" stroke-width="2" stroke-linecap="round" />
          </g>
        </svg>
        Back to top
      </button>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  padding-top: clamp(4rem, 8vw, 7rem);
  background: var(--espresso);
  color: var(--cream);
  overflow: hidden;
}
.footer__grid {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .footer__grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .footer__intro {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1024px) {
  .footer__grid {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
  .footer__intro {
    grid-column: auto;
  }
}
.footer__lede {
  font-size: var(--step-3);
  font-weight: 380;
  line-height: 1.1;
  max-width: 14ch;
}
.socials {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.6rem;
  list-style: none;
  padding: 0;
}
.social {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgb(246 240 230 / 0.1);
  color: var(--cream);
  transition: background-color 0.3s ease;
}
.social:hover {
  background: var(--terracotta);
  color: #1c110b;
}
.social:hover svg {
  animation: wiggle 0.6s var(--ease-spring);
}
@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-14deg) scale(1.1); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}
.footer__col-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--crema);
  margin-bottom: 0.9rem;
}
.footer__col ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}
.footer__link {
  color: rgb(246 240 230 / 0.86);
  text-decoration: none;
  background: linear-gradient(currentColor, currentColor) 0 100% / 0 1.5px no-repeat;
  transition: background-size 0.4s var(--ease-settle);
}
.footer__link:hover {
  color: var(--cream);
  background-size: 100% 1.5px;
}
.wordmark-wrap {
  margin-top: clamp(3rem, 6vw, 5rem);
}
.wordmark {
  font-size: var(--step-6);
  font-weight: 600;
  line-height: 0.82;
  letter-spacing: -0.045em;
  font-variation-settings: 'SOFT' 100, 'WONK' 0;
  color: var(--cream);
  text-align: center;
  white-space: nowrap;
  padding-top: 0.25em;
}
.wordmark__a {
  position: relative;
  display: inline-block;
}
.wordmark__steam {
  position: absolute;
  left: 50%;
  bottom: 88%;
  width: 0.28em;
  height: 0.56em;
  translate: -50% 0;
  overflow: visible;
}
.wordmark__steam path {
  fill: none;
  stroke: var(--crema);
  stroke-width: 5;
  stroke-linecap: round;
}
.footer__base {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  padding-block: 2rem 2.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid rgb(246 240 230 / 0.14);
  font-size: 0.88rem;
  color: rgb(246 240 230 / 0.78);
}
.back-top {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem 0.6rem 0.8rem;
  border-radius: var(--radius-control);
  background: rgb(246 240 230 / 0.1);
  color: var(--cream);
  font-weight: 700;
}
.back-top:hover {
  background: rgb(246 240 230 / 0.18);
}
</style>
