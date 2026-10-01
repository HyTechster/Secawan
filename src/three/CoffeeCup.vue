<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'
import { CanvasTexture, Color, MeshBasicMaterial, MeshPhysicalMaterial, PlaneGeometry, ShaderMaterial, type Group } from 'three'
import { rippleFragment, rippleVertex } from './shaders/ripple'
import type { CupAssets } from './assets'
import type { SceneMotion } from './types'

const props = withDefaults(defineProps<{ assets: CupAssets; motion: SceneMotion; animate?: boolean }>(), { animate: true })

const { textures } = props.assets

// Cream glazed stoneware: clear coat over a softly scattering body, contact shadows baked in
const ceramic = new MeshPhysicalMaterial({
  color: new Color('#F7F1E6'),
  roughness: 0.3,
  clearcoat: 1,
  clearcoatRoughness: 0.07,
  sheen: 0.25,
  sheenColor: new Color('#FFF6E8'),
  aoMap: textures.cupAo,
  aoMapIntensity: 0.55,
})
const handleCeramic = ceramic.clone()
handleCeramic.aoMap = null

const glaze = new MeshPhysicalMaterial({
  color: new Color('#C2502A'),
  roughness: 0.3,
  clearcoat: 0.9,
  clearcoatRoughness: 0.09,
  aoMap: textures.saucerAo,
  aoMapIntensity: 1,
})

const crema = new ShaderMaterial({
  vertexShader: rippleVertex,
  fragmentShader: rippleFragment,
  uniforms: { uTime: { value: 0 }, uCrema: { value: textures.crema } },
})

// Soft contact shadow under the saucer: a radial gradient on a flat plane, no shadow maps needed
function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64)
  g.addColorStop(0, 'rgba(43,27,20,0.55)')
  g.addColorStop(0.55, 'rgba(43,27,20,0.22)')
  g.addColorStop(1, 'rgba(43,27,20,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}
const shadowMap = shadowTexture()
const shadowGeo = new PlaneGeometry(4.2, 4.2)
const shadowMat = new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false })

const root = shallowRef<Group>()
const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (props.animate) crema.uniforms.uTime.value = elapsed
  const g = root.value
  if (!g) return
  const targetY = -0.5 + props.motion.scroll * Math.PI * 1.4
  g.rotation.y += (targetY - g.rotation.y) * 0.08
  if (props.animate) g.position.y = Math.sin(elapsed * 0.8) * 0.04
})

onBeforeUnmount(() => {
  ;[ceramic, handleCeramic, glaze, crema, shadowMat].forEach((m) => m.dispose())
  shadowGeo.dispose()
  shadowMap.dispose()
  // Shared GLB geometry and baked textures stay cached for the Roast Lab
})
</script>

<template>
  <TresGroup ref="root" :rotation="[0, -0.5, 0]">
    <TresMesh :geometry="shadowGeo" :material="shadowMat" :position="[0.12, assets.saucerOffset - 0.03, 0.08]" :rotation="[-Math.PI / 2, 0, 0]" />
    <TresMesh :geometry="assets.saucer" :material="glaze" :position="[0, assets.saucerOffset, 0]" />
    <TresMesh :geometry="assets.cup" :material="ceramic" />
    <TresMesh :geometry="assets.handle" :material="handleCeramic" />
    <TresMesh :geometry="assets.coffee" :material="crema" />
  </TresGroup>
</template>
