"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * PHASE 4.5 — L'esprit (the reveal after the Musée panorama).
 *
 * dala's actual technique, rebuilt: a CC0/CC-BY brain mesh (Poly by Google) is
 * surface-sampled into thousands of instanced POLYGON facets (little triangles),
 * each tumbled by a simplex-noise rotation in the vertex shader and nudged by the
 * pointer — the "premium polygons particles" look. Three.js, instanced shader.
 *
 * Scroll (one pinned timeline, progress 0→1):
 *   · 0.00–0.34  facets fly in from a scatter cloud and ASSEMBLE into the brain
 *   · 0.34–0.52  hold — the white brain breathes/tumbles
 *   · 0.52–0.78  a cinematic Y-axis FLIP; mid-flip the facets recolour to the
 *                 AQLUMA brand mix
 *   · 0.78–1.00  hold — the colourful brain
 * Caption advances in step. Left: frosted-glass 3D AQLUMA (air.inc treatment).
 *
 * Reduced motion: static colourful brain + final caption (gentle idle tumble).
 *
 * Model: "Brain" by Poly by Google (CC-BY) via Poly Pizza — /public/models/brain.glb
 */

const VOID = "#080A0C";
const PARTICLE_COUNT = 12000;

// AQLUMA brand mix for the colourful brain (sRGB; converted to linear at build).
const BRAND_HEX = [0xe8b23a, 0xc8662f, 0x8052ff, 0x15846e, 0xf7f4ef];

const BEATS = [
  "Aqluma accompagne votre adolescent.",
  "D’un esprit qui recopie les réponses…",
  "…à un esprit qui pense avec l’IA.",
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uForm;      // 0..1 assemble
  uniform float uFlip;      // 0..PI flip angle (Y)
  uniform float uColorMix;  // 0..1 white -> brand colour
  uniform vec2  uMouse;     // pointer in group-local world XY
  uniform float uAmp;

  attribute vec3 aOffset;   // brain-surface position (normalised, r~1)
  attribute vec3 aScatter;  // fly-in origin
  attribute vec3 aRandom;   // per-facet seeds
  attribute vec3 aColor;    // per-facet brand colour (linear)

  varying vec3 vColor;
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

  mat3 rot3(vec3 axis, float a){
    axis=normalize(axis); float s=sin(a), c=cos(a), o=1.0-c;
    return mat3(
      o*axis.x*axis.x+c,        o*axis.x*axis.y-axis.z*s, o*axis.z*axis.x+axis.y*s,
      o*axis.x*axis.y+axis.z*s, o*axis.y*axis.y+c,        o*axis.y*axis.z-axis.x*s,
      o*axis.z*axis.x-axis.y*s, o*axis.y*axis.z+axis.x*s, o*axis.z*axis.z+c
    );
  }

  void main(){
    float form = smoothstep(0.0, 1.0, uForm);
    vec3 center = mix(aScatter, aOffset, form);

    // Cinematic Y-axis flip of the whole cloud.
    float ca=cos(uFlip), sa=sin(uFlip);
    center = vec3(ca*center.x + sa*center.z, center.y, -sa*center.x + ca*center.z);

    // Pointer repulsion in the view plane.
    vec2 toM = center.xy - uMouse;
    float md = dot(toM,toM);
    center.xy += normalize(toM + 0.0001) * (0.22 / (1.0 + md*9.0)) * form;

    // Tumble each facet by a noise-driven rotation (the dala move).
    float n = snoise(center * uAmp + uTime * 0.12);
    mat3 r = rot3(vec3(1.0,0.55,1.0) + aRandom, n * 3.14159 + uTime * (0.2 + aRandom.x*0.5));
    float s = (0.55 + aRandom.y * 0.95) * mix(0.25, 1.0, form);
    vec3 finalPos = center + r * (position * s);

    vColor = mix(vec3(0.95,0.94,0.92), aColor, uColorMix);
    vFade  = (0.35 + 0.65*form);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vFade;
  void main(){
    gl_FragColor = vec4(vColor, vFade);
  }
`;

export default function MindReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slabRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(0);

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
      const { MeshSurfaceSampler } = await import(
        "three/examples/jsm/math/MeshSurfaceSampler.js"
      );
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      const group = new THREE.Group();
      scene.add(group);

      const uniforms = {
        uTime: { value: 0 },
        uForm: { value: reduced ? 1 : 0 },
        uFlip: { value: 0 },
        uColorMix: { value: reduced ? 1 : 0 },
        uMouse: { value: new THREE.Vector2(999, 999) },
        uAmp: { value: 0.9 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      let mesh: THREE_NS.Mesh | null = null;

      const layout = () => {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const halfW = halfH * camera.aspect;
        const narrow = w < 760;
        const radius = narrow ? Math.min(halfW * 0.82, halfH * 0.78) : halfH * 0.74;
        group.scale.setScalar(radius);
        group.position.x = narrow ? 0 : halfW * 0.32;
        group.position.y = narrow ? halfH * 0.04 : 0;
      };

      const loader = new GLTFLoader();
      loader.load("/models/brain.glb", (gltf) => {
        if (disposed) return;
        let src: THREE_NS.Mesh | null = null;
        gltf.scene.traverse((o) => {
          if (!src && (o as THREE_NS.Mesh).isMesh) src = o as THREE_NS.Mesh;
        });
        if (!src) return;

        // Surface-sample the brain → instanced facet cloud.
        const sampler = new MeshSurfaceSampler(src).build();
        const pos = new THREE.Vector3();
        const offsets = new Float32Array(PARTICLE_COUNT * 3);
        const scatter = new Float32Array(PARTICLE_COUNT * 3);
        const random = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);

        // First pass: sample + accumulate centroid/extent for normalisation.
        const raw: number[] = [];
        const c = new THREE.Vector3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          sampler.sample(pos);
          raw.push(pos.x, pos.y, pos.z);
          c.add(pos);
        }
        c.multiplyScalar(1 / PARTICLE_COUNT);
        let maxR = 1e-5;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const dx = raw[i * 3] - c.x;
          const dy = raw[i * 3 + 1] - c.y;
          const dz = raw[i * 3 + 2] - c.z;
          maxR = Math.max(maxR, Math.hypot(dx, dy, dz));
        }
        const palette = BRAND_HEX.map((hx) => new THREE.Color(hx).convertSRGBToLinear());
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const nx = (raw[i * 3] - c.x) / maxR;
          const ny = (raw[i * 3 + 1] - c.y) / maxR;
          const nz = (raw[i * 3 + 2] - c.z) / maxR;
          offsets[i * 3] = nx;
          offsets[i * 3 + 1] = ny;
          offsets[i * 3 + 2] = nz;
          // scatter origin: random point in a larger shell
          const u = Math.random() * Math.PI * 2;
          const v = Math.acos(2 * Math.random() - 1);
          const rr = 1.7 + Math.random() * 1.1;
          scatter[i * 3] = Math.sin(v) * Math.cos(u) * rr;
          scatter[i * 3 + 1] = Math.cos(v) * rr;
          scatter[i * 3 + 2] = Math.sin(v) * Math.sin(u) * rr;
          random[i * 3] = Math.random();
          random[i * 3 + 1] = Math.random();
          random[i * 3 + 2] = Math.random();
          const col = palette[(Math.random() * palette.length) | 0];
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }

        // Base facet: a small triangle, instanced PARTICLE_COUNT times.
        const geo = new THREE.InstancedBufferGeometry();
        const tri = new Float32Array([0, 0.05, 0, 0.043, -0.025, 0, -0.043, -0.025, 0]);
        geo.setAttribute("position", new THREE.BufferAttribute(tri, 3));
        geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
        geo.setAttribute("aScatter", new THREE.InstancedBufferAttribute(scatter, 3));
        geo.setAttribute("aRandom", new THREE.InstancedBufferAttribute(random, 3));
        geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
        geo.instanceCount = PARTICLE_COUNT;

        mesh = new THREE.Mesh(geo, material);
        mesh.frustumCulled = false;
        group.add(mesh);
        layout();
      });

      // Pointer → smoothed group-local world XY.
      const mouseTarget = new THREE.Vector2(999, 999);
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const halfW = halfH * camera.aspect;
        // world XY, then into the group's local space (undo scale + offset).
        mouseTarget.set(
          (ndcX * halfW - group.position.x) / group.scale.x,
          (ndcY * halfH - group.position.y) / group.scale.x
        );
      };
      window.addEventListener("pointermove", onMove);

      layout();
      const ro = new ResizeObserver(() => layout());
      ro.observe(canvas);

      let raf = 0;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        uniforms.uTime.value += dt;
        (uniforms.uMouse.value as THREE_NS.Vector2).lerp(mouseTarget, 0.08);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // Scroll choreography.
      let st: ScrollTrigger | null = null;
      if (reduced) {
        setBeat(2);
      } else {
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const p = self.progress;
            uniforms.uForm.value = smooth(0, 0.34, p);
            const flipT = clamp01((p - 0.52) / (0.78 - 0.52));
            uniforms.uFlip.value = flipT * Math.PI;
            uniforms.uColorMix.value = smooth(0.58, 0.7, p);
            const b = p < 0.3 ? 0 : p < 0.52 ? 1 : 2;
            setBeat((prev) => (prev === b ? prev : b));
          },
        });
      }

      cleanupGL = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        st?.kill();
        material.dispose();
        mesh?.geometry.dispose();
        renderer.dispose();
      };
    })();

    // Frosted-glass wordmark: base tilt + slow float (air.inc treatment).
    const ctxGsap = gsap.context(() => {
      if (slabRef.current) {
        gsap.set(slabRef.current, { transformPerspective: 1000, rotationY: -16, rotationX: 7 });
        if (!reduced) {
          gsap.to(slabRef.current, {
            rotationY: -11,
            y: -12,
            duration: 4.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      }
    }, section);

    return () => {
      disposed = true;
      cleanupGL?.();
      ctxGsap.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="mind-reveal"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: VOID }}
      aria-label="AQLUMA — l’esprit"
    >
      {/* Soft dark gradient blobs behind the cloud (dala depth cue). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 50% at 68% 42%, rgba(20,9,51,0.55), rgba(8,10,12,0) 70%), radial-gradient(36% 46% at 60% 64%, rgba(4,41,33,0.5), rgba(8,10,12,0) 72%)",
        }}
      />

      {/* Instanced polygon brain (Three.js). */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Left-centre: frosted-glass 3D AQLUMA + the three-beat caption. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-full flex-col justify-center px-[min(7vw,5.5rem)] md:w-[46%]">
        <div ref={slabRef} className="will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          <div
            className="inline-flex items-center rounded-[14px] px-7 py-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(66,97,136,0.14) 60%, rgba(255,255,255,0.04) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 28px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <span className="font-didot text-[clamp(2.6rem,6vw,5.5rem)] font-normal leading-none tracking-display text-cream">
              AQLUMA
            </span>
          </div>
        </div>

        <div className="relative mt-9 h-[5.5rem]">
          {BEATS.map((line, i) => (
            <p
              key={i}
              className="absolute left-0 top-0 max-w-[26ch] font-didot text-[clamp(1.25rem,2.3vw,2rem)] leading-snug tracking-display text-cream/85 transition-opacity duration-700 ease-editorial"
              style={{ opacity: beat === i ? 1 : 0 }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
