/** Curling steam wisps: value-noise fbm scrolled upward and bent by a sine sway. */
export const steamVertex = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeed;
  void main() {
    vUv = uv;
    vec3 p = position;
    float lift = uv.y * uv.y;
    p.x += sin(uv.y * 4.0 + uTime * 0.8 + uSeed) * 0.22 * lift;
    p.z += cos(uv.y * 3.0 + uTime * 0.6 + uSeed) * 0.12 * lift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const steamFragment = /* glsl */ `
  varying vec2 vUv;
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
    float t = uTime * 0.35;
    float sway = sin(uv.y * 6.0 - uTime * 1.2 + uSeed) * 0.12 * uv.y;
    float core = 1.0 - smoothstep(0.0, 0.32, abs(uv.x - 0.5 + sway));
    float n = fbm(vec2(uv.x * 3.0 + uSeed, uv.y * 2.4 - t * 2.0));
    float wisp = core * smoothstep(0.35, 0.75, n + core * 0.25);
    float fade = smoothstep(0.0, 0.18, uv.y) * (1.0 - smoothstep(0.55, 1.0, uv.y));
    float a = wisp * fade * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`
