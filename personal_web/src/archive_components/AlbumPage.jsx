import PhotoCard from './PhotoCard';

// Vertical zigzag: both pages lean left-right-left.
const ALIGN_RIGHT = ['flex-start', 'flex-end', 'flex-start']; // left-right-left
const ALIGN_LEFT  = ['flex-start', 'flex-end', 'flex-start']; // left-right-left

export default function AlbumPage({ photos, side = 'right', onOpenLightbox }) {
  if (!photos?.length) return null;

  const align = side === 'left' ? ALIGN_LEFT : ALIGN_RIGHT;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      height: '100%',
      padding: '22px 34px',
    }}>
      {photos.map((photo, i) => (
        <div key={photo.id} style={{ display: 'flex', justifyContent: align[i] }}>
          <PhotoCard photo={photo} index={i} eager onOpenLightbox={onOpenLightbox} />
        </div>
      ))}
    </div>
  );
}
