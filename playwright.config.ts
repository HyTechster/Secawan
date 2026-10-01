import { defineConfig, devices } from '@playwright/test'

/**
 * Visual review: `npm run shots` boots the dev server, walks every section and saves
 * screenshots to ./screenshots for review. It also fails on console errors or Vue warnings.
 */
const PORT = 5179

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 300_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: {
      // Software WebGL so the 3D scenes render in headless Chromium
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    // Software WebGL is CPU-bound, so emulate the phone at 1.5x to keep frame times sane
    { name: 'mobile', use: { ...devices['Pixel 7'], deviceScaleFactor: 1.5 } },
    { name: 'reduced', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
