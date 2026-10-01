import { inject, type InjectionKey, type ShallowRef } from 'vue'
import type { MeshStandardMaterial, Texture } from 'three'

/**
 * The studio reflection map a SceneRig creates for its canvas.
 * three.js ignores `envMapIntensity` on materials that rely on `scene.environment`,
 * so materials that need weaker reflections (dark, glossy beans) take the map directly.
 */
export const SCENE_ENV: InjectionKey<ShallowRef<Texture | null>> = Symbol('scene-env')

export function useSceneEnv(material: MeshStandardMaterial, intensity: number) {
  const env = inject(SCENE_ENV, null)
  if (env?.value) {
    material.envMap = env.value
    material.envMapIntensity = intensity
  }
}
