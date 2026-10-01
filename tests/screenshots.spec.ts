import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const sections = [
  { name: '01-hero', selector: '#top' },
  { name: '02-story', selector: '#story' },
  { name: '03-process', selector: '#process' },
  { name: '04-roast-lab', selector: '#roast-lab' },
  { name: '05-flavors', selector: '#flavors' },
  { name: '06-shop', selector: '#shop' },
  { name: '07-brew', selector: '#brew' },
  { name: '08-gallery', selector: '#gallery' },
  { name: '09-visit', selector: '#visit' },
  { name: '10-newsletter', selector: '#newsletter' },
  { name: '11-footer', selector: 'footer' },
]

/** Scroll the whole page in steps so lazy sections load and scroll animations settle. */
async function warmUp(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
}

async function scrollToSection(page: Page, selector: string, extra = 0) {
  await page.evaluate(
    ([sel, offset]) => {
      const found = document.querySelector(sel as string)
      if (!found) return
      // A pinned section sits inside a spacer; measure the spacer so the offset is stable
      const el = found.closest('.pin-spacer') ?? found
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, Math.max(0, top - 10 + (offset as number)))
    },
    [selector, extra] as const,
  )
  await page.waitForTimeout(1600)
}

test('walk the page and capture every section', async ({ page }, info) => {
  const dir = `screenshots/${info.project.name}`
  mkdirSync(dir, { recursive: true })

  const problems: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    const benign = /GPU stall|GL Driver Message|WebGL: too many|Automatic fallback to software WebGL|swiftshader/i.test(text)
    if ((msg.type() === 'error' || (msg.type() === 'warning' && /\[Vue warn\]/.test(text))) && !benign) {
      problems.push(`${msg.type()}: ${text}`)
    }
  })
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

  await page.goto('/')
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 20_000 })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${dir}/00-landing.png` })

  await warmUp(page)
  for (const s of sections) {
    await scrollToSection(page, s.selector)
    await page.screenshot({ path: `${dir}/${s.name}.png` })
  }

  // Mid-journey frame of the pinned path on desktop
  if (info.project.name === 'desktop') {
    await scrollToSection(page, '#process', 1400)
    await page.screenshot({ path: `${dir}/03b-process-mid.png` })
    await scrollToSection(page, '#process', 2600)
    await page.screenshot({ path: `${dir}/03c-process-end.png` })

    // Hero scrolled halfway: beans scatter, camera climbs
    await scrollToSection(page, '#top', 460)
    await page.screenshot({ path: `${dir}/01b-hero-scrolled.png` })

    // Roast lab, dark side
    await scrollToSection(page, '#roast-lab')
    const thumb = page.getByRole('slider', { name: 'Roast level' })
    await thumb.focus()
    await page.keyboard.press('End')
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${dir}/04b-roast-lab-dark.png` })

    // Add to bag and open the drawer
    await scrollToSection(page, '#shop')
    await page.getByRole('button', { name: /Add to bag.*Kabus/ }).click()
    await page.waitForTimeout(1300)
    await page.getByRole('button', { name: /Add to bag.*Senja/ }).click()
    await page.waitForTimeout(1300)
    await page.locator('#cart-button').click()
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${dir}/12-cart.png` })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(600)
  }

  // Mobile menu
  if (info.project.name === 'mobile') {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(600)
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${dir}/12-menu.png` })
    await page.keyboard.press('Escape')
  }

  expect(problems, problems.join('\n')).toEqual([])
})
