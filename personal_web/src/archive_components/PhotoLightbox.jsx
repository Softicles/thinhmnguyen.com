import { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { animate } from 'animejs';
import { Icon } from '@iconify/react';

export default function PhotoLightbox({ photo, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const closeRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const runClose = useCallback(() => {
    if (reducedMotion) { onClose(); return; }
    animate(overlayRef.current, { opacity: [1, 0], duration: 220, easing: 'easeInQuad' });
    animate(contentRef.current, {
      opacity: [1, 0], scale: [1, 0.9], duration: 220, easing: 'easeInQuad',
      onComplete: onClose,
    });
  }, [onClose, reducedMotion]);

  useEffect(() => {
    if (!reducedMotion) {
      animate(overlayRef.current, { opacity: [0, 1], duration: 280, easing: 'easeOutQuad' });
      animate(contentRef.current, {
        opacity: [0, 1], scale: [0.88, 1], duration: 320, easing: 'easeOutBack',
      });
    }
    closeRef.current?.focus();
  }, [reducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') runClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runClose, onPrev, onNext, hasPrev, hasNext]);

  // Focus trap
  const handleTabKey = e => {
    if (e.key !== 'Tab') return;
    const focusable = contentRef.current?.querySelectorAll('button');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  };

  const formattedDate = photo.date
    ? new Date(photo.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : '';

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="lightbox-overlay"
      onClick={e => { if (e.target === overlayRef.current) runClose(); }}
      onKeyDown={handleTabKey}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      style={{ opacity: 0 }}
    >
      {/* Close */}
      <button
        ref={closeRef}
        onClick={runClose}
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
      >
        <Icon icon="mdi:close" width={28} height={28} />
      </button>

      <div
        ref={contentRef}
        style={{ opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90vw', maxHeight: '90vh' }}
      >
        {/* Image — ignore (bogus) EXIF orientation; raw pixels are already upright. */}
        <img
          src={photo.src}
          alt={photo.alt}
          style={{ maxWidth: '80vw', maxHeight: '65vh', objectFit: 'contain', imageOrientation: 'none', borderRadius: '4px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
        />

        {/* Caption */}
        <div className="text-center mt-4 text-white" style={{ maxWidth: '500px' }}>
          <p style={{ fontSize: '18px', fontFamily: 'serif', marginBottom: '4px' }}>{photo.title}</p>
          {formattedDate && <p style={{ fontSize: '13px', opacity: 0.7 }}>{formattedDate}</p>}
          {photo.location && <p style={{ fontSize: '13px', opacity: 0.6 }}>📍 {photo.location}</p>}
          {photo.description && <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '6px' }}>{photo.description}</p>}
        </div>

        {/* Prev / Next */}
        <div className="flex gap-4 mt-5">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous photo"
            className="text-white/80 hover:text-white disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 18px', cursor: hasPrev ? 'pointer' : 'default' }}
          >
            <Icon icon="mdi:chevron-left" width={22} height={22} />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next photo"
            className="text-white/80 hover:text-white disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 18px', cursor: hasNext ? 'pointer' : 'default' }}
          >
            <Icon icon="mdi:chevron-right" width={22} height={22} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
