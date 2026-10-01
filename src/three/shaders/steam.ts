/**
 * Steam: thin wisps that leave the coffee surface, curl as they rise, then thin out.
 * Value-noise fbm breaks each wisp up; the curl comes from a height-driven sway.
 */
export const steamVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;
  uniform float uTime;
  uniform float uSeed;
  void main() {
    vUv = uv;
    vec3 n = normalize(normalMatrix * normal);
    vFacing = smoothstep(0.15, 0.6, abs(n.z));
    vec3 p = position;
    float lift = uv.y * uv.y;
    p.x += sin(uv.y * 3.0 - uTime * 0.8 + uSeed) * 0.32 * lift;
    p.z += cos(uv.y * 2.6 - uTime * 0.6 + uSeed) * 0.2 * lift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const steamFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  uniform vec3 uColor;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.45;
    // The wisp's centre line curls more the higher it rises
    float sway = sin(uv.y * 4.0 - uTime * 1.1 + uSeed) * 0.2 * uv.y
               + sin(uv.y * 9.0 - uTime * 1.9 + uSeed * 2.0) * 0.07 * uv.y;
    // A thread at the cup that billows wider and softer as it climbs
    float width = mix(0.06, 0.34, pow(uv.y, 0.8));
    float core = 1.0 - smoothstep(0.0, width, abs(uv.x - 0.5 - sway));
    core *= core;
    float n = fbm(vec2(uv.x * 2.6 + uSeed, uv.y * 2.3 - t * 2.4));
    // Seen edge-on, a plane collapses to a hard thread; fade those angles out
    float wisp = core * smoothstep(0.34, 0.74, n + core * 0.25) * vFacing;
    // Present right from the surface, thinning out well before the top of the plane
    float fade = smoothstep(0.0, 0.05, uv.y) * (1.0 - smoothstep(0.3, 0.85, uv.y));
    float a = wisp * fade * uOpacity;
    if (a < 0.003) discard;
    // Premultiplied: the canvas is transparent, and straight alpha would composite as grey
    gl_FragColor = vec4(uColor * a, a);
  }
`
