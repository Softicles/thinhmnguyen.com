import { useRef, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Clouds, Cloud } from '@react-three/drei';
import { animate } from 'animejs';
import * as THREE from 'three';
import { computeSky, rgb, HORIZON_Y } from './skyModel';

// Max buffer sizes. The control panel's density slider renders only a SUBSET of
// these via geometry.setDrawRange — the buffers are allocated once and never
// rebuilt, so dragging the slider never churns geometry or DOM nodes.
const MAX_DENSITY_MULTIPLIER = 4;
const count = 500 * MAX_DENSITY_MULTIPLIER;
const rainCount = 1000 * MAX_DENSITY_MULTIPLIER;

// Deterministic PRNG (mulberry32). A fixed `seed` always yields the exact same
// sequence, so cloud + particle layouts are reproducible: persist the seed and
// the whole sky regenerates identically across navigation and page reloads.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2. Generate a round texture programmatically to round out the point squares
const dotTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
})();

// Slow, gentle flicker for the light particles. PointsMaterial is kept (so size
// attenuation, the round texture and fog behave exactly as before) and patched
// with a per-particle phase + speed: each mote breathes between ~40% and full
// brightness on its own 6–16s cycle, with a faint size swell in step. The
// flicker is applied after the alpha test, so the round cut-out never shimmers.
function patchTwinkle(shader, uniforms) {
  shader.uniforms.uTime = uniforms.uTime;
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
      attribute vec2 aTwinkle;
      uniform float uTime;
      varying float vTwinkle;`
    )
    .replace(
      'gl_PointSize = size;',
      `float tw = 0.5 + 0.5 * sin(uTime * aTwinkle.y + aTwinkle.x);
      tw = tw * 0.8 + 0.2 * (0.5 + 0.5 * sin(uTime * aTwinkle.y * 2.3 + aTwinkle.x * 1.7));
      vTwinkle = tw;
      gl_PointSize = size * (0.88 + 0.18 * tw);`
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying float vTwinkle;')
    .replace(
      '#include <alphatest_fragment>',
      `#include <alphatest_fragment>
      diffuseColor.a *= mix(0.4, 1.0, vTwinkle);`
    );
}

function MagicalSparkles({ active, density, color = '#fbbf24', seed = 1, sky }) {
  const pointsRef = useRef();
  const currentOpacity = useRef(active ? 1 - sky.current.model.night : 0);
  const twinkleUniforms = useRef({ uTime: { value: 0 } });

  const { particlesPosition, twinkle } = useMemo(() => {
    // Seeded so the spread is identical on every mount/reload.
    const rand = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (rand() - 0.5) * 40;
        positions[i * 3 + 1] = (rand() - 0.5) * 40;
        positions[i * 3 + 2] = (rand() - 0.5) * 40;
    }
    // Separate stream so adding the flicker doesn't reshuffle the layout.
    const tr = mulberry32(seed + 0x7f4a7c15);
    const twinkle = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
        twinkle[i * 2] = tr() * Math.PI * 2; // phase
        twinkle[i * 2 + 1] = 0.4 + tr() * 0.65; // rad/s → one cycle every ~6–16s
    }
    return { particlesPosition: positions, twinkle };
  }, [seed]);

  const onBeforeCompile = useCallback((shader) => patchTwinkle(shader, twinkleUniforms.current), []);

  useFrame((state, delta) => {
    twinkleUniforms.current.uTime.value = state.clock.elapsedTime;
    // Light particles are sunlight motes: they thin out at dusk and are gone
    // once it's fully dark.
    const targetOpacity = active ? 1 - sky.current.model.night : 0;
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, Math.min(delta, 1 / 30) * 3);
    if (pointsRef.current) {
        pointsRef.current.material.opacity = currentOpacity.current;
        // Show only `density` fraction of the particles — no geometry rebuild.
        const drawCount = Math.floor((count / MAX_DENSITY_MULTIPLIER) * density);
        pointsRef.current.geometry.setDrawRange(0, drawCount);
        // Gentle bounded drift (sine/cosine) so the field sways but never walks
        // off-centre — keeps the particles evenly spread no matter how long the
        // page stays open.
        const t = state.clock.elapsedTime;
        pointsRef.current.position.y = Math.sin(t * 0.1) * 1.5;
        pointsRef.current.position.x = Math.cos(t * 0.07) * 1.5;
        pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    // renderOrder + depthTest:false keeps the sparkles drawing on top of the
    // clouds so the light particles always float in front of them.
    <points ref={pointsRef} renderOrder={10}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particlesPosition} itemSize={3} />
        <bufferAttribute attach="attributes-aTwinkle" count={count} array={twinkle} itemSize={2} />
      </bufferGeometry>
      {/* We pass map={dotTexture} and alphaTest to cut off the hard square edges */}
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={currentOpacity.current}
        sizeAttenuation
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        map={dotTexture}
        alphaTest={0.5}
        onBeforeCompile={onBeforeCompile}
        customProgramCacheKey={() => 'sparkle-twinkle'}
      />
    </points>
  );
}

// Rain as hairline streaks (LineSegments), not point sprites. Each drop has its
// own depth, speed and length; the head is bright and the tail fades to
// nothing (per-vertex alpha), which reads as motion blur. A gusting wind slants
// every streak the same way, so the sheet of rain moves as one body of air.
const DROP_STRIDE = 7; // x, y, z, speed, length, halfWidth, halfHeight
const RAIN_TINT = [0.86, 0.9, 0.95];

function FallingRain({ active, density, seed = 1, sky }) {
  const linesRef = useRef();
  const currentOpacity = useRef(0);

  const { drops, positions, colors } = useMemo(() => {
    // Offset the seed so rain doesn't mirror the sparkle layout, but stays
    // deterministic across mounts/reloads.
    const rand = mulberry32(seed + 0x9e3779b9);
    const drops = new Float32Array(rainCount * DROP_STRIDE);
    const positions = new Float32Array(rainCount * 6);
    const colors = new Float32Array(rainCount * 8);
    const tanHalfFov = Math.tan((60 / 2) * (Math.PI / 180));
    for (let i = 0; i < rainCount; i++) {
      // Bias toward the far field: distant rain fills most of the frame, a few
      // drops pass close to the camera for parallax.
      const z = 4 - 22 * Math.sqrt(rand());
      const dist = 10 - z;
      const halfH = dist * tanHalfFov + 1.5;
      const halfW = halfH * 2.4;
      const speed = 12 + rand() * 7;
      const nearness = (z + 18) / 22; // 0 far → 1 near
      const o = i * DROP_STRIDE;
      drops[o] = (rand() - 0.5) * 2 * halfW;
      drops[o + 1] = (rand() - 0.5) * 2 * halfH;
      drops[o + 2] = z;
      drops[o + 3] = speed;
      drops[o + 4] = speed * (0.028 + rand() * 0.02);
      drops[o + 5] = halfW;
      drops[o + 6] = halfH;
      const alpha = (0.22 + nearness * 0.5) * (0.65 + rand() * 0.35);
      const c = i * 8;
      colors[c] = RAIN_TINT[0]; colors[c + 1] = RAIN_TINT[1]; colors[c + 2] = RAIN_TINT[2]; colors[c + 3] = alpha;
      colors[c + 4] = RAIN_TINT[0]; colors[c + 5] = RAIN_TINT[1]; colors[c + 6] = RAIN_TINT[2]; colors[c + 7] = 0;
    }
    return { drops, positions, colors };
  }, [seed]);

  useFrame((state, delta) => {
    // Clamp delta so a single frame can never jump too far. After the tab is
    // throttled or the machine sleeps, the first frame's delta is the whole
    // elapsed time (seconds). Without this clamp every drop falls past the wrap
    // threshold in one frame and resets to the same height, collapsing the rain
    // into one synchronized sheet.
    const dt = Math.min(delta, 1 / 30);
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, active ? 1 : 0, dt * 3);
    const lines = linesRef.current;
    if (!lines) return;

    // Rain stays visible after dark, just dimmer — it only catches stray light.
    const night = sky.current.model.night;
    lines.material.opacity = currentOpacity.current * THREE.MathUtils.lerp(1, 0.45, night);

    const drawCount = Math.floor((rainCount / MAX_DENSITY_MULTIPLIER) * density);
    lines.geometry.setDrawRange(0, drawCount * 2);
    lines.visible = currentOpacity.current > 0.005;
    // Keep the drops falling while they're active OR still fading out, so they
    // never freeze on screen mid-transition.
    if (!lines.visible) return;

    // Gusting wind: a slow swell plus a quicker flutter, shared by every drop.
    const t = state.clock.elapsedTime;
    const wind = 0.14 + Math.sin(t * 0.31) * 0.06 + Math.sin(t * 1.27 + 1.3) * 0.025;

    for (let i = 0; i < drawCount; i++) {
      const o = i * DROP_STRIDE;
      const speed = drops[o + 3];
      const halfW = drops[o + 5];
      const halfH = drops[o + 6];
      let x = drops[o] + speed * wind * dt;
      let y = drops[o + 1] - speed * dt;
      if (y < -halfH) y += 2 * halfH;
      if (x > halfW) x -= 2 * halfW;
      drops[o] = x;
      drops[o + 1] = y;

      const len = drops[o + 4];
      const z = drops[o + 2];
      const p = i * 6;
      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = z;
      positions[p + 3] = x - wind * len;
      positions[p + 4] = y + len;
      positions[p + 5] = z;
    }
    lines.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={rainCount * 2} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={rainCount * 2} array={colors} itemSize={4} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0} depthWrite={false} />
    </lineSegments>
  );
}

// Lights follow the sun: the key light sits where the sun is and warms as it
// sinks, the fill drops toward a cool moonlit blue after dark. Clouds are
// Lambert-shaded, so this is what turns them gold at sunset and grey at night.
const _warm = new THREE.Color();
const _night = new THREE.Color('#7f8fc4');
function SkyLights({ sky }) {
  const ambient = useRef();
  const key = useRef();
  useFrame(() => {
    const { model, rain } = sky.current;
    if (!ambient.current || !key.current) return;
    const { sun, night, warm, sunEdge } = model;

    const dayAmbient = THREE.MathUtils.lerp(1.0, 0.6, rain);
    const nightAmbient = THREE.MathUtils.lerp(0.34, 0.2, rain);
    ambient.current.intensity = THREE.MathUtils.lerp(dayAmbient * (1 - warm * 0.25), nightAmbient, night);
    _warm.setRGB(1, 1 - warm * 0.12, 1 - warm * 0.25);
    ambient.current.color.copy(_warm).lerp(_night, night);

    key.current.position.set(((sun.x - 50) / 50) * 25, ((HORIZON_Y - sun.y) / 82) * 22 - 2, 6);
    key.current.intensity = THREE.MathUtils.lerp(1.5, 0.4, rain) * (1 - night) * (1 + warm * 0.3);
    key.current.color.setRGB(sunEdge[0] / 255, sunEdge[1] / 255, sunEdge[2] / 255).lerp(_warm.set('#cbd5e1'), rain);
  });
  return (
    <>
      <ambientLight ref={ambient} intensity={1} />
      <directionalLight ref={key} position={[10, 10, 5]} intensity={1.5} />
    </>
  );
}

function VolumetricClouds({ density, whiteness, seed = 1 }) {
  // Whiteness fades the cloud colour from a muted grey to pure white.
    // Whiteness fades the cloud colour from a muted grey to pure white,
  // and artificially brightens them if whiteness > 1.
  const cloudColor = useMemo(() => {
    // 1. Blend up to pure white at a max of 1
    const color = new THREE.Color('#9aa3ad').lerp(
      new THREE.Color('#ffffff'), 
      Math.min(whiteness, 1) // Caps the lerp at 1
    );
    
    // 2. If the slider goes above 1, start over-driving the brightness!
    if (whiteness > 1) {
      color.multiplyScalar(whiteness);
    }
    
    // Return the raw THREE.Color so Drei interprets the glowing >1.0 levels
    return color; 
  }, [whiteness]);
  // Density controls how present the clouds feel (faint → thick) without
  // mounting/unmounting cloud nodes.
  const opacity = density === 0 ? 0 : 0.15 + density * 0.85;

  return (
    <Clouds material={THREE.MeshLambertMaterial} limit={400} range={400}>
      {/* Each cloud's puff distribution is fixed to a seed derived from the
          persisted scene seed, so it stays identical when sliders (which change
          colour/opacity and would otherwise re-roll the layout) are dragged. */}
      <Cloud seed={seed} segments={40} bounds={[50, 6, 20]} volume={30} color={cloudColor} opacity={opacity} position={[0, -10, -20]} speed={0.1} />
      <Cloud seed={seed + 1} segments={30} bounds={[15, 15, 15]} volume={20} color={cloudColor} opacity={opacity} position={[-22, -2, -18]} speed={0.2} />
      <Cloud seed={seed + 2} segments={35} bounds={[15, 20, 15]} volume={25} color={cloudColor} opacity={opacity} position={[24, 0, -18]} speed={0.3} />
      <Cloud seed={seed + 3} segments={20} bounds={[20, 10, 10]} volume={15} color={cloudColor} opacity={opacity} position={[0, -4, -35]} speed={0.5} />
    </Clouds>
  );
}

// Seeded star field, drawn once per resize into a 2D canvas. Its opacity is
// the only thing that changes, so night costs nothing per frame.
function drawStars(canvas, seed) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const rand = mulberry32(seed + 0x51ed);
  const n = Math.round((w * h) / 2600);
  for (let i = 0; i < n; i++) {
    const x = rand() * w;
    // Fewer stars toward the horizon, where the air is thickest.
    const y = Math.pow(rand(), 1.6) * h * 0.82;
    const r = rand() < 0.06 ? 1 + rand() * 0.7 : 0.35 + rand() * 0.6;
    const a = (0.35 + rand() * 0.65) * (1 - y / (h * 0.9));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rand() < 0.15 ? '255,236,214' : '232,238,255'}, ${a.toFixed(3)})`;
    ctx.fill();
  }
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SkyScene({
  weather,
  timeOfDay = 0.2,
  cloudDensity = 0.6,
  cloudWhiteness = 0.85,
  particleDensity = 0.6,
  particleColor = '#fbbf24',
  seed = 1,
  onReady,
}) {
  const isSunny = weather === 'sunny';

  // The single mutable sky state. Anime.js tweens `t` (time of day) and `rain`
  // on this plain object; every update repaints the CSS backdrop directly and
  // the WebGL scene reads `model` in its own frame loop — no React re-renders
  // while the sky is moving.
  const sky = useRef(null);
  if (!sky.current) {
    const t = timeOfDay;
    const rain = isSunny ? 0 : 1;
    sky.current = { t, rain, model: computeSky(t, rain) };
  }

  const backdropRef = useRef(null);
  const sunRef = useRef(null);
  const starsRef = useRef(null);
  const moonRef = useRef(null);

  const paint = useCallback(() => {
    const s = sky.current;
    const m = computeSky(s.t, s.rain);
    s.model = m;

    const backdrop = backdropRef.current;
    if (backdrop) {
      const { x, y } = m.sun;
      backdrop.style.background = [
        // Circumsolar glow: a tight bright halo inside a wide soft wash.
        `radial-gradient(circle at ${x}% ${y}%, ${rgb(m.glow, m.glowA)} 0%, ${rgb(m.glow, m.glowA * 0.35)} 18%, ${rgb(m.glow, 0)} 46%)`,
        // Horizon band, warmest directly under the sun.
        `radial-gradient(120% 40% at ${x}% 100%, ${rgb(m.horizon, 0.55)} 0%, ${rgb(m.horizon, 0)} 70%)`,
        `linear-gradient(${m.angle.toFixed(2)}deg, ${rgb(m.zenith)} 0%, ${rgb(m.mid)} 52%, ${rgb(m.horizon)} 100%)`,
      ].join(', ');
    }

    const sun = sunRef.current;
    if (sun) {
      sun.style.transform = `translate3d(${m.sun.x}%, ${m.sun.y}%, 0)`;
      sun.style.opacity = m.sunOpacity.toFixed(3);
      sun.style.setProperty('--sun-core', rgb(m.sunCore));
      sun.style.setProperty('--sun-edge', rgb(m.sunEdge));
      sun.style.setProperty('--sun-scale', m.sunScale.toFixed(3));
      // Clouds smear the disc into a diffuse bright patch when raining.
      sun.style.setProperty('--sun-blur', `${(s.rain * 14).toFixed(1)}px`);
    }

    const stars = starsRef.current;
    if (stars) stars.style.opacity = (m.night * (1 - s.rain * 0.9)).toFixed(3);

    const moon = moonRef.current;
    if (moon) {
      moon.style.transform = `translate3d(${m.moon.x}%, ${m.moon.y}%, 0)`;
      moon.style.opacity = m.moon.opacity.toFixed(3);
      moon.style.setProperty('--moon-color', rgb(m.moon.color));
      moon.style.setProperty('--moon-tilt', `${m.moon.tilt.toFixed(1)}deg`);
      moon.style.setProperty('--moon-blur', `${(s.rain * 6).toFixed(1)}px`);
    }
  }, []);

  // First paint before the browser draws, so the sky never flashes unstyled.
  useLayoutEffect(() => {
    paint();
  }, [paint]);

  // Sun travel: a quick, decelerating follow so dragging the slider feels
  // direct but the sky still glides into place when you let go.
  useEffect(() => {
    if (reducedMotion()) {
      sky.current.t = timeOfDay;
      paint();
      return;
    }
    const anim = animate(sky.current, {
      t: timeOfDay,
      duration: 900,
      ease: 'outExpo',
      onUpdate: paint,
    });
    return () => anim.pause();
  }, [timeOfDay, paint]);

  // Weather change: a slow, even cross-fade between clear and overcast.
  useEffect(() => {
    const target = isSunny ? 0 : 1;
    const anim = animate(sky.current, {
      rain: target,
      duration: reducedMotion() ? 400 : 1600,
      ease: 'inOutSine',
      onUpdate: paint,
    });
    return () => anim.pause();
  }, [isSunny, paint]);

  useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    let frame = 0;
    const redraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => drawStars(canvas, seed));
    };
    drawStars(canvas, seed);
    window.addEventListener('resize', redraw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', redraw);
    };
  }, [seed]);

  // Fire onReady a couple of frames after the renderer is created, so the
  // clouds/rain instances have actually been drawn (not just the bare canvas)
  // before the page transition uncovers the scene.
  const handleCreated = () => {
    if (!onReady) return;
    requestAnimationFrame(() => requestAnimationFrame(() => onReady()));
  };

  return (
    <div className="sky-root" aria-hidden="true">
      <div ref={backdropRef} className="sky-backdrop" />
      <canvas ref={starsRef} className="sky-stars" />
      <div ref={moonRef} className="sky-moon-track">
        <div className="sky-moon">
          <div className="sky-moon-crescent" />
        </div>
      </div>
      {/* The sun sits under the WebGL canvas, so the clouds pass in front of it. */}
      <div ref={sunRef} className="sky-sun-track">
        <div className="sky-sun">
          <div className="sky-sun-corona" />
          <div className="sky-sun-disc" />
        </div>
      </div>
      {/* The Canvas lives at the app level and keeps animating across route
          changes, so the environment stays alive (no freeze, no component
          reset) when returning to the portfolio. */}
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 0, 10], fov: 60 }}
        onCreated={handleCreated}
      >
        <SkyLights sky={sky} />
        <VolumetricClouds density={cloudDensity} whiteness={cloudWhiteness} seed={seed} />
        <MagicalSparkles active={isSunny} density={particleDensity} color={particleColor} seed={seed} sky={sky} />
        <FallingRain active={!isSunny} density={particleDensity} seed={seed} sky={sky} />
      </Canvas>
    </div>
  );
}
