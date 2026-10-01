// Renders one printed label per coffee (PNG with transparent corners) for the Blender bag scene.
// Uses the site's own fonts so the packaging typography matches the page.
// Run: node scripts/render-labels.mjs  ->  design/blender/labels/<id>.png
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { products } from '../src/data/products.ts'

const OUT = 'design/blender/labels'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 600, height: 780 }, deviceScaleFactor: 2 })

for (const p of products) {
  const short = p.name.split(' ')[0]
  const dots = { Light: 1, Medium: 2, Dark: 3 }[p.roast]
  await page.setContent(`<!doctype html>
<html><head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,300..800,0..100,0..1&family=Manrope:wght@500;700;800&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; background: transparent; }
  .label {
    box-sizing: border-box; width: 600px; height: 780px; border-radius: 56px;
    background: ${p.label}; color: ${p.labelInk};
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 64px 48px 56px; font-family: Manrope, sans-serif; text-align: center;
  }
  .brand { font-weight: 800; font-size: 26px; letter-spacing: 0.42em; margin-right: -0.42em; }
  .rule { width: 72px; height: 3px; background: currentColor; opacity: .5; margin-top: 22px; }
  .name {
    font-family: Fraunces, serif; font-style: italic; font-weight: 420; font-size: 132px; line-height: 1;
    font-variation-settings: 'SOFT' 100, 'WONK' 1; letter-spacing: -0.02em; margin-top: 10px;
  }
  .origin { font-size: 25px; font-weight: 500; opacity: .85; margin-top: 18px; max-width: 420px; line-height: 1.35; }
  .notes { font-size: 23px; font-weight: 700; margin-top: 14px; letter-spacing: .02em; }
  .roast { display: flex; gap: 16px; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; letter-spacing: .18em; text-transform: uppercase; }
  .dot { width: 18px; height: 18px; border-radius: 50%; background: currentColor; }
  .dot.off { opacity: .25; }
  .foot { display: flex; justify-content: space-between; width: 100%; font-size: 24px; font-weight: 700; }
</style></head>
<body><div class="label">
  <div style="display:flex;flex-direction:column;align-items:center">
    <div class="brand">SECAWAN</div><div class="rule"></div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center">
    <div class="name">${short}</div>
    <div class="origin">${p.origin}</div>
    <div class="notes">${p.notes.join(' / ')}</div>
  </div>
  <div style="width:100%;display:flex;flex-direction:column;gap:30px;align-items:center">
    <div class="roast">${[1, 2, 3].map((i) => `<span class="dot ${i <= dots ? '' : 'off'}"></span>`).join('')} ${p.roast} roast</div>
    <div class="foot"><span>Whole bean</span><span>${p.weight}</span></div>
  </div>
</div></body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(150)
  await page.locator('.label').screenshot({ path: `${OUT}/${p.id}.png`, omitBackground: true })
  console.log('label', p.id)
}
await browser.close()
