/**
 * Per-frame inputs for a scene. Passed as a plain (non-reactive) object and read inside the
 * render loop, so pointer moves and scroll updates never trigger Vue re-renders.
 */
export interface SceneMotion {
  /** 0..1 progress of scrolling out of the section */
  scroll: number
  /** Pointer position in -1..1 on both axes */
  pointer: { x: number; y: number }
}

export const createSceneMotion = (): SceneMotion => ({ scroll: 0, pointer: { x: 0, y: 0 } })
