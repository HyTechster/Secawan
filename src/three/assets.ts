import {
  Float32BufferAttribute,
  NoColorSpace,
  SRGBColorSpace,
  TextureLoader,
  type BufferGeometry,
  type Mesh,
  type Texture,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

/**
 * The cup, saucer, coffee surface and bean were modelled in Blender (design/blender/secawan-hero.blend)
 * and exported as one meshopt-compressed GLB. Detail that geometry cannot carry cheaply
 * (bean surface, crema, contact shadows) is baked into small WebP textures.
 */
export interface CupAssets {
  cup: BufferGeometry
  handle: BufferGeometry
  saucer: BufferGeometry
  saucerOffset: number
  coffee: BufferGeometry
  bean: BufferGeometry
  textures: {
    beanColor: Texture
    beanNormal: Texture
    crema: Texture
    cupAo: Texture
    saucerAo: Texture
  }
}

let pending: Promise<CupAssets> | null = null

export function loadCupAssets(): Promise<CupAssets> {
  if (pending) return pending
  const base = `${import.meta.env.BASE_URL}models/`
  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const texLoader = new TextureLoader()

  const texture = async (name: string, color: boolean) => {
    const t = await texLoader.loadAsync(`${base}textures/${name}.webp`)
    t.flipY = false // glTF UV convention
    t.colorSpace = color ? SRGBColorSpace : NoColorSpace
    t.anisotropy = 4
    return t
  }

  pending = Promise.all([
    gltfLoader.loadAsync(`${base}secawan-cup.glb`),
    texture('bean-color', true),
    texture('bean-normal', false),
    texture('crema', true),
    texture('cup-ao', false),
    texture('saucer-ao', false),
  ]).then(([gltf, beanColor, beanNormal, crema, cupAo, saucerAo]) => {
    gltf.scene.updateMatrixWorld(true)
    /**
     * Meshopt quantisation stores positions as normalised integers and moves the
     * de-quantising scale and offset onto each node, so bake the node's world matrix
     * into a float copy of the geometry before using it on its own.
     */
    const geometry = (name: string) => {
      const found = gltf.scene.getObjectByName(name) as Mesh | undefined
      if (!found) throw new Error(`Missing mesh ${name} in secawan-cup.glb`)
      const g = found.geometry.clone()
      for (const key of Object.keys(g.attributes)) {
        const attr = g.getAttribute(key)
        if (attr.normalized || !(attr.array instanceof Float32Array)) {
          g.setAttribute(key, new Float32BufferAttribute(Float32Array.from({ length: attr.count * attr.itemSize }, (_, i) =>
            attr.getComponent(Math.floor(i / attr.itemSize), i % attr.itemSize)), attr.itemSize))
        }
      }
      g.applyMatrix4(found.matrixWorld)
      g.computeBoundingSphere()
      return g
    }
    return {
      cup: geometry('CupBody'),
      handle: geometry('CupHandle'),
      saucer: geometry('SaucerBody'),
      saucerOffset: 0,
      coffee: geometry('CoffeeSurface'),
      bean: geometry('BeanLo'),
      textures: { beanColor, beanNormal, crema, cupAo, saucerAo },
    }
  })
  return pending
}
