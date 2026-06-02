import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { animate } from 'animejs';
import { photos } from '../data/photoData';
import { groupByDay, groupByMonth, groupByYear } from '../utils/photoGrouping';
import Navbar from '../archive_components/Navbar';
import MagicalAlbum from '../archive_components/MagicalAlbum';
import ViewModeTabs from '../archive_components/ViewModeTabs';
import PhotoGroupedView from '../archive_components/PhotoGroupedView';
import PhotoLightbox from '../archive_components/PhotoLightbox';
import ControlPanel from '../archive_components/ControlPanel';
import KeyboardGuide from '../archive_components/KeyboardGuide';
import { useScene } from '../utils/SceneContext';

function chunkPhotos(photos, size) {
  const chunks = [];
  for (let i = 0; i < photos.length; i += size) {
    chunks.push(photos.slice(i, i + size));
  }
  return chunks;
}

export function Archive() {
  const [viewMode, setViewMode] = useState('album');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [albumClosed, setAlbumClosed] = useState(true);

  // ── Control-panel scene state (persisted across navigation via context) ──
  const [panelOpen, setPanelOpen] = useState(false);
  const {
    weather, setWeather,
    cloudDensity, setCloudDensity,
    cloudWhiteness, setCloudWhiteness,
    particleDensity, setParticleDensity,
    particleColor, setParticleColor,
    audio,
  } = useScene();
  // Open intent: once the album is open, switching back to the Album tab lands
  // in the open spread; Escape clears it so we return to the closed cover.
  const [albumOpenIntent, setAlbumOpenIntent] = useState(false);
  // Bumped on Escape to force the album to remount into its closed cover, even
  // when we're already in album view (so the view stays mounted otherwise).
  const [albumKey, setAlbumKey] = useState(0);
  // "See background": at the cover, B hides the album + chrome to reveal the sky.
  const [seeBackground, setSeeBackground] = useState(false);

  const atCover = viewMode === 'album' && albumClosed;

  const contentRef = useRef(null);
  const fadeInPending = useRef(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const handleBookStateChange = useCallback((state) => {
    setAlbumClosed(state === 'closed');
    if (state !== 'closed') setAlbumOpenIntent(true);
  }, []);

  // ── Escape → cover page state, from any view, with a cross-fade ──────────────
  const goToCover = useCallback(() => {
    setViewMode('album');
    setAlbumOpenIntent(false);
    setAlbumKey(k => k + 1); // force a fresh, closed album mount
  }, []);

  // B at the cover hides the album + chrome; B (or Escape) anywhere restores it.
  const toggleBackground = useCallback(() => {
    setSeeBackground(prev => (prev ? false : atCover ? true : prev));
  }, [atCover]);

  const escToCover = useCallback(() => {
    // Escape falls back one level at a time: photo → background → panel → spread → cover.
    // The lightbox owns Escape while open, so skip here.
    if (lightboxPhoto) return;
    // "See background" view → restore the chrome first.
    if (seeBackground) { setSeeBackground(false); return; }
    // Control panel open → close it before touching the album.
    if (panelOpen) { setPanelOpen(false); return; }
    // Already at the cover — nothing to transition to.
    if (viewMode === 'album' && albumClosed) return;

    if (reducedMotion.current || !contentRef.current) { goToCover(); return; }
    fadeInPending.current = true;
    animate(contentRef.current, {
      opacity: [1, 0],
      duration: 260,
      easing: 'easeInQuad',
      onComplete: goToCover,
    });
  }, [lightboxPhoto, seeBackground, panelOpen, viewMode, albumClosed, goToCover]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { escToCover(); return; }
      if (e.key === 'b' || e.key === 'B') {
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (lightboxPhoto) return;
        toggleBackground();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [escToCover, toggleBackground, lightboxPhoto]);

  // Safety net: never leave the chrome hidden once we're off the cover.
  useEffect(() => {
    if (!atCover && seeBackground) setSeeBackground(false);
  }, [atCover, seeBackground]);

  // Fade the cover back in once the state swap has rendered.
  useEffect(() => {
    if (!fadeInPending.current || !contentRef.current) return;
    fadeInPending.current = false;
    if (reducedMotion.current) { contentRef.current.style.opacity = '1'; return; }
    animate(contentRef.current, {
      opacity: [0, 1],
      duration: 340,
      easing: 'easeOutQuad',
    });
  }, [viewMode, albumKey]);

  const pages = useMemo(() => chunkPhotos(photos, 3), []);
  const groupedByDay = useMemo(() => groupByDay(photos), []);
  const groupedByMonth = useMemo(() => groupByMonth(photos), []);
  const groupedByYear = useMemo(() => groupByYear(photos), []);

  const lightboxIndex = lightboxPhoto ? photos.findIndex(p => p.id === lightboxPhoto.id) : -1;

  const openLightbox = (photo) => setLightboxPhoto(photo);
  const closeLightbox = () => setLightboxPhoto(null);
  const prevPhoto = () => { if (lightboxIndex > 0) setLightboxPhoto(photos[lightboxIndex - 1]); };
  const nextPhoto = () => { if (lightboxIndex < photos.length - 1) setLightboxPhoto(photos[lightboxIndex + 1]); };

  const groupedData =
    viewMode === 'days' ? groupedByDay :
    viewMode === 'months' ? groupedByMonth :
    viewMode === 'years' ? groupedByYear :
    null;

  // Fade chrome (album + nav + guide + panel) out of the way for "see background".
  const chromeHidden = {
    opacity: seeBackground ? 0 : 1,
    pointerEvents: seeBackground ? 'none' : 'auto',
    transition: reducedMotion.current ? 'none' : 'opacity 0.45s ease',
  };

  return (
    <>
      {/* The sky background is rendered once at the app level (SceneBackground)
          so its canvas persists across navigation. */}
      <div style={chromeHidden}>
        <Navbar />
      </div>

      <main
        style={{
          position: 'relative',
          minHeight: '100vh',
          paddingTop: '80px',
          paddingBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div 
          ref={contentRef} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            flexGrow: viewMode === 'album' ? 1 : 0,
            justifyContent: viewMode === 'album' ? 'center' : 'flex-start',
            // Shift the album layout upward slightly (adjust -8vh to tweak exactly how high!)
            marginTop: viewMode === 'album' ? '-8vh' : '0'
          }}
        >
          {/* Hide the view-mode bar while the album sits at its closed cover */}
          {!(viewMode === 'album' && albumClosed) && (
            <ViewModeTabs activeTab={viewMode} onTabChange={setViewMode} />
          )}

          <div style={{
            ...chromeHidden,
            display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
          }}>
            {viewMode === 'album' ? (
              <MagicalAlbum
                key={albumKey}
                pages={pages}
                onOpenLightbox={openLightbox}
                onBookStateChange={handleBookStateChange}
                startOpen={albumOpenIntent}
                lightboxOpen={!!lightboxPhoto}
                frozen={seeBackground}
              />
            ) : (
              <PhotoGroupedView groupedData={groupedData} onOpenLightbox={openLightbox} />
            )}
          </div>
        </div>
      </main>

      <div style={chromeHidden}>
        <ControlPanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          weather={weather}
          onWeatherChange={setWeather}
          cloudDensity={cloudDensity}
          onCloudDensity={setCloudDensity}
          cloudWhiteness={cloudWhiteness}
          onCloudWhiteness={setCloudWhiteness}
          particleDensity={particleDensity}
          onParticleDensity={setParticleDensity}
          particleColor={particleColor}
          onParticleColor={setParticleColor}
          audio={audio}
        />
      </div>

      <div style={chromeHidden}>
        <KeyboardGuide viewMode={viewMode} atCover={atCover} />
      </div>

      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < photos.length - 1}
        />
      )}
    </>
  );
}
