"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type * as THREE_NS from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * PHASE 4.5 — L'esprit (the reveal after the Musée panorama).
 *
 * dala's actual technique, rebuilt: a CC-BY brain mesh (Poly by Google) is
 * EVENLY RESAMPLED (area-weighted) into ~2.7k surface points — decoupled from the
 * mesh's uneven tessellation — and each point places one small instanced facet.
 * The facets are drawn as HOLLOW OUTLINE TRIANGLES (barycentric edge shader) and
 * kept SMALL with space between them, so the brain's PROFILE reads through the
 * negative space instead of packing into a solid, ball-like clump (the old bug).
 *
 * SURFACE DETAIL (what makes it read as a BRAIN, not a lump): the model's gyri/sulci
 * convolutions live in its NORMAL + DIFFUSE maps, NOT its low-poly geometry. At load
 * we sample those maps per facet (via the point's UV through the mesh's TBN) and bake
 * a fold-accurate surface normal + luminance into each point; the shader then LIGHTS
 * that normal with a fixed key light so ridges catch light and the deep sulci fall
 * into shadow — the convolutions read in relief and the brain is unmistakable. (The
 * .glb is a surface shell, so there are no internal ventricles to draw — the folded
 * cortical surface + cerebellum is what carries the anatomy.)
 *
 * Critical for legibility: the brain is auto-oriented to a PROFILE view from its
 * bounding-box extents (largest extent → horizontal, smallest → vertical, view
 * down the middle axis), so the classic brain silhouette + stem read clearly.
 *
 * Frame: linear → UnrealBloom → FXAA → ACES tonemap (EffectComposer, MSAA RT).
 * Near-black backdrop drawn in-GL so bloom composites cleanly. The brain stays
 * FIXED in its side-profile pose (no auto-spin); depth comes from a pointer
 * PARALLAX that tilts/shifts the group toward the cursor. Near the cursor the
 * facets SCATTER into a loose triangle cloud (a local dissolve), not a hole.
 *
 * Scroll (one pinned timeline, progress 0→1):
 *   · 0.00–0.34  facets fly in from a scatter cloud and ASSEMBLE into the brain
 *   · 0.34–0.52  hold — the white wireframe brain breathes/tumbles
 *   · 0.52–0.78  a cinematic Y-axis FLIP; mid-flip the facets recolour to brand
 *   · 0.78–0.85  hold — the colourful brain
 *   · 0.85–1.00  the facets SCATTER back apart as the scroll finishes
 * Caption advances in step. Left: frosted-glass 3D AQLUMA (air.inc treatment).
 *
 * Reduced motion: static colourful brain + final caption (no spin, no scrub).
 *
 * Model: "Brain" by Poly by Google (CC-BY) via Poly Pizza — /public/models/brain.glb
 */

const VOID = "#080A0C";

// AQLUMA brand mix for the colourful brain (sRGB → linear at build). dala reads
// WHITE-dominant with vivid accent pops, so weight white/cream high and keep the
// brand accents saturated (not muddy terracotta). White stays brand-neutral.
const BRAND_HEX = [
  0xffffff, 0xfff7ea, 0xffffff, // white / warm-white ×3 (clean, luminous)
  0xf3bd47, 0xffcf5e, 0xffd877, // gold ×3, brighter range (dala reads gold-heavy)
  0xff48ad, // magenta pop ×1
  0xb98bff, // violet, lifted (was a muddy plum) ×1
  0x2bd1ab, // teal ×1
  0x46d6e6, // cyan ×1
  0xff8a46, // warm amber-orange (was dark terracotta) ×1
];

// The wordmark (AQLUMA, Didot signature) reads as the subject of LEAD. Below it,
// two descriptions cross-fade on scroll: the "lost" adolescent (no method) →
// the adolescent who thinks WITH the AI. Copy distilled from the Briefing/Studio
// scripts (assets/scripts.txt): "Même outil. Deux trajectoires."
const LEAD = "transforme votre adolescent.";
const LOST =
  "D'un adolescent qui demande une réponse, la recopie et l'oublie le lendemain — un esprit perdu, sans méthode, dont la voix se dissout dans celle de la machine.";
const THINKER =
  "à un esprit qui pense avec l'IA : il interroge, vérifie, reformule et garde sa voix. Même outil, deux trajectoires — la différence, c'est la méthode.";

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Smootherstep (Ken Perlin) — zero 1st AND 2nd derivative at both ends, so the
// assemble/scatter and the swap ease in and out with no perceptible snap.
const smoother = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uForm;      // 0..1 assemble
  uniform float uFlip;      // 0..PI scroll flip angle (Y)
  uniform float uSpin;      // continuous idle spin angle (Y)
  uniform float uColorMix;  // 0..1 white -> brand colour
  uniform float uScatter;   // 0..1 end-of-scroll dispersal
  uniform vec2  uMouse;     // pointer in group-local world XY
  uniform float uAmp;

  attribute vec3 aBary;     // barycentric coord of this triangle corner
  attribute vec3 aOffset;   // brain-surface position (normalised, r~1)
  attribute vec3 aScatter;  // fly-in origin
  attribute vec3 aRandom;   // per-facet seeds
  attribute vec3 aColor;    // per-facet brand colour (linear)
  attribute vec3 aNormal;   // baked surface normal WITH normal-map fold detail (gyri/sulci)
  attribute float aLum;     // diffuse-map luminance at this point (painted fold contrast)

  varying vec3 vColor;
  varying vec3 vBary;
  varying float vFade;

  // --- Ashima 3D simplex noise ---
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vBary = aBary;

    // CONSTRUCT bottom→top, DECONSTRUCT top→bottom. Each facet runs its OWN
    // assemble window, staggered by its height in the brain (h: 0 = base/stem,
    // 1 = crown). On uForm the base resolves first and the build climbs upward;
    // on uScatter (end-of-scroll) the crown lets go first and the dissolve falls
    // downward — so the brain is laid down from the bottom and peeled off the top.
    float h = clamp(aOffset.y * 0.5 + 0.5, 0.0, 1.0);
    const float BAND = 0.55;        // stagger spread (0 = all at once → 1 = fully sequential)
    float formStag = smoothstep(0.0, 1.0, clamp((uForm     -        h  * BAND) / (1.0 - BAND), 0.0, 1.0));
    float scatStag = smoothstep(0.0, 1.0, clamp((uScatter  - (1.0 - h) * BAND) / (1.0 - BAND), 0.0, 1.0));
    float form = formStag;
    float assemble = formStag * (1.0 - scatStag);
    vec3 center = mix(aScatter, aOffset, assemble);

    // Barely-there breathing — keeps the surface alive WITHOUT fluffing the
    // silhouette (the old larger puff rounded the profile off toward a ball).
    float spread = snoise(aOffset * 3.5 + uTime * 0.06) * 0.005;
    center += normalize(aOffset + 0.001) * spread * form;

    // SCATTERED FIELD — keep it ALIVE: a slow, per-shard 3D drift (noise-driven),
    // strongest in Z so the cloud floats through DEPTH (foreground/background
    // parallax) instead of sitting frozen. Each shard rides its own low-frequency
    // current. Gated by uScatter so the assembled brain is never disturbed.
    float dT = uTime * 0.10;
    vec3 dSeed = aScatter * 0.5 + aRandom * 9.0;
    vec3 drift = vec3(
      snoise(dSeed + vec3(dT, 0.0, 4.0)),
      snoise(dSeed + vec3(0.0, dT * 0.8, 8.0)),
      snoise(dSeed + vec3(0.0, 0.0, dT * 1.3))
    );
    center += drift * vec3(0.22, 0.20, 0.65) * uScatter;

    // Y-axis rotation of the whole cloud: scroll flip + slow perpetual idle spin.
    // Done here (not on the group) so uMouse stays valid in local space.
    float ang = uFlip + uSpin;
    float ca=cos(ang), sa=sin(ang);
    center = vec3(ca*center.x + sa*center.z, center.y, -sa*center.x + ca*center.z);

    // Pointer SCATTER: near the cursor the facets jitter/shimmer IN PLACE in
    // RANDOM directions (not radially away from the cursor), so they sparkle and
    // tumble while the dense field stays intact — no void/hole is ever cleared.
    // They also brighten and grow a touch (see brightness + scale below).
    vec2 toM = center.xy - uMouse;
    float md2 = dot(toM, toM);
    float ptScatter = exp(-md2 * 6.0);          // soft gaussian around the cursor
    ptScatter *= (1.0 - uScatter);              // no cursor interaction once scattered (CTA field)
    vec3 jitterDir = normalize(aRandom - 0.5 + 0.0001);
    float wob = snoise(aOffset * 5.0 + uTime * 1.6);
    center += jitterDir * ptScatter * 0.14 * (0.7 + 0.3 * wob) * form;

    // Lay each shard FLAT on the brain surface: build a tangent basis from the
    // outward normal so triangles tile the 3D shell (and foreshorten as it spins)
    // instead of billboarding flat at the camera. This is the "3D texture".
    float n = snoise(center * uAmp + uTime * 0.15);
    vec3 N = normalize(center + 0.0001);          // true surface normal (rim/shade)

    // Surface tangent frame (T, Bt) + outward normal N — the basis each shard lives
    // in. Each shard is a flat triangle that ROTATES IN 3D inside this frame: it
    // spins in-plane AND tumbles out-of-plane over time, so the polygons read as
    // little 3D plates turning in space (edge-on, then flat). Per-shard seeds +
    // speeds so they're all out of phase.
    vec3 up = abs(N.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 T = normalize(cross(up, N));
    vec3 Bt = cross(N, T);

    float spin   = aRandom.x * 6.2831853 + n * 0.3 + uTime * (0.18 + aRandom.y * 0.30);
    float tumble = aRandom.z * 6.2831853 + uTime * (0.14 + aRandom.x * 0.26);

    // PER-SHARD SHAPE VARIETY (dala-style geometric marks): reshape each facet's
    // base triangle per instance so the field reads as a *designed* set of marks —
    // some equilateral, some slim carets/arrows, some leaning scalenes — instead of
    // one repeated equilateral. The reshape is AREA-PRESERVING (det = aspect·(1/aspect)
    // = 1, shear keeps area) and a pure 2D corner edit, so footprint, density, sizes
    // and the barycentric outline are unchanged — the brain profile never moves.
    float aspect = mix(0.58, 1.62, aRandom.x);            // tall ↔ wide
    float lean   = (aRandom.z - 0.5) * 0.8;               // scalene skew / lean
    // Reshape only the BASE (xy); keep position.z (the apex height) intact so the
    // tetrahedron stays a 3D pyramid — height + a "head" — not a flattened triangle.
    vec3 q = vec3(position.x * aspect + position.y * lean, position.y / aspect, position.z);
    float cs = cos(spin), sn = sin(spin);
    q = vec3(q.x * cs - q.y * sn, q.x * sn + q.y * cs, q.z);   // spin around the normal
    // Tumble on TWO axes so the pyramids constantly turn through 3/4 views (where the
    // head + side faces read as volume) instead of settling apex-on and looking flat.
    float ct = cos(tumble), st = sin(tumble);
    q = vec3(q.x, q.y * ct - q.z * st, q.y * st + q.z * ct);   // tumble around X
    float t2 = aRandom.y * 6.2831853 + uTime * (0.11 + aRandom.z * 0.20);
    float c2 = cos(t2), s2 = sin(t2);
    q = vec3(q.x * c2 + q.z * s2, q.y, -q.x * s2 + q.z * c2);   // tumble around Y → full 3D

    // SMALL shards, strong size variation: most tiny, a few larger accents. Plus an
    // INTERIOR THIN-OUT — shards on the front/back caps (low restEdge) shrink so the
    // centre opens up and the brain's silhouette/structure leads (more readable),
    // while the limb stays full. restEdge is baked from the rest pose → no flicker.
    float restEdge = 1.0 - abs(normalize(aOffset + 0.0001).z);
    float sv = pow(aRandom.y, 1.7);
    // BRAIN pose: small, varied shards thinned toward the interior so the PROFILE
    // reads through the negative space (unchanged).
    float sBrain = (0.5 + sv * 0.85) * mix(0.72, 1.0, smoothstep(0.05, 0.55, restEdge));
    // SCATTERED field: a tighter size range with a higher floor so EVERY shard
    // reads as a clean, detailed triangle (dala-style) — not a few giants among
    // dots. Blend brain → scatter sizing by uScatter.
    float sScatter = 0.85 + sv * 0.55;
    float s = mix(sBrain, sScatter, uScatter) * mix(0.10, 1.0, form);
    s *= 1.0 + ptScatter * 0.9;                 // shimmering shards read a touch larger
    vec3 finalPos = center + (T * q.x + Bt * q.y + N * q.z) * s;

    // Read as a PROFILE, not a see-through ball: the front surface + the silhouette
    // dominate, while the BACK hemisphere fades back (less overlap muddle). The rim
    // (normal ⟂ view) re-lifts the outline so the brain's edge is traced — this is
    // the single biggest legibility lever, dala-style.
    // The SHAPE reads from point density (pointillist), not a traced edge — a hard
    // rim just traces the convex hull (an oval). So: front surface leads, back
    // hemisphere drops back to cut see-through muddle, and only a GENTLE rim lifts
    // the limb. Colour variation (below) is what stops the density reading as a
    // solid ball, dala-style.
    float rim = pow(1.0 - abs(N.z), 1.6);
    float facing = clamp(N.z, 0.0, 1.0);      // 1 = facing camera, 0 = side/back
    float depthF = clamp(center.z * 0.5 + 0.5, 0.0, 1.0);
    float frontW = mix(0.18, 1.0, facing) + rim * 0.35;
    float shade = mix(0.82, 1.14, depthF);

    // FOLD RELIEF — the gyri/sulci that say "brain" live in the model's NORMAL MAP,
    // baked per facet into aNormal at load (tangent-space map → world via the mesh
    // TBN). Light that detailed normal with a fixed key light so ridges catch light
    // and the deep sulci drop into shadow: this is the single lever that turns a
    // smooth lobe into a convoluted brain. Rotate the baked normal with the SAME
    // flip+spin as the cloud (ca/sa) so the relief tracks the pose as it turns.
    vec3 nLit = vec3(ca * aNormal.x + sa * aNormal.z, aNormal.y, -sa * aNormal.x + ca * aNormal.z);
    float keyL = clamp(dot(nLit, normalize(vec3(-0.35, 0.5, 0.78))), 0.0, 1.0);
    float foldLight = 0.66 + 0.58 * keyL;       // ambient floor → lit gyri push into bloom
    foldLight = mix(foldLight, 1.0, uScatter);  // scattered shards aren't surface-shaded
    // Painted gyri/sulci contrast from the diffuse map (aLum) — kept subtle, brain only.
    float surf = mix(0.82 + 0.36 * aLum, 1.0, uScatter);

    // SCATTERED DEPTH — read the cloud in real 3D: fade + dim each shard by its TRUE
    // camera depth (far shards sit back, gauzy; near shards lead, crisp) and give
    // every shard its own base opacity so the field is a mix of faint and bright —
    // never a flat, evenly-lit wall. Only engaged as the field scatters (uScatter).
    float depthCam = smoothstep(-2.8, 2.2, center.z);     // 0 far → 1 near
    float baseAlpha = 0.40 + 0.60 * aRandom.x;            // per-shard density
    float scatterFade = mix(0.16, 1.0, depthCam) * baseAlpha;
    float scatterDim = mix(0.6, 1.18, depthCam);          // far reads darker, near hotter

    float brightness = (0.92 + 0.30 * aRandom.z) * shade * frontW * foldLight * surf * (1.0 + ptScatter * 0.9);
    brightness = mix(brightness, brightness * scatterDim, uScatter);
    vColor = mix(vec3(0.97, 0.96, 0.94), aColor, uColorMix) * brightness;

    float assembledFade = (0.30 + 0.70 * form) * (mix(0.32, 1.0, facing) + rim * 0.3);
    vFade = mix(assembledFade, scatterFade, uScatter);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying vec3 vBary;
  varying float vFade;
  void main(){
    // Hollow triangle: keep a thin band near the edges, ghost the interior.
    float d = min(min(vBary.x, vBary.y), vBary.z);
    float line = 1.0 - smoothstep(0.03, 0.085, d);   // crisp outline
    float a = max(line, 0.05) * vFade;                // outline + faint fill
    if (a < 0.01) discard;
    // Edges run hotter than the ghost fill so the wireframe pops (and blooms).
    vec3 col = vColor * (0.45 + 0.55 * line);
    gl_FragColor = vec4(col, a);
  }
`;

// Near-black ambient backdrop with two faint, small glows (warm-violet upper,
// teal lower) drawn in-GL so the bloom/tonemap pipeline composites over a real
// frame. Colours are LINEAR and kept dim so the backdrop never blooms.
const BG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const BG_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uAspect;
  float glow(vec2 uv, vec2 c, float r){
    float d = length((uv - c) * uAspect);
    return smoothstep(r, 0.0, d);
  }
  void main(){
    vec3 col = vec3(0.0020, 0.0026, 0.0032);          // void, linear
    col += vec3(0.018, 0.006, 0.040) * glow(vUv, vec2(0.66, 0.60), 0.42); // violet
    col += vec3(0.002, 0.022, 0.018) * glow(vUv, vec2(0.60, 0.30), 0.40); // teal
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Total facets, spread EVENLY across the brain surface (area-weighted resample,
// see below) rather than one-per-face. Decoupling count from the mesh lets us dial
// density directly. dala reads DENSE (the brain's form comes from point density,
// pointillist) but textured — so we want many SMALL hollow shards with gaps, not a
// sparse handful (too sparse and the shape doesn't render). ~5.4k small shards
// keeps clear negative space between them while the profile still reads — and gives
// the fold lighting enough resolution to render the gyri/sulci convolutions.
const TARGET_COUNT = 5400;

// Fold-detail bake tuning. NORMAL_STRENGTH blends the normal-map-perturbed normal
// toward the smooth geometry normal (1 = full map detail; lower tempers the sparkle
// into smoother folds). NORMAL_GREEN flips the map's green channel if the relief
// reads inverted (glTF authors +Y/OpenGL, so default +1 — set -1 for DirectX maps).
const NORMAL_STRENGTH = 0.9;
const NORMAL_GREEN = 1;
// Facet triangle radius (object space, before per-facet scale). Kept tiny — a
// shard, not a panel — so even at this count neighbours leave gaps (hollow
// outlines) and the texture stays airy instead of a solid ball. Smaller now that
// each mark is a 3D pyramid (the apex adds bulk), so the brain profile still reads.
// Trimmed a touch at the higher count so neighbours still leave gaps (airy, not solid).
const R = 0.0122;
// Apex height — the "head" that lifts each mark off the surface so it reads as a
// little 3D pyramid (height + a point), not a flat plate. Tall enough to read as a
// spike, but kept modest so the apexes don't fluff the silhouette into a ball.
const H = R * 2.4;

// Each facet is a small TETRAHEDRON (triangular pyramid): a triangular base laid
// on the brain surface (z = 0) plus an APEX raised along +z (the "head"). Drawn as
// a hollow wireframe — one barycentric set per face — so it reads as a 3D triangle
// turning in space rather than a flat 2D outline. 4 faces × 3 corners = 12 verts.
function makeTetra(): Float32Array {
  const a = [0, R * 1.2, 0];
  const b = [R, -R * 0.6, 0];
  const c = [-R, -R * 0.6, 0];
  const d = [R * 0.4, -R * 0.1, H]; // apex / head — offset so the pyramid leans (reads 3D from more angles)
  // prettier-ignore
  return new Float32Array([
    ...a, ...b, ...c, // base
    ...a, ...b, ...d, // side
    ...b, ...c, ...d, // side
    ...c, ...a, ...d, // side
  ]);
}
// Barycentric coords per corner, repeated for each of the 4 faces — drives the
// hollow outline so every edge of the tetra is traced (wireframe pyramid).
// prettier-ignore
const BARY = new Float32Array([
  1, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 1, 0, 0, 0, 1,
]);

export default function MindReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0); // 0 = lost adolescent, 1 = thinker
  const [ended, setEnded] = useState(false); // after the scatter: copy out, CTA in
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let cleanupGL: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
      const { ShaderPass } = await import("three/examples/jsm/postprocessing/ShaderPass.js");
      const { OutputPass } = await import("three/examples/jsm/postprocessing/OutputPass.js");
      const { FXAAShader } = await import("three/examples/jsm/shaders/FXAAShader.js");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setClearColor(0x000000, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      // Ambient backdrop — fullscreen triangle in clip space, rendered first.
      const bgUniforms = { uAspect: { value: new THREE.Vector2(1, 1) } };
      const bgGeo = new THREE.BufferGeometry();
      bgGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
      );
      bgGeo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
      const bgMat = new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        vertexShader: BG_VERT,
        fragmentShader: BG_FRAG,
        depthTest: false,
        depthWrite: false,
      });
      const bgMesh = new THREE.Mesh(bgGeo, bgMat);
      bgMesh.frustumCulled = false;
      bgMesh.renderOrder = -1;
      scene.add(bgMesh);

      const group = new THREE.Group();
      scene.add(group);

      const uniforms = {
        uTime: { value: 0 },
        uForm: { value: reduced ? 1 : 0 },
        uFlip: { value: 0 },
        uSpin: { value: 0 },
        uColorMix: { value: reduced ? 1 : 0 },
        uScatter: { value: 0 },
        uMouse: { value: new THREE.Vector2(999, 999) },
        uAmp: { value: 1.1 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
      });

      let mesh: THREE_NS.Mesh | null = null;

      // Group placement, set in layout(). The brain and the text SWAP sides as you
      // scroll: brain starts RIGHT (startX) and ends LEFT (endX) while the text
      // travels the other way. Pointer parallax is added on top each frame so
      // neither feeds back into the base position.
      let startX = 0; // brain on the RIGHT to start
      let endX = 0; // brain on the LEFT after the swap
      let baseY = 0;
      let brainX = 0; // current interpolated base X (no parallax)
      let scrollShift = 0;
      let baseRadius = 1; // group scale before the transition growth
      let isNarrow = false; // mobile: brain stays centred, no growth offset
      let growT = 0; // 0..1 growth driven through the swap

      // --- Post-processing: linear render → bloom → FXAA → ACES/sRGB out. ---
      const dbSize = renderer.getDrawingBufferSize(new THREE.Vector2());
      const renderTarget = new THREE.WebGLRenderTarget(dbSize.x, dbSize.y, {
        type: THREE.HalfFloatType,
        samples: 4,
      });
      const composer = new EffectComposer(renderer, renderTarget);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(dbSize.x, dbSize.y),
        0.16, // strength — light glow keeps shards crisp/separated, not blurred
        0.5, // radius
        0.58 // threshold (luminance) — only the brightest shards glow, dala-style
      );
      composer.addPass(bloom);
      const fxaa = new ShaderPass(FXAAShader);
      composer.addPass(fxaa);
      composer.addPass(new OutputPass());

      const layout = () => {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        bloom.setSize(w * dpr, h * dpr);
        fxaa.material.uniforms["resolution"].value.set(1 / (w * dpr), 1 / (h * dpr));
        bgUniforms.uAspect.value.set(w >= h ? w / h : 1, w >= h ? 1 : h / w);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const halfW = halfH * camera.aspect;
        const narrow = w < 760;
        isNarrow = narrow;
        // BASE size (before growth). Kept a touch smaller than the viewport so the
        // brain can GROW through the swap and still keep its margin (the outer edge
        // is anchored in tick → margin stays constant as it scales up).
        const radius = narrow ? Math.min(halfW * 0.86, halfH * 0.82) : halfH * 0.82;
        baseRadius = radius;
        group.scale.setScalar(radius);
        startX = narrow ? 0 : halfW * 0.44; // brain on the RIGHT to start
        endX = narrow ? 0 : -halfW * 0.44; // brain on the LEFT after the swap
        baseY = narrow ? halfH * 0.04 : 0;
        group.position.y = baseY;
      };

      const loader = new GLTFLoader();
      loader.load("/models/brain.glb", async (gltf) => {
        if (disposed) return;
        gltf.scene.updateMatrixWorld(true);

        // Collect EVERY mesh, bake each one's world transform into its verts, and
        // concatenate into parallel buffers. Robust to multi-mesh models AND node
        // transforms — so ANY brain .glb dropped in at /models/brain.glb resamples
        // correctly (e.g. a different Sketchfab/Poly model), not just this one.
        // Alongside POSITION we carry NORMAL, TANGENT and TEXCOORD_0 so the brain's
        // surface FOLD detail (gyri/sulci — which live in the model's normal map, NOT
        // its low-poly geometry) can be baked per facet for the relief lighting below.
        const posChunks: Float32Array[] = [];
        const nrmChunks: Float32Array[] = [];
        const uvChunks: Float32Array[] = [];
        const tanChunks: Float32Array[] = [];
        let hasNrm = true;
        let hasUV = true;
        let hasTan = true;
        let vtot = 0;
        const tmpV = new THREE.Vector3();
        const nrmMat = new THREE.Matrix3();
        gltf.scene.traverse((o) => {
          const m = o as THREE_NS.Mesh;
          if (!m.isMesh || !m.geometry) return;
          const ng = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
          const p = ng.attributes.position;
          const nA = ng.attributes.normal;
          const uA = ng.attributes.uv;
          const tA = ng.attributes.tangent;
          nrmMat.getNormalMatrix(m.matrixWorld);
          const pa = new Float32Array(p.count * 3);
          for (let i = 0; i < p.count; i++) {
            tmpV.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m.matrixWorld);
            pa[i * 3] = tmpV.x;
            pa[i * 3 + 1] = tmpV.y;
            pa[i * 3 + 2] = tmpV.z;
          }
          posChunks.push(pa);
          if (nA) {
            const na = new Float32Array(p.count * 3);
            for (let i = 0; i < p.count; i++) {
              tmpV.set(nA.getX(i), nA.getY(i), nA.getZ(i)).applyMatrix3(nrmMat).normalize();
              na[i * 3] = tmpV.x;
              na[i * 3 + 1] = tmpV.y;
              na[i * 3 + 2] = tmpV.z;
            }
            nrmChunks.push(na);
          } else hasNrm = false;
          if (uA) {
            const ua = new Float32Array(p.count * 2);
            for (let i = 0; i < p.count; i++) {
              ua[i * 2] = uA.getX(i);
              ua[i * 2 + 1] = uA.getY(i);
            }
            uvChunks.push(ua);
          } else hasUV = false;
          if (tA) {
            const ta = new Float32Array(p.count * 4);
            for (let i = 0; i < p.count; i++) {
              tmpV.set(tA.getX(i), tA.getY(i), tA.getZ(i)).applyMatrix3(nrmMat).normalize();
              ta[i * 4] = tmpV.x;
              ta[i * 4 + 1] = tmpV.y;
              ta[i * 4 + 2] = tmpV.z;
              ta[i * 4 + 3] = tA.getW(i) || 1;
            }
            tanChunks.push(ta);
          } else hasTan = false;
          vtot += p.count;
          if (ng !== m.geometry) ng.dispose();
        });
        if (vtot === 0) return;

        // The brain's OWN surface is the particle source. Walk every face once to
        // build an area table, then draw TARGET_COUNT samples weighted by face area
        // so facets land EVENLY across the shell — independent of the mesh's uneven
        // tessellation. Even + sparse spacing is what makes the profile read.
        const posArr = new Float32Array(vtot * 3);
        for (let off = 0, k = 0; k < posChunks.length; k++) {
          posArr.set(posChunks[k], off);
          off += posChunks[k].length;
        }
        const nrmArr = hasNrm ? new Float32Array(vtot * 3) : null;
        if (nrmArr)
          for (let off = 0, k = 0; k < nrmChunks.length; k++) {
            nrmArr.set(nrmChunks[k], off);
            off += nrmChunks[k].length;
          }
        const uvArr = hasUV ? new Float32Array(vtot * 2) : null;
        if (uvArr)
          for (let off = 0, k = 0; k < uvChunks.length; k++) {
            uvArr.set(uvChunks[k], off);
            off += uvChunks[k].length;
          }
        const tanArr = hasTan ? new Float32Array(vtot * 4) : null;
        if (tanArr)
          for (let off = 0, k = 0; k < tanChunks.length; k++) {
            tanArr.set(tanChunks[k], off);
            off += tanChunks[k].length;
          }
        const faceCount = Math.floor(posArr.length / 9);

        // Decode the model's NORMAL + DIFFUSE textures to CPU pixel buffers so the
        // surface fold detail can be baked per sampled point (the gyri/sulci are
        // painted into these maps, not the geometry). getDependency loads textures by
        // index regardless of material wiring — needed here because this model uses
        // the legacy KHR_materials_pbrSpecularGlossiness ext, so the diffuse is never
        // auto-assigned to material.map. Indices per the GLB: 0 = diffuse, 2 = normal.
        // Any missing piece (texture/UV/tangent) degrades gracefully to geometry-only.
        const decode = (tex: THREE_NS.Texture | null) => {
          const img = tex?.image as (CanvasImageSource & { width: number; height: number }) | undefined;
          if (!img || !img.width) return null;
          const cv = document.createElement("canvas");
          cv.width = img.width;
          cv.height = img.height;
          const cx = cv.getContext("2d", { willReadFrequently: true });
          if (!cx) return null;
          cx.drawImage(img, 0, 0);
          return { d: cx.getImageData(0, 0, img.width, img.height).data, w: img.width, h: img.height };
        };
        const getTex = async (i: number) => {
          try {
            return (await gltf.parser.getDependency("texture", i)) as THREE_NS.Texture;
          } catch {
            return null;
          }
        };
        const [nrmTex, difTex] = await Promise.all([getTex(2), getTex(0)]);
        if (disposed) return;
        const NMAP = hasUV && hasTan && hasNrm ? decode(nrmTex) : null;
        const DMAP = hasUV ? decode(difTex) : null;
        type PixMap = { d: Uint8ClampedArray; w: number; h: number };
        // Bilinear sample → [0,1] rgb into `out`. UVs follow glTF convention (origin
        // top-left, matching canvas getImageData rows) so no V flip is needed.
        const sampleTex = (map: PixMap, u: number, v: number, out: number[]) => {
          u -= Math.floor(u);
          v -= Math.floor(v);
          const x = u * (map.w - 1);
          const y = v * (map.h - 1);
          const x0 = x | 0;
          const y0 = y | 0;
          const x1 = x0 + 1 < map.w ? x0 + 1 : x0;
          const y1 = y0 + 1 < map.h ? y0 + 1 : y0;
          const fx = x - x0;
          const fy = y - y0;
          const i00 = (y0 * map.w + x0) * 4;
          const i10 = (y0 * map.w + x1) * 4;
          const i01 = (y1 * map.w + x0) * 4;
          const i11 = (y1 * map.w + x1) * 4;
          for (let c = 0; c < 3; c++) {
            const top = map.d[i00 + c] * (1 - fx) + map.d[i10 + c] * fx;
            const bot = map.d[i01 + c] * (1 - fx) + map.d[i11 + c] * fx;
            out[c] = (top * (1 - fy) + bot * fy) / 255;
          }
        };

        // Cumulative face-area table → weighted face picking via binary search.
        const cumArea = new Float32Array(faceCount + 1);
        const e1 = new THREE.Vector3();
        const e2 = new THREE.Vector3();
        let totalArea = 0;
        for (let f = 0; f < faceCount; f++) {
          const o = f * 9;
          e1.set(posArr[o + 3] - posArr[o], posArr[o + 4] - posArr[o + 1], posArr[o + 5] - posArr[o + 2]);
          e2.set(posArr[o + 6] - posArr[o], posArr[o + 7] - posArr[o + 1], posArr[o + 8] - posArr[o + 2]);
          cumArea[f] = totalArea;
          totalArea += e1.cross(e2).length() * 0.5;
        }
        cumArea[faceCount] = totalArea;
        const pickFace = (u: number) => {
          let lo = 0;
          let hi = faceCount - 1;
          const t = u * totalArea;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cumArea[mid + 1] <= t) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        };

        const pts: number[] = [];
        const nrmDetail: number[] = []; // per-point surface normal WITH baked fold detail (model space)
        const lums: number[] = []; // per-point diffuse luminance (painted fold contrast)
        const cc = new THREE.Vector3();
        const texRGB = [0, 0, 0];
        for (let i = 0; i < TARGET_COUNT; i++) {
          const f = pickFace(Math.random());
          const o = f * 9;
          let a = Math.random();
          let b = Math.random();
          if (a + b > 1) {
            a = 1 - a;
            b = 1 - b;
          }
          const w0 = 1 - a - b; // barycentric weight of corner 0
          const x = posArr[o] + a * (posArr[o + 3] - posArr[o]) + b * (posArr[o + 6] - posArr[o]);
          const y = posArr[o + 1] + a * (posArr[o + 4] - posArr[o + 1]) + b * (posArr[o + 7] - posArr[o + 1]);
          const z = posArr[o + 2] + a * (posArr[o + 5] - posArr[o + 2]) + b * (posArr[o + 8] - posArr[o + 2]);
          pts.push(x, y, z);
          cc.x += x;
          cc.y += y;
          cc.z += z;

          // Interpolated geometry normal at this point (smooth, low-frequency).
          let gnx = 0;
          let gny = 0;
          let gnz = 1;
          if (nrmArr) {
            gnx = w0 * nrmArr[o] + a * nrmArr[o + 3] + b * nrmArr[o + 6];
            gny = w0 * nrmArr[o + 1] + a * nrmArr[o + 4] + b * nrmArr[o + 7];
            gnz = w0 * nrmArr[o + 2] + a * nrmArr[o + 5] + b * nrmArr[o + 8];
            const gl = Math.hypot(gnx, gny, gnz) || 1;
            gnx /= gl;
            gny /= gl;
            gnz /= gl;
          }
          let nx = gnx;
          let ny = gny;
          let nz = gnz;
          // Perturb the geometry normal by the NORMAL MAP (tangent space → world via
          // the interpolated TBN) so each facet carries the brain's fine gyri/sulci.
          if (NMAP && uvArr && tanArr) {
            const uo = f * 6;
            const uu = w0 * uvArr[uo] + a * uvArr[uo + 2] + b * uvArr[uo + 4];
            const vv = w0 * uvArr[uo + 1] + a * uvArr[uo + 3] + b * uvArr[uo + 5];
            const to = f * 12;
            let tx = w0 * tanArr[to] + a * tanArr[to + 4] + b * tanArr[to + 8];
            let ty = w0 * tanArr[to + 1] + a * tanArr[to + 5] + b * tanArr[to + 9];
            let tz = w0 * tanArr[to + 2] + a * tanArr[to + 6] + b * tanArr[to + 10];
            const tw = tanArr[to + 3] < 0 ? -1 : 1;
            // Gram–Schmidt: orthonormalise T against N, then B = (N × T) · handedness.
            const dNT = gnx * tx + gny * ty + gnz * tz;
            tx -= gnx * dNT;
            ty -= gny * dNT;
            tz -= gnz * dNT;
            const tl = Math.hypot(tx, ty, tz) || 1;
            tx /= tl;
            ty /= tl;
            tz /= tl;
            const bx = (gny * tz - gnz * ty) * tw;
            const by = (gnz * tx - gnx * tz) * tw;
            const bz = (gnx * ty - gny * tx) * tw;
            sampleTex(NMAP, uu, vv, texRGB);
            const sx = texRGB[0] * 2 - 1;
            const sy = (texRGB[1] * 2 - 1) * NORMAL_GREEN;
            const sz = texRGB[2] * 2 - 1;
            const pnx = tx * sx + bx * sy + gnx * sz;
            const pny = ty * sx + by * sy + gny * sz;
            const pnz = tz * sx + bz * sy + gnz * sz;
            const pl = Math.hypot(pnx, pny, pnz) || 1;
            // Blend back toward the geometry normal so the relief reads as folds, not
            // per-facet sparkle (NORMAL_STRENGTH = 1 → full map detail).
            nx = gnx + (pnx / pl - gnx) * NORMAL_STRENGTH;
            ny = gny + (pny / pl - gny) * NORMAL_STRENGTH;
            nz = gnz + (pnz / pl - gnz) * NORMAL_STRENGTH;
            const fl = Math.hypot(nx, ny, nz) || 1;
            nx /= fl;
            ny /= fl;
            nz /= fl;
          }
          nrmDetail.push(nx, ny, nz);

          let lum = 0.5;
          if (DMAP && uvArr) {
            const uo = f * 6;
            const uu = w0 * uvArr[uo] + a * uvArr[uo + 2] + b * uvArr[uo + 4];
            const vv = w0 * uvArr[uo + 1] + a * uvArr[uo + 3] + b * uvArr[uo + 5];
            sampleTex(DMAP, uu, vv, texRGB);
            lum = 0.299 * texRGB[0] + 0.587 * texRGB[1] + 0.114 * texRGB[2];
          }
          lums.push(lum);
        }
        const ptCount = pts.length / 3;
        cc.multiplyScalar(1 / ptCount);

        // Centre, then orient to a PROFILE view. glTF is authored Y-up (this
        // model sits on the ground plane, min Y ≈ 0), so KEEP Y as vertical and
        // view down the SHORTER horizontal axis — the wider front-back silhouette
        // then faces the camera (the classic brain profile + stem at the bottom),
        // instead of a round face-on or top-down blob. Robust to any Y-up model.
        const min = [Infinity, Infinity, Infinity];
        const max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < ptCount; i++) {
          for (let c = 0; c < 3; c++) {
            const v = pts[i * 3 + c] - (c === 0 ? cc.x : c === 1 ? cc.y : cc.z);
            if (v < min[c]) min[c] = v;
            if (v > max[c]) max[c] = v;
          }
        }
        const ext = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
        // PROFILE view, derived purely from extents so it's robust to whatever
        // orientation the model was authored in (never top-down / "facing top"):
        // look down the NARROWEST extent (left–right), put the LONGEST extent
        // horizontal (front–back length) and the MIDDLE extent vertical (height).
        const order = [0, 1, 2].sort((a, b) => ext[b] - ext[a]);
        const aX = order[0]; // longest extent  → screen horizontal
        const aY = order[1]; // middle extent   → screen vertical
        const aZ = order[2]; // shortest extent → view (depth) axis
        const cArr = [cc.x, cc.y, cc.z];

        let maxR = 1e-5;
        for (let i = 0; i < ptCount; i++) {
          maxR = Math.max(
            maxR,
            Math.hypot(pts[i * 3] - cc.x, pts[i * 3 + 1] - cc.y, pts[i * 3 + 2] - cc.z)
          );
        }

        const palette = BRAND_HEX.map((hx) => new THREE.Color(hx).convertSRGBToLinear());

        const tri = makeTetra();
        const offsets = new Float32Array(ptCount * 3);
        const normals = new Float32Array(ptCount * 3);
        const lumArr = new Float32Array(ptCount);
        const scatter = new Float32Array(ptCount * 3);
        const random = new Float32Array(ptCount * 3);
        const colors = new Float32Array(ptCount * 3);
        for (let i = 0; i < ptCount; i++) {
          // Reorient to profile via the extent-derived axis permutation.
          offsets[i * 3] = (pts[i * 3 + aX] - cArr[aX]) / maxR;
          offsets[i * 3 + 1] = (pts[i * 3 + aY] - cArr[aY]) / maxR;
          offsets[i * 3 + 2] = (pts[i * 3 + aZ] - cArr[aZ]) / maxR;
          // Reorient the baked fold-normal with the SAME axis permutation (it's a
          // direction → permute components, no centering/scale). Fall back to the
          // radial direction if the model carried no usable normals.
          let nX = nrmDetail[i * 3 + aX];
          let nY = nrmDetail[i * 3 + aY];
          let nZ = nrmDetail[i * 3 + aZ];
          if (!hasNrm) {
            nX = offsets[i * 3];
            nY = offsets[i * 3 + 1];
            nZ = offsets[i * 3 + 2];
          }
          const nl = Math.hypot(nX, nY, nZ) || 1;
          normals[i * 3] = nX / nl;
          normals[i * 3 + 1] = nY / nl;
          normals[i * 3 + 2] = nZ / nl;
          lumArr[i] = lums[i];
          // Scatter target = a WIDE field with real, but BOUNDED, depth (dala-style):
          // a broad disc in X/Y plus a controlled Z range so there's a clear sense of
          // foreground vs background (perspective parallax) — without any shard coming
          // so close to the lens that it balloons. The near bound (+1.4) sits well in
          // front of the camera plane (z=5 after the group scale) so the biggest ones
          // read as foreground, not giants.
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.sqrt(Math.random()) * 4.1; // wider field → more air between shards
          scatter[i * 3] = Math.cos(ang) * rad * 1.7; // wider in X to fill the frame
          scatter[i * 3 + 1] = Math.sin(ang) * rad;
          scatter[i * 3 + 2] = (Math.random() - 0.5) * 4.8 - 0.2; // deeper Z spread for parallax
          random[i * 3] = Math.random();
          random[i * 3 + 1] = Math.random();
          random[i * 3 + 2] = Math.random();
          const col = palette[(Math.random() * palette.length) | 0];
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }

        const ibg = new THREE.InstancedBufferGeometry();
        ibg.setAttribute("position", new THREE.BufferAttribute(tri, 3));
        ibg.setAttribute("aBary", new THREE.BufferAttribute(BARY, 3));
        ibg.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
        ibg.setAttribute("aNormal", new THREE.InstancedBufferAttribute(normals, 3));
        ibg.setAttribute("aLum", new THREE.InstancedBufferAttribute(lumArr, 1));
        ibg.setAttribute("aScatter", new THREE.InstancedBufferAttribute(scatter, 3));
        ibg.setAttribute("aRandom", new THREE.InstancedBufferAttribute(random, 3));
        ibg.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
        ibg.instanceCount = ptCount;

        mesh = new THREE.Mesh(ibg, material);
        mesh.frustumCulled = false;
        group.add(mesh);

        layout();
      });

      // Pointer → smoothed group-local world XY (scatter) + normalised parallax.
      const mouseTarget = new THREE.Vector2(999, 999);
      let pxTarget = 0;
      let pyTarget = 0;
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const halfW = halfH * camera.aspect;
        mouseTarget.set(
          (ndcX * halfW - brainX) / group.scale.x,
          (ndcY * halfH - baseY) / group.scale.x
        );
        pxTarget = ndcX;
        pyTarget = ndcY;
      };
      window.addEventListener("pointermove", onMove);

      layout();
      const ro = new ResizeObserver(() => layout());
      ro.observe(canvas);

      let raf = 0;
      let last = performance.now();
      let parX = 0;
      let parY = 0;
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        uniforms.uTime.value += dt;
        // No auto-rotation — the brain stays FIXED in its side-profile pose. Depth
        // instead comes from a pointer PARALLAX: the group tilts and shifts subtly
        // to follow the cursor, so it reads as 3D without spinning off profile.
        parX += (pxTarget - parX) * 0.05;
        parY += (pyTarget - parY) * 0.05;
        // Brain GROWS through the swap (the "lost" brain blooms into the bigger,
        // colourful "thinker" brain). Its OUTER edge is anchored: as it scales up,
        // the centre eases inward by exactly what it gained, so the margin to the
        // viewport side never changes — it grows in place, it doesn't drift off.
        const g = isNarrow ? 1 : 1 + 0.12 * growT;
        group.scale.setScalar(baseRadius * g);
        const grow = isNarrow ? 0 : baseRadius * (g - 1);
        const sx = startX - grow; // right anchor pulled inward as it grows
        const ex = endX + grow; // left anchor pulled inward as it grows
        // Ease the brain across only when the swap window opens (held until ~0.5).
        // It then scatters IN PLACE — no recentring — so at the final transition it
        // never slides back toward the middle; the field disperses where the brain sat.
        const targetX = sx + (ex - sx) * scrollShift;
        brainX += (targetX - brainX) * 0.09;
        // Ease the pointer parallax DOWN as the field scatters — once dispersed the
        // closing CTA leads, so the cloud should drift only faintly behind it.
        const par = 1 - 0.8 * (uniforms.uScatter.value as number);
        group.position.x = brainX + parX * 0.12 * par;
        group.position.y = baseY + parY * 0.12 * par;
        group.rotation.y = parX * 0.16 * par;
        group.rotation.x = -parY * 0.12 * par;
        (uniforms.uMouse.value as THREE_NS.Vector2).lerp(mouseTarget, 0.08);
        composer.render();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // Scroll choreography.
      let st: ScrollTrigger | null = null;
      if (reduced) {
        setPhase(1);
      } else {
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=460%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const p = self.progress;
            // Smoother assemble + dissolve (smootherstep over slightly wider windows).
            uniforms.uForm.value = smoother(0, 0.40, p);
            const flipT = clamp01((p - 0.52) / (0.78 - 0.52));
            uniforms.uFlip.value = flipT * Math.PI;
            uniforms.uColorMix.value = smooth(0.58, 0.7, p);
            uniforms.uScatter.value = smoother(0.80, 0.93, p);
            // The brain HOLDS its side until the copy hands off (~0.5), then swaps
            // sides in step with the text cross-fade and GROWS — they switch
            // position together rather than the brain drifting across early.
            scrollShift = smoother(0.42, 0.6, p);
            growT = smoother(0.4, 0.62, p);
            const ph = p < 0.5 ? 0 : 1;
            setPhase((prev) => (prev === ph ? prev : ph));
            // Once the brain has scattered, the brain copy fades OUT and the closing
            // CTA fades IN over the dispersed cloud of shapes.
            const e = p > 0.9;
            setEnded((prev) => (prev === e ? prev : e));
          },
        });
      }

      cleanupGL = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        st?.kill();
        material.dispose();
        bgGeo.dispose();
        bgMat.dispose();
        mesh?.geometry.dispose();
        composer.dispose();
        renderTarget.dispose();
        renderer.dispose();
      };
    })();

    // Signature wordmark: a slow vertical float keeps the copy alive (no glass box).
    const ctxGsap = gsap.context(() => {
      if (textRef.current && !reduced) {
        gsap.to(textRef.current, {
          y: -10,
          duration: 5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, section);

    return () => {
      disposed = true;
      cleanupGL?.();
      ctxGsap.revert();
    };
  }, [reduced]);

  // Luxurious blur cross-fade: inactive copy sits blurred + lifted + transparent,
  // and resolves to crisp/opaque over a slow editorial curve when it becomes active.
  const fade = (active: boolean): CSSProperties => ({
    opacity: active ? 1 : 0,
    filter: active ? "blur(0px)" : "blur(16px)",
    transform: active ? "translateY(0)" : "translateY(14px)",
    transition:
      "opacity 1.2s cubic-bezier(0.16,1,0.3,1), filter 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)",
  });

  return (
    <section
      ref={sectionRef}
      id="mind-reveal"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: VOID }}
      aria-label="AQLUMA — l'esprit"
    >
      {/* Instanced wireframe brain (Three.js) — backdrop + bloom composited in-GL. */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Edge vignette: pure CSS, focuses attention on the brain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 60% 50%, rgba(8,10,12,0) 54%, rgba(8,10,12,0.6) 100%)",
        }}
      />

      {/* The brain swaps RIGHT → LEFT on scroll. The copy does NOT slide across:
          the "lost" state fades OUT on the left and the "thinker" state fades IN
          on the right, so the two trajectories hand off without travelling. */}
      <div ref={textRef} className="pointer-events-none absolute inset-0 z-10 will-change-transform">
        {/* Phase 0 — the lost adolescent, anchored LEFT (brain sits right). */}
        <div
          className="absolute inset-y-0 left-0 flex w-full flex-col justify-center px-[min(7vw,5.5rem)] md:w-[46%]"
          style={fade(phase === 0 && !ended)}
        >
          <h2 className="font-didot text-[clamp(3rem,7vw,6.75rem)] font-normal leading-[0.92] tracking-display text-cream">
            AQLUMA
          </h2>
          <p className="mt-3 font-satoshi text-[clamp(1.05rem,1.7vw,1.5rem)] font-medium leading-snug text-cream/65">
            {LEAD}
          </p>
          <p className="mt-9 max-w-[36ch] font-satoshi text-[clamp(1rem,1.55vw,1.35rem)] leading-relaxed text-cream/80">
            {LOST}
          </p>
        </div>

        {/* Phase 1 — the mind that thinks WITH the AI, anchored RIGHT
            (brain has slid to the left). */}
        <div
          className="absolute inset-y-0 right-0 flex w-full flex-col justify-center px-[min(7vw,5.5rem)] md:w-[46%]"
          style={fade(phase === 1 && !ended)}
        >
          <h2 className="font-didot text-[clamp(3rem,7vw,6.75rem)] font-normal leading-[0.92] tracking-display text-cream">
            AQLUMA
          </h2>
          <p className="mt-3 font-satoshi text-[clamp(1.05rem,1.7vw,1.5rem)] font-medium leading-snug text-cream/65">
            {LEAD}
          </p>
          <p className="mt-9 max-w-[36ch] font-satoshi text-[clamp(1rem,1.55vw,1.35rem)] leading-relaxed text-cream/90">
            {THINKER}
          </p>
        </div>
      </div>

      {/* Closing CTA — after the brain scatters, this fades in CENTRED over the
          dispersed cloud of shapes: one Satoshi line + two rectangular buttons
          (gold + cream, black text). Buttons are click-through-disabled until it
          actually arrives. */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        style={{ ...fade(ended), pointerEvents: ended ? "auto" : "none" }}
      >
        <p className="max-w-[26ch] font-satoshi text-[clamp(1.5rem,3.2vw,2.6rem)] font-medium leading-snug text-cream">
          Qu’attendez-vous ? Rejoignez notre programme.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#briefing"
            className="rounded-[10px] bg-gold px-8 py-4 font-satoshi text-[13px] font-semibold uppercase tracking-[0.16em] text-void transition-colors duration-300 hover:bg-[#f3c45e]"
          >
            Voir le programme
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("aqluma:contact"))}
            className="rounded-[10px] bg-cream px-8 py-4 font-satoshi text-[13px] font-semibold uppercase tracking-[0.16em] text-void transition-colors duration-300 hover:bg-white"
          >
            Contactez-nous
          </button>
        </div>
      </div>
    </section>
  );
}
