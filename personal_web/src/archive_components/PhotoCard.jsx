const ROTATIONS = ['-1.5deg', '1.2deg', '-0.8deg', '1.8deg', '-1.1deg', '0.9deg'];

export default function PhotoCard({ photo, index = 0, eager = false, onOpenLightbox }) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <button
      className="photo-card-polaroid"
      style={{
        transform: `rotate(${rotation})`,
        padding: '5px 5px 18px 5px',
        background: '#fff',
        cursor: 'pointer',
        border: 'none',
        textAlign: 'center',
        width: '130px',
        flexShrink: 0,
      }}
      onClick={() => onOpenLightbox(photo)}
      aria-label={`Open photo: ${photo.alt}`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading={eager ? 'eager' : 'lazy'}
        // Ignore (bogus) EXIF orientation; the raw pixels are already upright.
        style={{ display: 'block', width: '100%', height: '90px', objectFit: 'cover', imageOrientation: 'none' }}
        onError={e => { e.target.style.background = '#e5e7eb'; e.target.src = ''; }}
      />
      <p style={{
        marginTop: '4px',
        fontSize: '9px',
        color: '#555',
        fontFamily: 'serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}>
        {photo.title}
      </p>
    </button>
  );
}
