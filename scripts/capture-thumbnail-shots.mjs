// Captures crisp hero screenshots used by design/thumbnail/thumbnail.html.
// Needs the dev server: npm run dev -- --port 5179
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'design/thumbnail/shots'
mkdirSync(OUT, { recursive: true })
// Use the real GPU: software WebGL is far too slow for 2x captures of the 3D hero
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] })

async function shot(name, viewport, scale, scrollTo) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale })
  if (name === 'desktop-hero') {
    page.on('console', (m) => /WebGL|GPU|renderer/i.test(m.text()) && console.log('  console:', m.text().slice(0, 120)))
    const gpu = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2')
      const ext = gl?.getExtension('WEBGL_debug_renderer_info')
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown'
    })
    console.log('  renderer:', gpu)
  }
  await page.goto('http://localhost:5179/')
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 60000 })
  if (scrollTo) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel)
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 10)
    }, scrollTo)
  }
  await page.mouse.move(viewport.width * 0.7, viewport.height * 0.4)
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 120000 })
  await page.close()
}

await shot('desktop-hero', { width: 1440, height: 900 }, 2)
await shot('mobile-hero', { width: 390, height: 844 }, 3)
await shot('desktop-shop', { width: 1440, height: 900 }, 2, '#shop')
await browser.close()
console.log('done')
