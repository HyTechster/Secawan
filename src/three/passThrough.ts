/**
 * TresCanvas puts `pointer-events: auto; touch-action: none` inline on its <canvas>,
 * which swallows every swipe on phones. Our scenes are purely visual (the tilt follows the
 * window pointer), so hand touches back to the page. A style passed to TresCanvas is
 * spread after its defaults, so this wins.
 */
export const PASS_THROUGH = { pointerEvents: 'none', touchAction: 'pan-y' } as const
