import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import PhotoCard from './PhotoCard';

export default function PhotoGroupedView({ groupedData, onOpenLightbox }) {
  const containerRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.grouped-photo-card');
    if (!cards.length) return;

    // Reset before animating
    Array.from(cards).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });

    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(55),
      duration: 380,
      easing: 'easeOutQuad',
    });
  }, [groupedData, reducedMotion]);

  if (!groupedData?.length) {
    return <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>No photos yet.</p>;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
      {groupedData.map(({ label, photos }) => (
        <section key={label} style={{ marginBottom: '36px' }}>
          <h2
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              paddingBottom: '6px',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              fontFamily: 'serif',
              letterSpacing: '0.03em',
            }}
          >
            {label}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '16px',
            }}
          >
            {photos.map((photo, i) => (
              <div key={photo.id} className="grouped-photo-card">
                <PhotoCard photo={photo} index={i} onOpenLightbox={onOpenLightbox} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
