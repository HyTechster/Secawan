<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping } from 'three'
import SceneRig from './SceneRig.vue'
import CoffeeCup from './CoffeeCup.vue'
import Steam from './Steam.vue'
import Beans from './Beans.vue'
import MistClouds from './MistClouds.vue'
import type { CupAssets } from './assets'
import type { SceneMotion } from './types'
import { canvasDpr } from './dpr'
import { PASS_THROUGH } from './passThrough'

defineProps<{
  assets: CupAssets
  active: boolean
  reduced: boolean
  motion: SceneMotion
}>()

const emit = defineEmits<{ ready: [] }>()
const dpr = canvasDpr()
</script>

<template>
  <TresCanvas
    :dpr="dpr"
    :alpha="true"
    :clear-alpha="0"
    :premultiplied-alpha="true"
    :style="PASS_THROUGH"
    :antialias="true"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="1.0"
    power-preference="high-performance"
    @ready="emit('ready')"
  >
    <TresPerspectiveCamera :position="[0, 2.5, 6.1]" :fov="34" :near="0.1" :far="60" />
    <TresAmbientLight :intensity="0.25" color="#FFF4E6" />
    <TresDirectionalLight :position="[-3.5, 5.5, 4]" :intensity="2.4" color="#FFE7C7" />
    <TresDirectionalLight :position="[4, 2, -3]" :intensity="0.9" color="#DCE3DD" />

    <SceneRig
      :active="active"
      :reduced="reduced"
      :motion="motion"
      :rise="true"
      :camera-base="[0, 2.5, 6.1]"
      :look-at-y="0.75"
      :environment="0.75"
      :fog="{ color: '#EEE8DD', near: 7, far: 19 }"
    >
      <TresGroup :position="[0, -0.2, 0]">
        <CoffeeCup :assets="assets" :motion="motion" :animate="!reduced" />
        <Steam :motion="motion" :animate="!reduced" />
      </TresGroup>
      <Beans :assets="assets" :motion="motion" :animate="!reduced" />
      <MistClouds :animate="!reduced" :count="12" />
    </SceneRig>
  </TresCanvas>
</template>
