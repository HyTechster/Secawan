/** Coffee surface: baked crema texture with slow concentric ripples and a soft highlight. */
export const rippleVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 p = position;
    float d = length(uv - 0.5) * 2.0;
    p.y += sin(d * 34.0 - uTime * 2.0) * 0.0025 * (1.0 - d);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewPos = -mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`

export const rippleFragment = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  uniform float uTime;
  uniform sampler2D uCrema;
  void main() {
    // Baked crema is light; deepen it toward a fresh espresso crema
    vec3 col = texture2D(uCrema, vUv).rgb * vec3(0.3, 0.19, 0.12);
    float d = length(vUv - 0.5) * 2.0;
    float ring = sin(d * 34.0 - uTime * 2.0) * 0.5 + 0.5;
    col *= 0.96 + ring * 0.06 * (1.0 - d);
    // Glossy sheen toward grazing angles, like light skimming the crema
    float fres = pow(1.0 - max(dot(normalize(vNormalV), normalize(vViewPos)), 0.0), 3.0);
    col += vec3(0.9, 0.82, 0.7) * fres * 0.18;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`
