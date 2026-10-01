<script setup lang="ts">
import { provide, shallowRef, watch, onBeforeUnmount } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Fog, PMREMGenerator, type Group, type Texture, type WebGLRenderer } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { SceneMotion } from './types'
import { SCENE_ENV } from './env'

const props = withDefaults(
  defineProps<{
    /** Run the render loop. False when off-screen or the tab is hidden. */
    active: boolean
    reduced?: boolean
    motion: SceneMotion
    tilt?: number
    /** Let scroll progress lift the camera "above the clouds" */
    rise?: boolean
    cameraBase?: [number, number, number]
    lookAtY?: number
    fog?: { color: string; near: number; far: number } | null
    /** Any value; when it changes, a stopped loop renders a few frames to show the new state */
    wake?: unknown
    /** Studio reflections from a procedural room (no HDR download). 0 turns them off. */
    environment?: number
  }>(),
  {
    reduced: false,
    tilt: 0.22,
    rise: false,
    cameraBase: () => [0, 1.5, 6.4],
    lookAtY: 0.9,
    fog: null,
    environment: 0,
  },
)

const group = shallowRef<Group>()
const { camera, scene, renderer } = useTres()
const { onBeforeRender, start, stop } = useLoop()

if (props.fog) scene.value.fog = new Fog(props.fog.color, props.fog.near, props.fog.far)

let envMap: Texture | null = null
if (props.environment > 0) {
  const pmrem = new PMREMGenerator(renderer as WebGLRenderer)
  const room = new RoomEnvironment()
  envMap = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  scene.value.environment = envMap
  scene.value.environmentIntensity = props.environment
}
provide(SCENE_ENV, shallowRef(envMap))

let framesLeft = 0

onBeforeRender(() => {
  const g = group.value
  const cam = camera.value
  const { pointer, scroll } = props.motion
  if (g && !props.reduced) {
    g.rotation.y += (pointer.x * props.tilt - g.rotation.y) * 0.05
    g.rotation.x += (pointer.y * props.tilt * 0.4 - g.rotation.x) * 0.05
  }
  if (cam) {
    const [bx, by, bz] = props.cameraBase
    const r = props.rise ? scroll : 0
    const k = props.reduced ? 1 : 0.12
    cam.position.x = bx
    cam.position.y += (by + r * 4.4 - cam.position.y) * k
    cam.position.z += (bz - r * 2.2 - cam.position.z) * k
    cam.lookAt(0, props.lookAtY - r * 0.5, 0)
  }
  if (framesLeft > 0 && --framesLeft === 0) stop()
})

/** Reduced motion or off-screen: draw a few settling frames, then stop the loop entirely. */
watch(
  () => [props.active, props.reduced, props.wake] as const,
  ([active, reduced]) => {
    if (!active) {
      framesLeft = 2
      return
    }
    start()
    framesLeft = reduced ? 6 : 0
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  scene.value.fog = null
  scene.value.environment = null
  envMap?.dispose()
})
</script>

<template>
  <TresGroup ref="group">
    <slot />
  </TresGroup>
</template>
