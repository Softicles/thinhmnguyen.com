// Pure sky model: given the time of day (0 = midday, 1 = full night) and how
// rainy it is (0 = clear, 1 = overcast), work out where the sun sits, how the
// sky gradient tilts toward it, and every colour on screen. No DOM, no Three —
// SkyScene feeds the result to both the CSS backdrop and the WebGL lights.

// ── Colour helpers ──────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lerp = (a, b, t) => a + (b - a) * t;
const lerpRgb = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const rgb = (c, a = 1) =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${a.toFixed(3)})`;
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smoothstep = (e0, e1, v) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// ── Clear-sky keyframes along the day ───────────────────────────────────────
// zenith → mid → horizon is the vertical sky; `glow` is the circumsolar
// brightening around the sun (strongest at golden hour / sunset).
const CLEAR = [
  { at: 0.0,  zenith: '#2f6fc4', mid: '#6fa8e6', horizon: '#cfe4f6', glow: '#fff7e0', glowA: 0.55 },
  { at: 0.45, zenith: '#3a6fb8', mid: '#8fb6dc', horizon: '#f5d9a6', glow: '#ffdc98', glowA: 0.65 },
  { at: 0.64, zenith: '#3b5690', mid: '#c4918f', horizon: '#f7a25f', glow: '#ffb067', glowA: 0.75 },
  { at: 0.79, zenith: '#1e2959', mid: '#5c4a80', horizon: '#cf6f78', glow: '#f07c62', glowA: 0.5 },
  { at: 0.9,  zenith: '#0c1230', mid: '#1f2350', horizon: '#3e3563', glow: '#6a4e7a', glowA: 0.2 },
  { at: 1.0,  zenith: '#04060f', mid: '#0a1026', horizon: '#18213f', glow: '#2a3a66', glowA: 0.08 },
];

// Overcast: flat, desaturated, with only a faint warm cast near sunset.
const OVERCAST = [
  { at: 0.0,  zenith: '#3e4a5a', mid: '#5d6979', horizon: '#848f9b', glow: '#c3cad2', glowA: 0.18 },
  { at: 0.62, zenith: '#353c4c', mid: '#545866', horizon: '#86787a', glow: '#b8907a', glowA: 0.15 },
  { at: 0.85, zenith: '#161a24', mid: '#232835', horizon: '#363b48', glow: '#4a4d5a', glowA: 0.06 },
  { at: 1.0,  zenith: '#06080d', mid: '#0d1118', horizon: '#171d26', glow: '#262d38', glowA: 0.03 },
];

const PARSED = new WeakMap();
const parse = (frame) => {
  let p = PARSED.get(frame);
  if (!p) {
    p = { ...frame, zenith: hexToRgb(frame.zenith), mid: hexToRgb(frame.mid), horizon: hexToRgb(frame.horizon), glow: hexToRgb(frame.glow) };
    PARSED.set(frame, p);
  }
  return p;
};

function sample(frames, t) {
  let i = 0;
  while (i < frames.length - 2 && t > frames[i + 1].at) i++;
  const a = parse(frames[i]);
  const b = parse(frames[i + 1]);
  const k = smoothstep(0, 1, clamp01((t - a.at) / (b.at - a.at)));
  return {
    zenith: lerpRgb(a.zenith, b.zenith, k),
    mid: lerpRgb(a.mid, b.mid, k),
    horizon: lerpRgb(a.horizon, b.horizon, k),
    glow: lerpRgb(a.glow, b.glow, k),
    glowA: lerp(a.glowA, b.glowA, k),
  };
}

// ── Sun path ───────────────────────────────────────────────────────────────
// The sun rides an elliptical arc across the sky and sets toward the right.
// Elevation runs from 62° at midday to -14° (just below the horizon) at night.
export const HORIZON_Y = 86; // % of viewport height

export function sunPosition(t) {
  const elev = lerp(62, -14, t) * (Math.PI / 180);
  return {
    x: 50 + Math.cos(elev) * 40, // % of viewport width
    y: HORIZON_Y - Math.sin(elev) * 82, // % of viewport height
    elevation: elev,
  };
}

export function computeSky(t, rain) {
  const clear = sample(CLEAR, t);
  const grey = sample(OVERCAST, t);
  const mix = (k) => lerpRgb(clear[k], grey[k], rain);
  const sun = sunPosition(t);

  // Gradient tilt: at midday the sky is a near-vertical zenith→horizon fade.
  // As the sun drops, the bright end swings toward the sun's side of the
  // horizon — the closer to setting, the stronger the lean. CSS angles point
  // toward the *end* colour, so 180deg = straight down, <180 = down-right.
  const lowSun = 1 - clamp01(sun.elevation / (62 * (Math.PI / 180)));
  const lean = (sun.x - 50) * (0.35 + lowSun * 0.9);
  const angle = 180 - lean;

  // How visible the sun disc is: fades as it slips under the horizon, and is
  // mostly smothered by cloud cover when raining.
  const aboveHorizon = smoothstep(-0.2, 0.06, Math.sin(sun.elevation));
  const sunOpacity = aboveHorizon * lerp(1, 0.12, rain);

  // Sun disc colour: white-hot at noon, amber and larger near the horizon
  // (atmospheric reddening + the familiar "big low sun" look).
  const warm = smoothstep(0.3, 0.75, t);
  const sunCore = lerpRgb([255, 253, 244], [255, 226, 180], warm);
  const sunEdge = lerpRgb([255, 236, 170], [255, 120, 60], warm);

  // night: 0 by day → 1 once fully dark. Drives stars, particle fade, lights.
  const night = smoothstep(0.7, 0.95, t);

  // Moon: rises on the opposite (left) side as the sun sets, climbing from
  // below the horizon to a third of the way up the sky by full night. Low on
  // the horizon it's a deep amber; it pales to a soft apricot as it climbs.
  const moonRise = smoothstep(0.62, 1, t);
  const moonY = lerp(HORIZON_Y + 12, 13, moonRise);
  const moon = {
    x: lerp(4, 5.5, moonRise),
    y: moonY,
    opacity: smoothstep(HORIZON_Y + 6, HORIZON_Y - 4, moonY) * lerp(1, 0.18, rain),
    color: lerpRgb([246, 150, 76], [252, 198, 132], smoothstep(0.2, 1, moonRise)),
    tilt: lerp(-28, -12, moonRise),
  };

  return {
    zenith: mix('zenith'),
    mid: mix('mid'),
    horizon: mix('horizon'),
    glow: mix('glow'),
    glowA: lerp(clear.glowA, grey.glowA, rain),
    angle,
    sun,
    sunOpacity,
    sunScale: lerp(1, 1.3, warm),
    sunCore,
    sunEdge,
    warm,
    night,
    moon,
  };
}
