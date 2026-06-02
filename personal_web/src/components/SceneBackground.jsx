import SkyScene from '../archive_components/SkyScene';
import { useScene } from '../utils/SceneContext';

// Renders the sky once, above the router, so its Three.js canvas never unmounts
// when navigating between pages. The clouds/particles therefore keep their exact
// shape and position — and keep animating — when leaving /archive and coming
// back, so the environment is never frozen or reset.
export default function SceneBackground() {
  const { weather, cloudDensity, cloudWhiteness, particleDensity, particleColor, seed } = useScene();

  return (
    <SkyScene
      weather={weather}
      cloudDensity={cloudDensity}
      cloudWhiteness={cloudWhiteness}
      particleDensity={particleDensity}
      particleColor={particleColor}
      seed={seed}
    />
  );
}
