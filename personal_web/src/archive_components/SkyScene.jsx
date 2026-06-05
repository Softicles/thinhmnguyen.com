import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Clouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';

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

// Generate a vertical streak for the falling rain
const rainTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Create a fading gradient so the top and bottom of the rain drop fade out smoothly
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  // Draw a very thin vertical line down the center
  ctx.fillRect(31, 0, 2, 64);
  
  return new THREE.CanvasTexture(canvas);
})();

function MagicalSparkles({ active, density, color = '#fbbf24', seed = 1 }) {
  const pointsRef = useRef();
  const targetOpacity = active ? 1 : 0;
  const currentOpacity = useRef(targetOpacity);

  const particlesPosition = useMemo(() => {
    // Seeded so the spread is identical on every mount/reload.
    const rand = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (rand() - 0.5) * 40;
        positions[i * 3 + 1] = (rand() - 0.5) * 40;
        positions[i * 3 + 2] = (rand() - 0.5) * 40;
    }
    return positions;
  }, [seed]);

  useFrame((state, delta) => {
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, delta * 2);
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
      />
    </points>
  );
}

function FallingRain({ active, density, seed = 1 }) {
  const pointsRef = useRef();
  const targetOpacity = active ? 1 : 0;
  const currentOpacity = useRef(0);

  const positions = useMemo(() => {
    // Offset the seed so rain doesn't mirror the sparkle layout, but stays
    // deterministic across mounts/reloads.
    const rand = mulberry32(seed + 0x9e3779b9);
    const arr = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      arr[i * 3] = (rand() - 0.5) * 30;
      arr[i * 3 + 1] = rand() * 40 - 20;
      arr[i * 3 + 2] = (rand() - 0.5) * 30;
    }
    return arr;
  }, [seed]);

  useFrame((state, delta) => {
    // Clamp delta so a single frame can never jump too far. After the tab is
    // throttled or the machine sleeps, the first frame's delta is the whole
    // elapsed time (seconds). Without this clamp every drop falls past the wrap
    // threshold in one frame and resets to the same height, collapsing the rain
    // into one synchronized sheet.
    const dt = Math.min(delta, 1 / 30);
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, dt * 4);
    if (!pointsRef.current) return;

    // Apply the fade every frame so rain smoothly appears when it starts and
    // dissolves when switching back to sunny (without this the material keeps
    // its initial opacity and the rain never shows / never fades out).
    pointsRef.current.material.opacity = currentOpacity.current;

    const drawCount = Math.floor((rainCount / MAX_DENSITY_MULTIPLIER) * density);
    pointsRef.current.geometry.setDrawRange(0, drawCount);
    // Keep the drops falling while they're active OR still fading out, so they
    // never freeze on screen mid-transition.
    if (active || currentOpacity.current > 0.01) {
       const pos = pointsRef.current.geometry.attributes.position.array;
       // Only animate the visible drops.
       for(let i=1; i < drawCount * 3; i+=3) {
           // 3. Changed fall amount from 15 to 6 to feel much slower
           pos[i] -= dt * 6;
           if(pos[i] < -20) pos[i] = 20;
       }
       pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

    return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={rainCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.6} // Increased size so the thin streak is actually visible!
        color="#94a3b8"
        transparent
        opacity={currentOpacity.current}
        depthWrite={false}
        map={rainTexture} // Use the new streak texture!
        alphaTest={0.01}  // Dropped this so the gradient ends aren't harshly clipped
      />
    </points>
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

export default function SkyScene({
  weather,
  cloudDensity = 0.6,
  cloudWhiteness = 0.85,
  particleDensity = 0.6,
  particleColor = '#fbbf24',
  seed = 1,
}) {
  const isSunny = weather === 'sunny';
  const bgStyle = {
    position: 'fixed', inset: 0, zIndex: -1,
    background: isSunny
      ? 'linear-gradient(180deg, #60a5fa 0%, #93c5fd 30%, #bfdbfe 60%, #fef08a 85%, #fde047 100%)' 
      : 'linear-gradient(180deg, #1e293b 0%, #334155 40%, #475569 70%, #64748b 100%)',
    transition: 'background 1.5s ease'
  };

  return (
    <div style={bgStyle}>
        {/* The Canvas lives at the app level and keeps animating across route
            changes, so the environment stays alive (no freeze, no component
            reset) when returning to the portfolio. */}
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={isSunny ? 1.0 : 0.6} />
          <directionalLight position={[10, 10, 5]} intensity={isSunny ? 1.5 : 0.4} color={isSunny ? "#fde68a" : "#cbd5e1"} />
          <VolumetricClouds density={cloudDensity} whiteness={cloudWhiteness} seed={seed} />
          <MagicalSparkles active={isSunny} density={particleDensity} color={particleColor} seed={seed} />
          <FallingRain active={!isSunny} density={particleDensity} seed={seed} />
        </Canvas>
    </div>
  );
}
