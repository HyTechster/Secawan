<script setup lang="ts">
import { onBeforeUnmount, watchEffect } from 'vue'
import { useLoop } from '@tresjs/core'
import { Color, Mesh, MeshPhysicalMaterial, Vector2 } from 'three'
import type { CupAssets } from './assets'
import { useSceneEnv } from './env'

const props = defineProps<{
  assets: CupAssets
  /** Multiplier over the baked light-roast colour map */
  tint: string
  roughness: number
  clearcoat: number
  animate: boolean
}>()

/** Roast oils read as a soft sheen; full clear coat or a mirror-smooth base makes a dark bean look like metal */
const COAT = 0.3
const MIN_ROUGHNESS = 0.4
const rough = (r: number) => Math.max(MIN_ROUGHNESS, r)

const material = new MeshPhysicalMaterial({
  map: props.assets.textures.beanColor,
  normalMap: props.assets.textures.beanNormal,
  normalScale: new Vector2(1, 1),
  color: new Color(props.tint),
  roughness: rough(props.roughness),
  clearcoat: props.clearcoat * COAT,
  clearcoatRoughness: 0.4,
})
// Dark beans show reflections more than colour; keep them dim so oily reads as glossy, not chrome
useSceneEnv(material, 0.16)
const bean = new Mesh(props.assets.bean, material)
// The Blender bean lies along Z with the crease facing +Y; tip it so the crease faces the camera
const BASE = { x: Math.PI / 2 - 0.45, y: 0.2, z: 0.55 }
bean.rotation.set(BASE.x, BASE.y, BASE.z)
bean.scale.setScalar(1.2)

const target = new Color(props.tint)
watchEffect(() => target.set(props.tint))

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  // Ease toward the store values so the slider feels like heat, not a switch
  const k = props.animate ? 0.12 : 1
  material.color.lerp(target, k)
  material.roughness += (rough(props.roughness) - material.roughness) * k
  material.clearcoat += (props.clearcoat * COAT - material.clearcoat) * k
  if (props.animate) {
    // Sway around the crease-forward pose instead of spinning, so the crease stays readable
    bean.rotation.y = BASE.y + Math.sin(elapsed * 0.45) * 0.55
    bean.rotation.z = BASE.z + Math.sin(elapsed * 0.3) * 0.12
    bean.position.y = Math.sin(elapsed * 0.9) * 0.05
  }
})

onBeforeUnmount(() => material.dispose())
</script>

<template>
  <primitive :object="bean" />
</template>
