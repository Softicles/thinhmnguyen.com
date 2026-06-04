import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { Icon } from '@iconify/react';
import AlbumPage from './AlbumPage';

import bookCoverImg from '../assets/book_cover.png';
import leftPageImg  from '../assets/left_page_empty.png';
import rightPageImg from '../assets/right_page_empty.png';

const BOOK_RATIO    = 1880 / 1106;
const FLIP_DURATION = 930; // 1.5× slower turn
const COVER_OUT     = 460; // cover fades out + slides down; container resizes over same span
const SPREAD_IN     = 600; // inside spread fades in + rises up

// Open book: full two-page spread
const OPEN_W   = 820;
const OPEN_H   = Math.round(OPEN_W / BOOK_RATIO); // ≈ 482

// Closed cover: exactly one page in size (mirrors LEFT_AREA / RIGHT_AREA dimensions)
const CLOSED_W = Math.round(OPEN_W * 0.47); // ≈ 385 — same as one page's width
const CLOSED_H = Math.round(OPEN_H * 0.96); // ≈ 463 — same as one page's height

// Spine thickness for the 3D cover effect (from techprep-gh/3d-book-animation technique)
const SPINE_W = 50; // px

// Content areas as % of the open book image (1880×1106).
// Both pages are equal width (47%) and share the spine at exactly 50%.
// This ensures the flipped page covers the opposite side precisely:
//   right page at -180°  covers 50%-(47%) = 3% → 50%  (= LEFT_AREA)
//   left  page at -180°  covers 50%+(47%) = 50% → 97% (= RIGHT_AREA)
const LEFT_AREA  = { left: '3%',  top: '2%', width: '47%', height: '96%' };
const RIGHT_AREA = { left: '50%', top: '2%', width: '47%', height: '96%' };

// True when keyboard focus is on a control that should own arrow/space keys
// itself (text fields, range sliders, selects, buttons, contenteditable), so
// the album doesn't also flip pages.
function isInteractiveTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return true;
  if (el.isContentEditable) return true;
  const role = el.getAttribute?.('role');
  return role === 'slider' || role === 'button';
}

export default function MagicalAlbum({ pages, onOpenLightbox, onBookStateChange, startOpen = false, lightboxOpen = false, frozen = false }) {
  // Initialize open when returning to the Album tab after it was opened before
  const [bookState,    setBookState]    = useState(() => startOpen ? 'open' : 'closed'); // 'closed'|'opening'|'open'
  const [bookHovered,  setBookHovered]  = useState(false);
  const [spreadIdx,  setSpreadIdx]  = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  // flipLayer: the turning leaf — a real double-sided object
  //   { side, frontPhotos, fromIdx, toIdx }
  const [flipLayer,  setFlipLayer]  = useState(null);

  const coverSceneRef = useRef(null); // perspective wrapper that fades out + slides down
  const book3dRef    = useRef(null);
  const spreadRef    = useRef(null);  // wraps both pages; fades in + rises up
  const flipRef      = useRef(null);
  const frontFaceRef = useRef(null);  // old face, shown 0°→90°
  const backFaceRef  = useRef(null);  // new face, shown 90°→180°
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const numSpreads  = Math.ceil(pages.length / 2);
  const leftPhotos  = (i) => pages[i * 2]     ?? [];
  const rightPhotos = (i) => pages[i * 2 + 1] ?? [];

  // ── Preload every photo so page turns are seamless ──
  // The new right page (revealed at the start of a turn) and the swapped leaf
  // face (shown at the vertical midpoint) must be decoded and ready, with no
  // lazy-load pop-in. ~31 images, so loading them all up front is cheap.
  useEffect(() => {
    const imgs = pages.flat().map((photo) => {
      const img = new Image();
      img.src = photo.src;
      return img;
    });
    return () => { imgs.forEach((img) => { img.src = ''; }); };
  }, [pages]);

  // ── Run flip animation once the flip layer mounts ──────────────────────────
  // The leaf is a real double-sided object: front = old face, back = new face.
  // It rotates continuously; backface-visibility reveals the back exactly at 90°
  // (perfectly synced to the live angle), so there's no discrete content "update".
  useEffect(() => {
    if (!flipLayer || !flipRef.current) return;

    if (prefersReducedMotion.current) {
      setIsFlipping(false);
      setFlipLayer(null);
      return;
    }

    // Each leaf lifts toward the viewer, so the rotation sign depends on which
    // edge is pinned to the spine:
    //   right page (pivot = left edge)  → rotateY -180 (free right edge lifts out)
    //   left  page (pivot = right edge) → rotateY +180 (free left edge lifts out)
    const targetRotation = flipLayer.side === 'right' ? -180 : 180;
    const leaf  = flipRef.current;
    const front = frontFaceRef.current;
    const back  = backFaceRef.current;

    // Animate a proxy angle and apply it ourselves so we can swap faces exactly
    // at the 90° edge. We don't rely on backface-visibility: Firefox flattens
    // these clipped 3D layers and stops honouring it, leaving BOTH faces drawn
    // at once (the old + new photos overlap → 6 images). Toggling visibility on
    // the live angle is deterministic in every browser.
    const proxy = { ry: 0 };
    animate(proxy, {
      ry: targetRotation,
      duration: FLIP_DURATION,
      easing: 'easeInOutSine',
      onUpdate: () => {
        if (leaf) leaf.style.transform = `rotateY(${proxy.ry}deg)`;
        const showBack = Math.abs(proxy.ry) >= 90;
        if (front) front.style.visibility = showBack ? 'hidden'  : 'visible';
        if (back)  back.style.visibility  = showBack ? 'visible' : 'hidden';
      },
      onComplete: () => {
        setIsFlipping(false);
        setFlipLayer(null);
      },
    });
  }, [flipLayer]);

  // ── Open book — Phase 1: cover fades out while sliding downward ────────────
  const handleOpen = useCallback(() => {
    if (bookState !== 'closed') return;
    setBookState('opening'); // container CSS transition resizes to landscape spread

    if (prefersReducedMotion.current || !coverSceneRef.current) {
      setBookState('open');
      return;
    }

    animate(coverSceneRef.current, {
      opacity: [1, 0],
      translateY: [0, 70],
      duration: COVER_OUT,
      easing: 'easeInQuad',
      onComplete: () => setBookState('open'), // triggers Phase 2 via layout effect
    });
  }, [bookState]);

  // ── Open book — Phase 2: inside spread fades in while rising upward ────────
  useLayoutEffect(() => {
    if (bookState !== 'open' || !spreadRef.current) return;
    if (prefersReducedMotion.current) return;

    // Set start state before first paint to avoid a flash at full opacity
    spreadRef.current.style.opacity = '0';
    animate(spreadRef.current, {
      opacity: [0, 1],
      translateY: [50, 0],
      duration: SPREAD_IN,
      easing: 'easeOutCubic',
    });
  }, [bookState]);

  // ── → right arrow / right button: right page flips left (next spread) ──────
  const handleNext = useCallback(() => {
    if (bookState !== 'open' || isFlipping || spreadIdx >= numSpreads - 1) return;
    const fromIdx = spreadIdx;
    const toIdx = spreadIdx + 1;
    setFlipLayer({ side: 'right', frontPhotos: rightPhotos(fromIdx), fromIdx, toIdx });
    setSpreadIdx(toIdx);
    setIsFlipping(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookState, isFlipping, spreadIdx, numSpreads, pages]);

  // ── ← left arrow / left button: left page flips right (previous spread) ────
  const handlePrev = useCallback(() => {
    if (bookState !== 'open' || isFlipping || spreadIdx <= 0) return;
    const fromIdx = spreadIdx;
    const toIdx = spreadIdx - 1;
    setFlipLayer({ side: 'left', frontPhotos: leftPhotos(fromIdx), fromIdx, toIdx });
    setSpreadIdx(toIdx);
    setIsFlipping(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookState, isFlipping, spreadIdx, pages]);

  // Notify parent of book state so it can hide UI (e.g. view-mode tabs) at cover
  useEffect(() => {
    onBookStateChange?.(bookState);
  }, [bookState, onBookStateChange]);

  // ── Keyboard ────────────────────────────────────────────────────────────────
  // Escape (return to the cover) is handled globally by the page so it works
  // from any view. While the lightbox is open it owns the keyboard (its own
  // Escape closes it, arrows page through photos), so the album ignores keys —
  // this keeps ESC falling back one level at a time: photo → spread → cover.
  useEffect(() => {
    // Frozen = the page hid the album for "see background"; ignore keys so a
    // stray Enter can't open the (invisible) book behind the scene.
    if (lightboxOpen || frozen) return;
    const handler = (e) => {
      // Don't hijack arrows/space while the user is on a slider, input, or other
      // interactive control (e.g. the control panel's volume/density sliders).
      if (isInteractiveTarget(e.target)) return;
      if (bookState === 'closed' && (e.key === 'Enter' || e.key === ' ')) {
        handleOpen(); return;
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft')  handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleOpen, handleNext, handlePrev, bookState, lightboxOpen, frozen]);

  const isClosed = bookState === 'closed';
  const isOpen   = bookState === 'open';

  // Container grows from portrait-cover (closed) to landscape-spread (open) via CSS transition
  const cW = isClosed ? CLOSED_W : OPEN_W;
  const cH = isClosed ? CLOSED_H : OPEN_H;

  // ── What each static page shows during a flip ──
  // Both pages stay populated for the whole turn: the STATIONARY page keeps its
  // OLD photos, the OTHER page shows the NEW photos (revealed as the leaf lifts).
  // The double-sided leaf rides on top and lands in front of the old page.
  //   forward  (right→left): left = old (fromIdx), right = new (toIdx)
  //   backward (left→right): right = old (fromIdx), left = new (toIdx)
  const leftDisplay = flipLayer
    ? leftPhotos(flipLayer.side === 'right' ? flipLayer.fromIdx : flipLayer.toIdx)
    : leftPhotos(spreadIdx);
  const rightDisplay = flipLayer
    ? rightPhotos(flipLayer.side === 'right' ? flipLayer.toIdx : flipLayer.fromIdx)
    : rightPhotos(spreadIdx);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>

      {/* ── Book container ── */}
      <div style={{
        position: 'relative',
        width: `${cW}px`,
        height: `${cH}px`,
        maxWidth: '96vw',
        perspective: '1600px',
        // Fill the page region (spine seam + margins) with the cover color
        background: isClosed ? 'transparent' : '#423333',
        transition: bookState === 'opening'
          ? `width ${COVER_OUT}ms ease-in-out, height ${COVER_OUT}ms ease-in-out, background ${COVER_OUT}ms ease-in-out`
          : 'none',
      }}>

        {/* ── Inside spread (left + right pages) — fades in + rises up in Phase 2 ── */}
        {isOpen && (
          <div ref={spreadRef} style={{ position: 'absolute', inset: 0 }}>
            {/* Left page */}
            <div style={{
              position: 'absolute', ...LEFT_AREA, overflow: 'hidden',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.25)',
            }}>
              <img src={leftPageImg} alt="" aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <AlbumPage photos={leftDisplay} side="left" onOpenLightbox={onOpenLightbox} />
              </div>
            </div>

            {/* Right page */}
            <div style={{
              position: 'absolute', ...RIGHT_AREA, overflow: 'hidden',
              boxShadow: '4px 0 16px rgba(0,0,0,0.25)',
            }}>
              <img src={rightPageImg} alt="" aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                {rightDisplay.length > 0 && (
                  <AlbumPage photos={rightDisplay} side="right" onOpenLightbox={onOpenLightbox} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Flip layer — one page animating mid-turn ──
            Positioned over whichever half is flipping.
            Carries a snapshot of the OLD content.
            rotateY(-180) with:
              right page → transform-origin: left center  (page sweeps left)
              left page  → transform-origin: right center (page sweeps right)
        */}
        {flipLayer && (
          // Flip container — no backface on this element, children handle it
          <div
            ref={flipRef}
            style={{
              position: 'absolute',
              ...(flipLayer.side === 'right' ? RIGHT_AREA : LEFT_AREA),
              zIndex: 20,
              transformStyle: 'preserve-3d',
              transformOrigin: flipLayer.side === 'right' ? 'left center' : 'right center',
            }}
          >
            {/* ── Front face: old page content (shown 0° → 90°) ──
                Visibility is toggled at the 90° edge by the flip animation's onUpdate
                (see effect above) rather than via backface-visibility, which Firefox
                drops on these clipped 3D layers — leaving both faces drawn at once. */}
            <div ref={frontFaceRef} style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              visibility: 'visible',
            }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <img
                  src={flipLayer.side === 'right' ? rightPageImg : leftPageImg}
                  alt="" aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
                <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                  <AlbumPage photos={flipLayer.frontPhotos} side={flipLayer.side} onOpenLightbox={onOpenLightbox} />
                </div>
              </div>
            </div>

            {/* ── Back face: landing-side content (shown 90° → 180°) ──
                Pre-rotated 180° so its content isn't mirrored once the leaf lands.
                Hidden until the 90° edge, then revealed by the animation's onUpdate. */}
            <div ref={backFaceRef} style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              visibility: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <img
                  src={flipLayer.side === 'right' ? leftPageImg : rightPageImg}
                  alt="" aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
                <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                  {flipLayer.side === 'right'
                    ? <AlbumPage photos={leftPhotos(flipLayer.toIdx)}  side="left"  onOpenLightbox={onOpenLightbox} />
                    : <AlbumPage photos={rightPhotos(flipLayer.toIdx)} side="right" onOpenLightbox={onOpenLightbox} />
                  }
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ── 3D book cover (techprep-gh/3d-book-animation technique) ──
            Structure: perspective wrapper → book3d (preserve-3d, rotates Y)
              ├─ Front cover   (book_cover.png, flips open via Anime.js)
              ├─ Pages / spine (white rectangle at right edge, rotateY 90°)
              └─ Back cover    (dark, pushed back translateZ(-SPINE_W))
        */}
        {bookState !== 'open' && (
          <div
            ref={coverSceneRef}
            style={{
              // Fixed portrait size, centered via auto margins so it keeps its
              // shape even while the container resizes to the landscape spread.
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0, margin: 'auto',
              width: `${CLOSED_W}px`, height: `${CLOSED_H}px`,
              zIndex: 30,
              perspective: '900px',
              perspectiveOrigin: 'center center',
            }}
          >
            {/* 3D book assembly — flat by default, tilts on hover to reveal depth */}
            <div
              ref={book3dRef}
              onMouseEnter={() => isClosed && setBookHovered(true)}
              onMouseLeave={() => setBookHovered(false)}
              style={{
                position: 'relative',
                width: '100%', height: '100%',
                transformStyle: 'preserve-3d',
                // Flat at rest → tilt on hover → face viewer when opening
                transform: isClosed
                  ? (bookHovered ? 'rotateY(-30deg)' : 'rotateY(0deg)')
                  : 'rotateY(0deg)',
                transition: 'transform 0.4s ease',
              }}
            >

              {/* ── Front cover ── */}
              <div
                onClick={handleOpen}
                style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformOrigin: 'left center',
                  cursor: bookState === 'opening' ? 'default' : 'pointer',
                  overflow: 'hidden',
                  borderRadius: '2px',
                  boxShadow: '5px 5px 20px rgba(46,46,46,0.7)',
                }}
              >
                <img src={bookCoverImg} alt="Photo album cover"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
                <div style={{
                  position: 'relative', zIndex: 1, height: '100%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '18px',
                }}>
                  <p style={{
                    fontFamily: '"Lavishly Yours", cursive',
                    fontSize: 'clamp(24px, 6vw, 46px)',
                    color: '#f5dfa5',
                    textShadow: '0 2px 20px rgba(251,191,36,0.5)',
                    letterSpacing: '0.04em', lineHeight: 1,
                  }}>Memories</p>
                </div>
              </div>

              {/* Spine and back cover only needed for the closed 3D visual — hidden once opening starts */}
              {isClosed && (
                <>
                  {/* ── Pages / Spine — white stacked-pages effect ──
                      translateX uses absolute px (not %) because transform % is
                      relative to the element's own width, not the parent. */}
                  <div style={{
                    position: 'absolute',
                    height: `calc(100% - 6px)`,
                    width: `${SPINE_W}px`,
                    top: '3px',
                    transform: `translateX(${CLOSED_W - SPINE_W / 2 - 3}px) rotateY(90deg) translateX(${SPINE_W / 2}px)`,
                    background: `repeating-linear-gradient(
                      to bottom,
                      #ffffff 0px,
                      #ffffff 5px,
                      #e8e8e8 5px,
                      #e8e8e8 6px
                    )`,
                  }} />

                  {/* ── Back cover — pushed back by spine depth ── */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #0e0503 0%, #1a0a03 50%, #0e0503 100%)',
                    transform: `translateZ(-${SPINE_W}px)`,
                    boxShadow: `-10px 0 50px 10px rgba(0,0,0,0.8)`,
                    borderRadius: '2px',
                  }} />
                </>
              )}

            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handlePrev}
              disabled={spreadIdx === 0 || isFlipping}
              aria-label="Previous spread"
              style={{
                background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', opacity: spreadIdx === 0 ? 0.3 : 1,
                cursor: (spreadIdx === 0 || isFlipping) ? 'default' : 'pointer',
                backdropFilter: 'blur(4px)', transition: 'opacity 0.2s',
              }}
            >
              <Icon icon="mdi:chevron-left" width={20} height={20} />
            </button>

            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: numSpreads }, (_, i) => (
                <div key={i} style={{
                  width: i === spreadIdx ? '18px' : '5px', height: '5px',
                  borderRadius: '3px',
                  background: i === spreadIdx ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                  transition: 'width 0.3s ease, background 0.3s ease',
                }} />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={spreadIdx === numSpreads - 1 || isFlipping}
              aria-label="Next spread"
              style={{
                background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', opacity: spreadIdx === numSpreads - 1 ? 0.3 : 1,
                cursor: (spreadIdx === numSpreads - 1 || isFlipping) ? 'default' : 'pointer',
                backdropFilter: 'blur(4px)', transition: 'opacity 0.2s',
              }}
            >
              <Icon icon="mdi:chevron-right" width={20} height={20} />
            </button>
          </div>
      )}
    </div>
  );
}
