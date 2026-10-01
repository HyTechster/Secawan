<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useLoop } from '@tresjs/core'
import { Color, DoubleSide, NormalBlending, PlaneGeometry, ShaderMaterial } from 'three'
import { steamFragment, steamVertex } from './shaders/steam'
import type { SceneMotion } from './types'

const props = withDefaults(defineProps<{ motion: SceneMotion; animate?: boolean }>(), { animate: true })

const geometry = new PlaneGeometry(0.9, 2.4, 1, 40)
geometry.translate(0, 1.2, 0)

const wisps = [0, 1, 2].map((i) => {
  const material = new ShaderMaterial({
    vertexShader: steamVertex,
    fragmentShader: steamFragment,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      uTime: { value: i * 3 },
      uSeed: { value: i * 2.17 + 0.4 },
      uOpacity: { value: 0.55 },
      uColor: { value: new Color('#FFFDF8') },
    },
  })
  return { material, rotation: (i * Math.PI) / 3, offset: (i - 1) * 0.18 }
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  for (const w of wisps) {
    if (props.animate) w.material.uniforms.uTime.value = elapsed + w.material.uniforms.uSeed.value * 3
    w.material.uniforms.uOpacity.value = 0.55 * (1 - props.motion.scroll)
  }
})

onBeforeUnmount(() => {
  geometry.dispose()
  wisps.forEach((w) => w.material.dispose())
})
</script>

<template>
  <TresGroup :position="[0, 1.18, 0]">
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
