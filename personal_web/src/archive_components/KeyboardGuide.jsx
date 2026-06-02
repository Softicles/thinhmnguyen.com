import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

// Touch devices have no physical keyboard, so the hint bar is meaningless there.
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    'ontouchstart' in window);

export default function KeyboardGuide({ viewMode, atCover = false }) {
  const ref = useRef(null);
  // Page flipping only exists in the album view; grouped views just get ESC.
  const showFlipHints = viewMode === 'album';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { el.style.opacity = '1'; return; }
    animate(el, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      easing: 'easeOutCubic',
    });
  }, []);

  if (isTouchDevice()) return null;

  return (
    <div 
      ref={ref} 
      className="magic-guide" 
      style={{ 
        opacity: 0, 
        // Force the positioning to the top left corner!
        top: '20px', 
        left: '80px', 
        bottom: 'auto', 
        transform: 'none' 
      }} 
      aria-hidden="true"
    >
      {atCover ? (
        <>
          <span className="magic-guide-item">
            Press <kbd className="magic-key">Enter</kbd> to Start
          </span>
          <span className="magic-guide-sep">·</span>
          <span className="magic-guide-item">
            <kbd className="magic-key">B</kbd> see background
          </span>
        </>
      ) : (
        <>
          <span className="magic-guide-item">
            <kbd className="magic-key">ESC</kbd> back
          </span>
          {showFlipHints && (
            <>
              <span className="magic-guide-sep">·</span>
              <span className="magic-guide-item">
                <kbd className="magic-key">→</kbd> flip right
              </span>
              <span className="magic-guide-sep">·</span>
              <span className="magic-guide-item">
                <kbd className="magic-key">←</kbd> flip left
              </span>
            </>
          )}
        </>
      )}
    </div>
  );
}
