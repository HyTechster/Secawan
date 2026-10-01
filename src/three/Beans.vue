<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useLoop } from '@tresjs/core'
import { Color, InstancedMesh, MeshStandardMaterial, Object3D, Vector2, Vector3 } from 'three'
import type { CupAssets } from './assets'
import type { SceneMotion } from './types'
import { useSceneEnv } from './env'

const props = withDefaults(defineProps<{ assets: CupAssets; motion: SceneMotion; count?: number; animate?: boolean }>(), {
  count: 40,
  animate: true,
})

// Seeded random so the composition is the same on every visit
let seed = 7
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// The baked colour map is a light roast; the material colour multiplies it down to a medium-dark roast
const material = new MeshStandardMaterial({
  map: props.assets.textures.beanColor,
  normalMap: props.assets.textures.beanNormal,
  normalScale: new Vector2(1, 1),
  color: new Color('#8C4A28'),
  roughness: 0.5,
  metalness: 0,
})
useSceneEnv(material, 0.22)
const mesh = new InstancedMesh(props.assets.bean, material, props.count)
mesh.frustumCulled = false

// Per-bean roast variation, multiplied on top of the material colour
const tones = ['#FFFFFF', '#E6DCD6', '#F4EAE2', '#D2C4BC', '#FFF6EE'].map((c) => new Color(c))

const beans = Array.from({ length: props.count }, (_, i) => {
  const angle = (i / props.count) * Math.PI * 2 + rand() * 0.6
  const radius = 1.9 + rand() * 2.6
  const base = new Vector3(Math.cos(angle) * radius, -0.3 + rand() * 2.9, Math.sin(angle) * radius * 0.8 - 0.4)
  mesh.setColorAt(i, tones[i % tones.length])
  return {
    base,
    dir: base.clone().setY(base.y * 0.4 + 0.6).normalize(),
    scale: 0.085 + rand() * 0.06,
    rot: new Vector3(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
    spin: new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.6),
    phase: rand() * Math.PI * 2,
    speed: 0.4 + rand() * 0.5,
  }
})

const dummy = new Object3D()
let eased = props.motion.scroll

function layout(elapsed: number, delta: number) {
  // Beans scatter outward as the hero scrolls away
  eased += (props.motion.scroll - eased) * (props.animate ? Math.min(1, delta * 4) : 1)
  const push = eased * eased * 6
  beans.forEach((b, i) => {
    const bob = props.animate ? Math.sin(elapsed * b.speed + b.phase) * 0.12 : 0
    dummy.position.copy(b.base).addScaledVector(b.dir, push)
    dummy.position.y += bob
    if (props.animate) b.rot.addScaledVector(b.spin, delta)
    dummy.rotation.set(b.rot.x + eased * 3, b.rot.y, b.rot.z)
    dummy.scale.setScalar(b.scale)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate = true
}

layout(0, 0)
if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed, delta }) => layout(elapsed, Math.min(delta, 0.05)))

onBeforeUnmount(() => {
  material.dispose()
  mesh.dispose()
})
</script>

<template>
  <primitive :object="mesh" />
</template>
