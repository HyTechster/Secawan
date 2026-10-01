<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useLoop } from '@tresjs/core'
import { Color, DoubleSide, NormalBlending, PlaneGeometry, ShaderMaterial } from 'three'
import { steamFragment, steamVertex } from './shaders/steam'
import type { SceneMotion } from './types'

const props = withDefaults(defineProps<{ motion: SceneMotion; animate?: boolean }>(), { animate: true })

const OPACITY = 0.7

// Planes start at the coffee surface (y 0 here), so the wisps visibly leave the cup
const geometry = new PlaneGeometry(0.9, 2.2, 1, 48)
geometry.translate(0, 1.1, 0)

const wisps = [0, 1, 2].map((i) => {
  const material = new ShaderMaterial({
    vertexShader: steamVertex,
    fragmentShader: steamFragment,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: NormalBlending,
    // Tone mapping would turn white steam grey against the cream page
    toneMapped: false,
    premultipliedAlpha: true,
    uniforms: {
      uTime: { value: i * 3 },
      uSeed: { value: i * 2.17 + 0.4 },
      uOpacity: { value: OPACITY },
      uColor: { value: new Color('#FFFCF6') },
    },
  })
  // Spread round the cup but all within about 40 degrees of facing the camera
  return { material, rotation: [-0.35, 0.1, 0.45][i], offset: [-0.22, 0.05, 0.26][i] }
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  for (const w of wisps) {
    if (props.animate) w.material.uniforms.uTime.value = elapsed + w.material.uniforms.uSeed.value * 3
    w.material.uniforms.uOpacity.value = OPACITY * (1 - props.motion.scroll)
  }
})

onBeforeUnmount(() => {
  geometry.dispose()
  wisps.forEach((w) => w.material.dispose())
})
</script>

<template>
  <TresGroup :position="[0, 1.12, 0]">
    <TresMesh
      v-for="(w, i) in wisps"
      :key="i"
      :geometry="geometry"
      :material="w.material"
      :position="[w.offset, 0, 0]"
      :rotation="[0, w.rotation, 0]"
    />
  </TresGroup>
</template>
