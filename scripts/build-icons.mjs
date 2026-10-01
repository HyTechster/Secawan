// Builds the icon set (run with `npm run icons`):
//  - small PNGs rasterised from public/favicon.svg (crisp at tab sizes) and packed into favicon.ico
//  - large PNGs: the Blender bean render (transparent, shadow-caught) composited onto the exact
//    brand terracotta. Re-render it from the "Secawan Icon" scene in design/blender/secawan-hero.blend.
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const BEAN = process.argv[2] ?? 'design/blender/icon-bean.png'
mkdirSync('screenshots', { recursive: true })
const TERRACOTTA = '#D0673F'
const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })

// Small sizes from the vector mark
const svg = readFileSync('public/favicon.svg', 'utf8')
const small = {}
for (const size of [16, 32, 48]) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}`)
  small[size] = await page.screenshot({ omitBackground: true })
}

// favicon.ico with PNG-encoded entries (supported by every current browser)
const entries = Object.entries(small)
const header = Buffer.alloc(6 + 16 * entries.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(entries.length, 4)
let offset = header.length
entries.forEach(([size, png], i) => {
  const o = 6 + i * 16
  header.writeUInt8(Number(size) % 256, o)
  header.writeUInt8(Number(size) % 256, o + 1)
  header.writeUInt16LE(1, o + 4)
  header.writeUInt16LE(32, o + 6)
  header.writeUInt32LE(png.length, o + 8)
  header.writeUInt32LE(offset, o + 12)
  offset += png.length
})
writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries.map(([, png]) => png)]))

// Large sizes from the Blender render, on a full-bleed square (iOS and Android round the corners)
const beanData = `data:image/png;base64,${readFileSync(BEAN).toString('base64')}`
const large = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }
for (const [name, size] of Object.entries(large)) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<body style="margin:0"><canvas id="c" width="${size}" height="${size}"></canvas></body>`)
  const dataUrl = await page.evaluate(
    async ({ src, size, bg }) => {
      const img = new Image()
      img.src = src
      await img.decode()
      const c = document.getElementById('c')
      const ctx = c.getContext('2d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, size, size)
      return c.toDataURL('image/png')
    },
    { src: beanData, size, bg: TERRACOTTA },
  )
  writeFileSync(`public/${name}`, Buffer.from(dataUrl.split(',')[1], 'base64'))
}

// Review sheet
const b64 = (buf) => `data:image/png;base64,${buf.toString('base64')}`
await page.setViewportSize({ width: 760, height: 260 })
await page.setContent(`<body style="margin:0;display:grid;grid-template-columns:1fr 1fr 1.4fr;height:260px">
  <div style="background:#f1f1f1;display:flex;gap:16px;align-items:center;justify-content:center">
    <img src="${b64(small[16])}"><img src="${b64(small[32])}"><img src="${b64(small[48])}"></div>
  <div style="background:#202124;display:flex;gap:16px;align-items:center;justify-content:center">
    <img src="${b64(small[16])}"><img src="${b64(small[32])}"><img src="${b64(small[48])}"></div>
  <div style="background:#e9e9ee;display:flex;gap:18px;align-items:center;justify-content:center">
    <img src="${b64(readFileSync('public/apple-touch-icon.png'))}" width="120" style="border-radius:27px">
    <img src="${b64(readFileSync('public/icon-192.png'))}" width="72" style="border-radius:50%"></div></body>`)
await page.screenshot({ path: 'screenshots/favicon-review.png' })
await browser.close()
console.log('ico bytes', offset)
