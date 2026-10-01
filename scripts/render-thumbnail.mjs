// Exports the portfolio thumbnail (design/thumbnail/thumbnail.html) at 2x as PNG and JPG.
// Run `node scripts/capture-thumbnail-shots.mjs` first to refresh the site screenshots.
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const sizes = { '4x3': [1600, 1200], '16x9': [1920, 1080] }
const browser = await chromium.launch()
for (const [key, [w, h]] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await page.goto(`${pathToFileURL(resolve('design/thumbnail/thumbnail.html'))}?size=${key}`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(400)
  const el = page.locator('#canvas')
  await el.screenshot({ path: `design/thumbnail/secawan-thumbnail-${w}x${h}.png` })
  await el.screenshot({ path: `design/thumbnail/secawan-thumbnail-${w}x${h}.jpg`, type: 'jpeg', quality: 90 })
  console.log('exported', key)
  await page.close()
}
await browser.close()
