<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useLoop } from '@tresjs/core'
import { CanvasTexture, Group, SRGBColorSpace, Sprite, SpriteMaterial } from 'three'

const props = withDefaults(defineProps<{ animate?: boolean; count?: number }>(), { animate: true, count: 9 })

function makeCloudTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  // A few overlapping soft puffs make one irregular cloud
  const puffs = [
    [0.5, 0.55, 0.42],
    [0.33, 0.6, 0.28],
    [0.68, 0.58, 0.3],
    [0.5, 0.42, 0.3],
  ]
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
    g.addColorStop(0, 'rgba(255,253,248,0.9)')
    g.addColorStop(0.5, 'rgba(250,246,238,0.45)')
    g.addColorStop(1, 'rgba(250,246,238,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

const texture = makeCloudTexture()
const group = new Group()
// Two bands: a mist floor under the saucer, and a cloud deck above that the camera climbs past
const clouds = Array.from({ length: props.count }, (_, i) => {
  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    opacity: 0.32 + (i % 3) * 0.1,
  })
  const sprite = new Sprite(material)
  const s = 2.6 + (i % 4) * 0.9
  sprite.scale.set(s * 1.8, s * 0.8, 1)
  const high = i % 3 === 0
  sprite.position.set(
    -9 + (i / props.count) * 18,
    high ? 3.4 + ((i * 37) % 10) / 10 : -0.9 + ((i * 37) % 10) / 10 * 0.9,
    high ? -4 - ((i * 53) % 10) / 10 * 2 : -2.5 + ((i * 53) % 10) / 10 * 3.5,
  )
  group.add(sprite)
  return { sprite, material, speed: 0.08 + ((i * 13) % 10) / 100 }
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  if (!props.animate) return
  for (const c of clouds) {
    c.sprite.position.x += c.speed * Math.min(delta, 0.05)
    if (c.sprite.position.x > 10) c.sprite.position.x = -10
  }
})

onBeforeUnmount(() => {
  texture.dispose()
  clouds.forEach((c) => c.material.dispose())
})
</script>

<template>
  <primitive :object="group" />
</template>
