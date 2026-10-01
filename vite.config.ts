/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { templateCompilerOptions } from '@tresjs/core'

// For GitHub Pages, build with BASE_PATH=/repo-name/ npm run build
const base = process.env.BASE_PATH ?? '/'

/**
 * Dev-only: loads Figma's html-to-design capture script so the running page can be pushed
 * into Figma (it only acts when the URL carries a #figmacapture hash). Never shipped in builds.
 */
const figmaCapture = (): Plugin => ({
  name: 'figma-capture-dev',
  apply: 'serve',
  transformIndexHtml: () => [
    { tag: 'script', attrs: { src: 'https://mcp.figma.com/mcp/html-to-design/capture.js', async: true }, injectTo: 'body' },
  ],
})

export default defineConfig({
  base,
  plugins: [
    vue({
      ...templateCompilerOptions,
    }),
    tailwindcss(),
    figmaCapture(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@tresjs')) return 'tres'
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
