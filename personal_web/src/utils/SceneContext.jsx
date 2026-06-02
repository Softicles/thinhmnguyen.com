import { createContext, useContext, useState, useEffect } from 'react';
import useAudioPlayer from './useAudioPlayer';

// Holds the /archive control-panel configuration (weather + cloud/particle
// settings) and the audio player. Mounted ABOVE the router so navigating away
// to another page and back keeps the same background and lets the song keep
// playing. The scene config is also mirrored to localStorage so it survives a
// full page reload.

const STORAGE_KEY = 'archive-scene';

const defaults = {
  weather: 'sunny',
  cloudDensity: 0.25,
  cloudWhiteness: 1.3,
  particleDensity: 0.5,
  particleColor: '#fbbf24',
  // Fixed layout seed for the clouds + particles. Persisted like everything else
  // so the exact sky arrangement is stable across navigation and reloads.
  seed: 1,
};

function loadScene() {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

const SceneContext = createContext(null);

export function SceneProvider({ children }) {
  const [scene, setScene] = useState(loadScene);
  // The audio element lives here (not inside the page) so playback continues
  // across route changes.
  const audio = useAudioPlayer();

  // Persist the scene config so it's restored after a reload too.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
    } catch {
      /* ignore quota / private-mode failures */
    }
  }, [scene]);

  const value = {
    ...scene,
    setWeather: (weather) => setScene((s) => ({ ...s, weather })),
    setCloudDensity: (cloudDensity) => setScene((s) => ({ ...s, cloudDensity })),
    setCloudWhiteness: (cloudWhiteness) => setScene((s) => ({ ...s, cloudWhiteness })),
    setParticleDensity: (particleDensity) => setScene((s) => ({ ...s, particleDensity })),
    setParticleColor: (particleColor) => setScene((s) => ({ ...s, particleColor })),
    audio,
  };

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within a SceneProvider');
  return ctx;
}
