<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping } from 'three'
import SceneRig from './SceneRig.vue'
import RoastBeanMesh from './RoastBeanMesh.vue'
import type { CupAssets } from './assets'
import type { SceneMotion } from './types'
import { canvasDpr } from './dpr'
import { PASS_THROUGH } from './passThrough'

defineProps<{
  assets: CupAssets
  tint: string
  roughness: number
  clearcoat: number
  active: boolean
  reduced: boolean
  motion: SceneMotion
}>()

const dpr = canvasDpr()
</script>

<template>
  <TresCanvas :style="PASS_THROUGH" :dpr="dpr" :alpha="true" :clear-alpha="0" :antialias="true" :tone-mapping="ACESFilmicToneMapping">
    <TresPerspectiveCamera :position="[0, 0, 4.2]" :fov="35" />
    <TresAmbientLight :intensity="0.3" />
    <TresDirectionalLight :position="[-2.5, 3, 4]" :intensity="2.6" color="#FFF1DC" />
    <TresDirectionalLight :position="[3, -1, 2]" :intensity="0.8" color="#E8B97A" />
    <TresPointLight :position="[0, -2, 3]" :intensity="5" color="#D0673F" />
    <SceneRig
      :active="active"
      :reduced="reduced"
      :motion="motion"
      :tilt="0.5"
      :camera-base="[0, 0, 4.2]"
      :look-at-y="0"
      :environment="0.5"
      :wake="tint"
    >
      <RoastBeanMesh :assets="assets" :tint="tint" :roughness="roughness" :clearcoat="clearcoat" :animate="!reduced" />
    </SceneRig>
  </TresCanvas>
</template>
