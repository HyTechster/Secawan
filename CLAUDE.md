# CLAUDE.md: Secawan Coffee (Vue)

## 1. What this project is

**Secawan** ("a cup" in Malay) is a static, single-page website for a **fictional highland specialty coffee roastery** inspired by Malaysia's misty highlands. It's a frontend portfolio piece that shows warm editorial design, organic animation, playful interactive UI and real-time 3D, all built with **Vue 3**.

- **Type:** Static site (Vite build). No backend and no real checkout. The cart is client-side only.
- **Pages:** One homepage: preloader → hero → many scroll sections → footer.
- **Audience:** Recruiters and clients viewing the portfolio. It must feel like an award-style, handcrafted brand site.

### Content rule (important)
The visible site is **only about Secawan coffee**. It must **never mention Vue, Vite, TypeScript or any library name** in its UI copy. Framework talk belongs in `README.md` only.
The footer must include this small line: *"Secawan is a fictional brand created for a design portfolio."*

---

## 2. Tech stack

Use the **latest stable** version of each package and check compatibility with Vue 3 before installing.

| Purpose | Library |
|---|---|
| Framework | Vue 3 + Vite + TypeScript, `<script setup lang="ts">` SFCs |
| State | Pinia (cart, roast lab, brew timer) + `pinia-plugin-persistedstate` for the cart |
| Styling | Tailwind CSS v4 + scoped SFC styles, design tokens as CSS variables |
| 3D | **TresJS** (`@tresjs/core`) + **Cientos** (`@tresjs/cientos`), declarative Three.js in Vue templates |
| Scroll & timeline animation | GSAP + ScrollTrigger + SplitText + DrawSVG + MorphSVG + Flip (all free) |
| Smooth scroll | Lenis (synced with ScrollTrigger) |
| Component motion | Vue built-in `<Transition>` / `<TransitionGroup>` + `@vueuse/motion` (`v-motion`) for declarative enter/hover motion |
| Utilities | `@vueuse/core` (`useMouse`, `useIntersectionObserver`, `useElementBounding`, `usePreferredReducedMotion`, `useScroll`, `useIntervalFn`) |
| Data viz | D3 (`d3-shape`, `d3-hierarchy`) for the flavor wheel only. Vue renders the SVG; D3 only does the math |
| Carousel | Embla Carousel (`embla-carousel-vue`) |
| List animation | `@formkit/auto-animate` for small lists (cart items, chips) |
| Icons | Lucide (`lucide-vue-next`) |

---

## 3. Vue conventions (showcase modern Vue, follow strictly)

- **Composition API only**, with `<script setup lang="ts">` in every SFC and typed `defineProps`, `defineEmits` and `defineModel`.
- **Composables for all reusable logic** (`src/composables/`). This is a key showcase feature: `useLenis`, `useScrollTrigger`, `useReducedMotion`, `useMagnetic`, `useTilt`, `useSplitReveal`, `useCountUp`, `useFlyToCart`.
- **Custom directives** for simple behaviors: `v-reveal`, `v-magnetic`, `v-parallax`.
- **`defineAsyncComponent`** combined with an IntersectionObserver wrapper (`<LazySection>`) to lazy-load heavy sections (3D, flavor wheel, gallery), with skeleton fallbacks.
- **Built-in `<Transition>` / `<TransitionGroup>`** for every enter/leave, list re-order and modal. GSAP is for scroll-driven and timeline work.
- **`<Teleport to="body">`** for the cart drawer, lightbox and modals.
- **Cleanup:** Wrap GSAP code in `gsap.context()` inside `onMounted` and `revert()` it in `onBeforeUnmount`. TresJS handles its own scene disposal, but dispose any custom geometry and materials yourself.
- **Typed content:** All copy lives in `src/data/*.ts` as typed constants, and `v-for` loops over it.
- **Props down, events up.** Shared cross-section state lives in Pinia only.
- Components use PascalCase (`HeroSection.vue`, `FlavorWheel.vue`, `CartDrawer.vue`).

---

## 4. Design system

**Mood:** Warm, editorial, organic and tactile. Morning mist over green hills, paper textures, roasted tones, soft blob shapes. This contrasts deliberately with dark tech sites.

```css
--cream:      #F6F0E6;   /* page background */
--paper:      #EDE3D3;
--espresso:   #2B1B14;   /* main text, dark sections */
--roast:      #5A3825;
--sage:       #8FA68A;   /* highland green */
--mist:       #DCE3DD;
--terracotta: #D0673F;   /* accent, CTAs */
--crema:      #E8B97A;   /* highlights */
```

- **Fonts (Google Fonts):** `Fraunces` (display serif; use its soft or "wonky" optical style for headlines), `Manrope` (body), `Caveat` (small handwritten annotations such as roaster notes).
- **Type scale:** Fluid with `clamp()`. Headlines are big and italic-mixed (e.g. "Grown *above* the clouds").
- **Surfaces:** Rounded 24–32px corners, soft shadows, a subtle paper-grain overlay across the whole page, and SVG blob shapes that slowly morph behind sections (MorphSVG).
- **Global effects:** A custom cursor shaped as a small coffee bean that rotates toward the movement direction and grows into a "View" or "Add" label on cards (hidden on touch). Section transitions use wavy SVG dividers.
- **Motion language:** Soft and natural, like steam and mist. Easing `power2.out` / `sine.inOut`. Things **float, pour, steam and settle**. Hovers are gentle and springy.

---

## 5. Page structure (build in this order)

### 0. Preloader: "Pouring"
An SVG coffee cup fills from 0 to 100% (liquid wave via an animated SVG path and clip mask), synced to real loading (fonts plus the hero scene ready). A steam wisp rises, then the cup scales up and fades into the hero. It's skipped instantly under reduced motion.

### 1. Navigation
- A floating cream pill nav with a **sliding "blob" indicator** that morphs to the hovered or active link.
- A cart icon with a badge that **bounces** (Transition) whenever the item count changes.
- It hides on scroll down and shows on scroll up. Links smooth-scroll via Lenis.
- On mobile, a full-screen sage overlay with staggered, large serif links.

### 2. Hero: "Grown above the clouds."
- **TresJS 3D scene:**
  - A ceramic **coffee cup** built with `LatheGeometry` (no downloaded model), a soft cream material and a coffee surface disc with a subtle ripple shader.
  - A **steam shader**: curling, semi-transparent noise planes rising from the cup.
  - **Floating coffee beans** (`InstancedMesh` of about 40 deformed ellipsoids with a center crease) drifting slowly around the cup.
  - **Mist layer:** fog plus soft sprite clouds drifting slowly across.
  - **Mouse tilt:** The whole scene eases toward the pointer (`useMouse`).
  - **Scroll-scrubbed:** Leaving the hero, the beans scatter outward, the cup rotates and the camera rises "above the clouds".
- **Copy:** Headline *"Grown above the clouds."*. Subline *"Small-batch coffee from 1,500 metres up, roasted the morning it ships."*
- The headline reveals with **SplitText** (words rise and settle with a slight rotation).
- CTAs: "Shop the beans" (terracotta, magnetic) and "Our story" (text link with an animated underline).
- A handwritten Caveat annotation with an SVG arrow drawn in: *"still warm →"*.
- **Performance:** Clamp DPR to ≤ 2, pause the render loop when off-screen, and use a static illustrated fallback if WebGL is unavailable.

### 3. Tasting notes marquee
Two infinite rows moving in opposite directions: *Dark chocolate · Jackfruit · Brown sugar · Pandan · Citrus peel · Toasted nuts*. Pill-shaped chips; the speed reacts to scroll velocity.

### 4. Origin Story: layered parallax highlands
- Five or six SVG layers of hills, tea-like terraces, mist bands and sun, each moving at a different speed.
- An **altitude meter** on the side counts up from 0 m to 1,500 m as the user scrolls through.
- Story text reveals line by line (SplitText lines with a mask).
- Mist bands drift horizontally, independent of scroll.

### 5. Bean to Cup: pinned path journey
- The section **pins**, and one continuous SVG path **draws itself** with DrawSVG as you scroll, winding through 5 stages: *Pick → Dry → Roast → Rest → Brew*.
- Each stage icon **morphs** (MorphSVG) from a simple circle into its illustration when the path reaches it, with a card fading in beside it.
- A small bean travels along the path (MotionPath).
- On mobile, a simpler vertical path with the same stages.

### 6. Roast Lab: interactive showpiece
- A big custom **roast slider** (Light → Medium → Dark), fully keyboard accessible.
- As it moves:
  - The section background gradient shifts from pale crema to deep espresso, and the text color flips for contrast.
  - A **3D bean** (TresJS) changes color and gloss in real time (material color interpolation).
  - **Tasting note chips** swap with `<TransitionGroup>`.
  - **Flavor bars** (acidity, body, sweetness, bitterness) animate to new widths.
  - A "Recommended brew" label updates.
- State lives in the `roastLab` Pinia store, and everything else is derived with `computed`.

### 7. Flavor Wheel: interactive D3 plus Vue SVG
- A radial wheel (categories → sub-notes) laid out with `d3-hierarchy` partition and `d3-shape` arcs, rendered by Vue in the template.
- Hovering a segment lifts it outward and shows a tooltip. Clicking **zooms in** on that category with an animated transition.
- Selecting a note **filters the products** in the Shop section below and scrolls to it.
- The wheel draws in segment by segment when it first enters the viewport.

### 8. Shop the Beans: product grid and cart
- **Filter chips:** *All / Single Origin / Blends / Liberica / Decaf* (plus any active flavor-wheel filter as a removable chip).
- Cards re-order with **GSAP Flip** or `<TransitionGroup>` move transitions.
- Each card has **3D tilt** with a glare, and the bag illustration "breathes" on hover.
- **"Add to bag" triggers a fly-to-cart animation:** a small bean arcs from the button to the nav cart icon along a bezier path, and the badge bounces.
- **Cart drawer** (Teleport + Transition slide-in):
  - Items animate with auto-animate, and quantities have steppers.
  - A grind option select (Whole bean / Filter / Espresso).
  - A free-shipping progress bar that fills as the subtotal grows.
  - An animated subtotal (odometer count).
  - "Checkout" opens a friendly modal saying it's a demo. No payment form of any kind.
- The cart persists across reloads via Pinia's persisted state.

### 9. Brew Guide: tabs and a working timer
- Tabs: **V60 · French Press · Moka Pot**, with a sliding tab indicator. Content cross-fades with `<Transition mode="out-in">`.
- Each method shows an animated SVG illustration (water pouring, plunger pressing) plus a recipe card (dose, water, time, grind).
- A **working brew timer:** a circular progress ring, Start/Pause/Reset, and a step list that highlights the current step (e.g. "0:00 Bloom → 0:45 Pour to 250g"). It's built with `useIntervalFn` and a Pinia store.

### 10. Numbers
Count-up stats on a dark espresso band: *1,500 m altitude · 48 h from roast to door · 12 partner farms · 100% traceable lots*. Numbers roll up like an odometer when they enter the viewport.

### 11. From the Farm: gallery
- A **draggable horizontal Embla carousel** with momentum. Images tilt slightly while dragging and straighten on release.
- Clicking opens a **lightbox** (Teleport) with keyboard navigation and swipe support.
- Use placeholder images that are clearly generic (landscapes, cups, beans) or generated SVG art.

### 12. Find Us: stylized map
- A stylized SVG map of Peninsular Malaysia (simplified shape) with pins for fictional Secawan cafés.
- Pins drop in with a stagger and pulse. Hovering or focusing shows a card (café name, hours, signature drink).
- The pin list and map are synced both ways.

### 13. Newsletter CTA
- The headline *"Fresh roast, first sip."* over a morphing blob background.
- An email input with animated validation (it shakes gently on invalid input).
- On success (simulated, no network): **coffee beans rain** down briefly on a lightweight canvas, and the button morphs into a check mark.

### 14. Footer
- A giant **SECAWAN** wordmark with an animated steam wisp rising from the first "A".
- Link columns, social icons with hover wiggle, and a "Back to top" button (the cup tips up, then scrolls to the top).
- The fictional-brand disclaimer and "Designed & built by Amirul & Afiqah".

---

## 6. Folder structure

```
src/
  App.vue
  main.ts
  components/
    ui/            BaseButton.vue, Chip.vue, SectionHeading.vue, Marquee.vue, LazySection.vue, Odometer.vue
    layout/        TheNav.vue, TheFooter.vue, ThePreloader.vue, CustomCursor.vue, CartDrawer.vue, Lightbox.vue
  sections/        HeroSection.vue, NotesMarquee.vue, OriginStory.vue, BeanToCup.vue, RoastLab.vue,
                   FlavorWheel.vue, ShopSection.vue, BrewGuide.vue, NumbersBand.vue, FarmGallery.vue,
                   FindUs.vue, NewsletterCta.vue
  three/           HeroScene.vue, CoffeeCup.vue, Beans.vue, Steam.vue, RoastBean.vue, shaders/
  composables/     useLenis.ts, useScrollTrigger.ts, useReducedMotion.ts, useMagnetic.ts, useTilt.ts,
                   useSplitReveal.ts, useCountUp.ts, useFlyToCart.ts
  directives/      reveal.ts, magnetic.ts, parallax.ts
  stores/          cart.ts, roastLab.ts, brewTimer.ts, filters.ts
  data/            products.ts, flavors.ts, brewMethods.ts, cafes.ts, story.ts
  styles/          tokens.css, typography.css, base.css
```

---

## 7. Accessibility and motion safety
- `useReducedMotion()` is the single source of truth. When it's on, disable Lenis, pinning, parallax, marquees, morphing blobs and 3D auto-motion, and show final states immediately.
- The custom slider, tabs, carousel, lightbox and cart drawer follow WAI-ARIA patterns (roles, `aria-selected`, `aria-valuenow`, focus trap, Esc to close, focus restore).
- Every interactive element has a visible focus style in the terracotta accent.
- Text contrast is at least WCAG AA, including the Roast Lab's changing background (switch text color at the midpoint).
- 3D canvases get `aria-hidden="true"` plus visible or sr-only text equivalents.
- Use semantic landmarks and `section[aria-labelledby]`.

## 8. Performance budget
- Lighthouse (desktop): Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95.
- Hold 60fps scrolling. Animate `transform`/`opacity` only.
- Lazy-load the 3D, flavor wheel, gallery and map sections via `<LazySection>` + `defineAsyncComponent`.
- Keep at most **two** WebGL canvases on the page (Hero and Roast Lab). Use canvas 2D or SVG for all other effects.
- Use **procedural geometry** only: no heavy 3D model downloads. Images are AVIF/WebP, lazy, with explicit sizes.
- Pause render loops when off-screen or when the tab is hidden.

## 9. Commands
```bash
npm install
npm run dev        # Vite dev server
npm run build      # type-check + static build to dist/
npm run preview    # preview production build
npm run test       # Vitest unit tests
```
Deploy `dist/` to Vercel, Netlify or GitHub Pages (set `base` in `vite.config.ts` for GitHub Pages).

## 10. Definition of done
- [ ] All 15 parts (preloader to footer) are built, responsive from 360px to 1920px.
- [ ] No console errors or Vue warnings. `vue-tsc` passes with no type errors.
- [ ] The reduced-motion mode is verified.
- [ ] Every GSAP context, listener and custom Three.js resource is cleaned up on unmount.
- [ ] Vitest covers the cart store (add/remove/quantity/subtotal/free-shipping threshold), the roast lab derived values and the brew timer logic.
- [ ] `README.md` has screenshots or a GIF, the live link, the feature list and a **"Why Vue for this project"** section (below).

## 11. README only: "Why Vue for this project"
> Secawan is animation-heavy and interaction-rich, but its state is simple. Vue fits that balance. Built-in **`<Transition>` / `<TransitionGroup>`** handle enter/leave, tab cross-fades and list re-ordering without extra libraries. **Composables** turn every effect (magnetic buttons, tilt, split reveals, fly-to-cart) into small reusable functions. **TresJS** writes the 3D scene declaratively in templates, so the cup, steam and beans react to Pinia state (like the roast level) with plain reactivity. **SFCs with scoped styles** keep each section's markup, logic and styling together, and Vite keeps development instant. A heavier framework would add structure this single page doesn't need.
