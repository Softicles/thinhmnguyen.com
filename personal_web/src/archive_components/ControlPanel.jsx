import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Icon } from '@iconify/react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Preset glow colours for the light particles. Custom shades are still reachable
// through the trailing native colour swatch.
const PARTICLE_COLORS = [
  '#fbbf24', // amber (default)
  '#fff3c4', // warm white
  '#f9a8d4', // pink
  '#c4b5fd', // lavender
  '#7dd3fc', // sky
  '#6ee7b7', // mint
];

// A swatchboard for picking the light-particle glow colour.
function ColorBoard({ value, onChange }) {
  const active = (value || '').toLowerCase();
  const isPreset = PARTICLE_COLORS.some((c) => c.toLowerCase() === active);
  return (
    <div className="magic-color-board" role="group" aria-label="Light particle colour">
      {PARTICLE_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={`magic-swatch${c.toLowerCase() === active ? ' is-active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={`Particle colour ${c}`}
          aria-pressed={c.toLowerCase() === active}
        />
      ))}
      <label className={`magic-swatch magic-swatch-custom${!isPreset ? ' is-active' : ''}`} style={{ background: value }}>
        <Icon icon="mdi:eyedropper-variant" width={13} height={13} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Custom particle colour"
        />
      </label>
    </div>
  );
}

// A single custom-styled slider row (label + amber range input).
function Slider({ icon, label, value, onChange }) {
  return (
    <label className="magic-slider-row">
      <span className="magic-slider-label">
        {icon && <Icon icon={icon} width={14} height={14} />}
        {label}
      </span>
      <input
        type="range"
        className="magic-slider"
        min={0}
        max={4}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
      />
    </label>
  );
}

export default function ControlPanel({
  open,
  onOpenChange,
  weather,
  onWeatherChange,
  cloudDensity,
  onCloudDensity,
  cloudWhiteness,
  onCloudWhiteness,
  particleDensity,
  onParticleDensity,
  particleColor,
  onParticleColor,
  audio,
}) {
  const panelRef = useRef(null);
  const didMount = useRef(false);
  const isSunny = weather === 'sunny';

  // ── Anime.js expand / collapse ──
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    // Snap (no animation) for reduced motion or the very first paint.
    if (prefersReducedMotion()) {
      el.style.opacity = open ? '1' : '0';
      el.style.transform = 'translateX(0) scale(1)';
      el.style.pointerEvents = open ? 'auto' : 'none';
      el.style.visibility = open ? 'visible' : 'hidden';
      return;
    }

    if (open) {
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
      animate(el, {
        opacity: [0, 1],
        translateX: [24, 0],
        scale: [0.94, 1],
        duration: 360,
        easing: 'easeOutBack',
      });
    } else {
      el.style.pointerEvents = 'none';
      // Skip the exit animation on the initial closed mount.
      if (!didMount.current) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        didMount.current = true;
        return;
      }
      animate(el, {
        opacity: [1, 0],
        translateX: [0, 24],
        scale: [1, 0.94],
        duration: 240,
        easing: 'easeInQuad',
        onComplete: () => { el.style.visibility = 'hidden'; },
      });
    }
  }, [open]);

  const particleLabel = isSunny ? 'Light particles' : 'Rain drops';
  const particleIcon = isSunny ? 'mdi:shimmer' : 'mdi:weather-pouring';

  return (
    <div className="magic-panel-dock">
      {/* Expanded glass panel */}
      <div ref={panelRef} className="magic-panel" role="region" aria-label="Scene controls" style={{ opacity: 0, visibility: 'hidden' }}>
        {/* Weather */}
        <div className="magic-section">
          <span className="magic-section-label">Weather</span>
          <div className="magic-seg" role="group" aria-label="Weather">
            <button
              className={`magic-seg-btn${isSunny ? ' is-active' : ''}`}
              onClick={() => onWeatherChange('sunny')}
              aria-pressed={isSunny}
            >
              <Icon icon="mdi:weather-sunny" width={16} height={16} /> Sunny
            </button>
            <button
              className={`magic-seg-btn${!isSunny ? ' is-active' : ''}`}
              onClick={() => onWeatherChange('rainy')}
              aria-pressed={!isSunny}
            >
              <Icon icon="mdi:weather-rainy" width={16} height={16} /> Raining
            </button>
          </div>
        </div>

        {/* Environment sliders */}
        <div className="magic-section">
          <span className="magic-section-label">Environment</span>
          <Slider icon="mdi:cloud" label="Cloud density" value={cloudDensity} onChange={onCloudDensity} />
          <Slider icon="mdi:white-balance-sunny" label="Cloud whiteness" value={cloudWhiteness} onChange={onCloudWhiteness} />
          <Slider icon={particleIcon} label={particleLabel} value={particleDensity} onChange={onParticleDensity} />
          {isSunny && (
            <div className="magic-slider-row">
              <span className="magic-slider-label">
                <Icon icon="mdi:palette" width={14} height={14} />
                Particle colour
              </span>
              <ColorBoard value={particleColor} onChange={onParticleColor} />
            </div>
          )}
        </div>

        {/* Audio */}
        <div className="magic-section">
          <span className="magic-section-label">Music</span>
          <p className="magic-track-name" title={audio.currentTrack?.name}>
            {audio.currentTrack?.name ?? 'No track'}
          </p>
          <div className="magic-audio-controls">
            <button
              className="magic-audio-btn"
              onClick={audio.prev}
              disabled={!audio.available}
              aria-label="Previous track"
            >
              <Icon icon="mdi:skip-previous" width={20} height={20} />
            </button>
            <button
              className="magic-audio-btn magic-audio-play"
              onClick={audio.togglePlay}
              disabled={!audio.available}
              aria-label={audio.isPlaying ? 'Pause' : 'Play'}
            >
              <Icon icon={audio.isPlaying ? 'mdi:pause' : 'mdi:play'} width={22} height={22} />
            </button>
            <button
              className="magic-audio-btn"
              onClick={audio.next}
              disabled={!audio.available}
              aria-label="Next track"
            >
              <Icon icon="mdi:skip-next" width={20} height={20} />
            </button>
          </div>
          <label className="magic-slider-row">
            <span className="magic-slider-label">
              <Icon icon="mdi:volume-high" width={14} height={14} />
              Volume
            </span>
            <input
              type="range"
              className="magic-slider"
              min={0}
              max={1}
              step={0.01}
              value={audio.volume}
              onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
              aria-label="Volume"
            />
          </label>
        </div>
      </div>

      {/* Collapsed floating toggle button */}
      <button
        className={`magic-panel-toggle${open ? ' is-open' : ''}`}
        onClick={() => onOpenChange(!open)}
        aria-label={open ? 'Hide scene controls' : 'Show scene controls'}
        aria-expanded={open}
      >
        <Icon icon="mdi:tune-variant" width={22} height={22} />
      </button>
    </div>
  );
}
