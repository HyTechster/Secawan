/**
 * Latte surface: light-brown crema with a poured tulip heart in milk foam,
 * slow concentric ripples and a soft sheen. The baked crema texture only adds mottling.
 */
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
  uniform float uSpin;
  uniform sampler2D uCrema;

  float dot2(vec2 v) { return dot(v, v); }

  // Signed distance to a heart (Inigo Quilez). Tip at the origin, lobes toward +y, about 1 unit tall.
  float sdHeart(vec2 p) {
    p.x = abs(p.x);
    if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
  }

  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    float mottle = texture2D(uCrema, vUv).r;

    // Crema: caramel brown, a little darker where the milk dragged it, lighter at the rim
    vec3 crema = mix(vec3(0.42, 0.24, 0.12), vec3(0.6, 0.39, 0.22), smoothstep(0.55, 1.0, r));
    crema *= 0.9 + mottle * 0.25;

    // Heart space. uv.x follows object x and uv.y object z; uSpin is the cup's turn about Y.
    // Counter-rotating keeps the tip pointing at the camera however the cup turns.
    vec2 axisX = vec2(cos(uSpin), sin(uSpin));
    vec2 axisY = vec2(sin(uSpin), -cos(uSpin));
    vec2 hp = vec2(dot(c, axisX), dot(c, axisY)) * 1.85 + vec2(0.0, 0.5);
    hp.x += sin(hp.y * 6.0 + uTime * 0.6) * 0.01;
    float h = sdHeart(hp);

    // Tulip: the heart plus two stacked foam bands inside it, separated by thin crema lines
    float foam = 1.0 - smoothstep(-0.01, 0.025, h);
    float line1 = 1.0 - smoothstep(0.012, 0.03, abs(h + 0.14));
    float line2 = 1.0 - smoothstep(0.012, 0.03, abs(h + 0.29));
    float pull = (1.0 - smoothstep(0.006, 0.02, abs(hp.x))) * step(0.05, hp.y) * step(hp.y, 0.95);
    foam *= 1.0 - 0.85 * max(max(line1, line2), pull);

    // Thin foam halo hugging the cup wall
    float halo = smoothstep(0.86, 0.97, r) * 0.45;

    vec3 milk = vec3(0.96, 0.91, 0.82) * (0.94 + mottle * 0.08);
    vec3 col = mix(crema, milk, clamp(foam + halo, 0.0, 1.0));

    float ring = sin(r * 34.0 - uTime * 2.0) * 0.5 + 0.5;
    col *= 0.97 + ring * 0.04 * (1.0 - r);

    float fres = pow(1.0 - max(dot(normalize(vNormalV), normalize(vViewPos)), 0.0), 3.0);
    col += vec3(0.9, 0.82, 0.7) * fres * 0.12;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`
