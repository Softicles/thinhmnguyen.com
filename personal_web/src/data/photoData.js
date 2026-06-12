const photoModules = import.meta.glob('../assets/photos/*.jpg', { eager: true });

// Edit this array to update photo metadata.
// Add new photos: drop the file into src/assets/photos/ then add an entry here.
// date format: 'YYYY-MM-DD'
const photoMeta = [
  { filename: 'IMG_0179.jpg', title: '', date: '2023-10-12', location: '', description: 'On top of the Interdisciplinary building at USF' },
  { filename: 'IMG_0205.jpg', title: '', date: '2023-10-15', location: '', description: 'High-quality piano, I missed it!' },
  { filename: 'IMG_0320.jpg', title: '', date: '2023-11-23', location: '', description: 'Cozy common area of my 1st year dorm' },
  { filename: 'IMG_0389.jpg', title: '', date: '2023-12-23', location: '', description: 'Winter break at my brother\'s house' },
  { filename: 'IMG_0659.jpg', title: '', date: '2024-04-27', location: '', description: 'About to have Finals at 8am' },
  { filename: 'IMG_0681.jpg', title: '', date: '2024-05-01', location: '', description: 'Late night walk, about to get the pond water for my chemistry lab tomorrow morning' },
  { filename: 'IMG_0686.jpg', title: '', date: '2024-05-04', location: '', description: 'Universal - Orlando' },
  { filename: 'IMG_0689.jpg', title: '', date: '2024-05-04', location: '', description: '' },
  { filename: 'IMG_0766.jpg', title: '', date: '2024-07-03', location: '', description: 'First run in Midtown Atlanta??' },
  // { filename: 'IMG_0767.jpg', title: '', date: '2024-06-16', location: '', description: '' },
  { filename: 'IMG_0770.jpg', title: '', date: '2024-07-03', location: '', description: '' },
  { filename: 'IMG_0933.jpg', title: '', date: '2024-11-10', location: '', description: '' },
  { filename: 'IMG_0934.jpg', title: '', date: '2024-11-10', location: '', description: '' },
  { filename: 'IMG_1033.jpg', title: '', date: '2025-01-01', location: '', description: '' },
  // { filename: 'IMG_1034.jpg', title: '', date: '2024-08-11', location: '', description: '' },
  { filename: 'IMG_1035.jpg', title: '', date: '2025-01-01', location: '', description: '' },
  { filename: 'IMG_1109.jpg', title: '', date: '2025-03-09', location: '', description: '' },
  { filename: 'IMG_1136.jpg', title: '', date: '2025-03-29', location: '', description: '' },
  // { filename: 'IMG_1153.jpg', title: '', date: '2024-10-05', location: '', description: '' },
  { filename: 'IMG_1154.jpg', title: '', date: '2025-04-05', location: '', description: '' },
  { filename: 'IMG_1170.jpg', title: '', date: '2025-04-22', location: '', description: '' },
  { filename: 'IMG_1192.jpg', title: '', date: '2025-07-05', location: '', description: '' },
  { filename: 'IMG_1193.jpg', title: '', date: '2025-07-05', location: '', description: '' },
  { filename: 'IMG_1401.jpg', title: '', date: '2025-11-07', location: '', description: '' },
  { filename: 'IMG_1436.jpg', title: '', date: '2025-11-22', location: '', description: '' },
  { filename: 'IMG_1438.jpg', title: '', date: '2025-11-23', location: '', description: '' },
  // { filename: 'IMG_1439.jpg', title: '', date: '2025-01-21', location: '', description: '' },
  { filename: 'IMG_1440.jpg', title: '', date: '2025-11-23', location: '', description: '' },
  { filename: 'IMG_1460.jpg', title: '', date: '2025-12-21', location: '', description: '' },
  { filename: 'IMG_1461.jpg', title: '', date: '2025-12-21', location: '', description: '' },
  { filename: 'IMG_1462.jpg', title: '', date: '2025-12-21', location: '', description: '' },
  { filename: 'IMG_1729.jpg', title: '', date: '2026-04-30', location: '', description: '' },
  { filename: 'IMG_0296.jpg', title: '', date: '2023-11-19', location: '', description: '' },
  { filename: 'IMG_0303.jpg', title: '', date: '2023-11-19', location: '', description: '' },
  { filename: 'IMG_0317.jpg', title: '', date: '2023-11-23', location: '', description: '' },
  { filename: 'IMG_0536.jpg', title: '', date: '2024-03-09', location: '', description: '' },
  { filename: 'IMG_0985.jpg', title: '', date: '2024-12-17', location: '', description: '' },
  { filename: 'IMG_1043.jpg', title: '', date: '2025-01-10', location: '', description: '' },
  { filename: 'IMG_1047.jpg', title: '', date: '2025-01-10', location: '', description: '' },
  { filename: 'IMG_1589.jpg', title: '', date: '2026-03-20', location: '', description: '' },
  { filename: 'IMG_1771.jpg', title: '', date: '2026-05-29', location: '', description: '' },
  { filename: 'IMG_1753.jpg', title: '', date: '2026-05-16', location: '', description: '' },
  { filename: 'IMG_1783.jpg', title: '', date: '2026-06-02', location: '', description: '' },
  { filename: 'IMG_1802.jpg', title: '', date: '2026-06-08', location: '', description: '' },
  { filename: 'IMG_1492.jpg', title: '', date: '2026-01-05', location: '', description: '' },
  { filename: 'IMG_1700.jpg', title: '', date: '2026-04-25', location: '', description: '' },
  { filename: 'IMG_1701.jpg', title: '', date: '2026-04-25', location: '', description: '' },
  { filename: 'IMG_1711.jpg', title: '', date: '2026-04-25', location: '', description: '' },
  { filename: 'IMG_1570.jpg', title: '', date: '2026-02-22', location: '', description: '' },
];

export const photos = photoMeta
  .map((meta, idx) => {
    const key = `../assets/photos/${meta.filename}`;
    const mod = photoModules[key];
    const src = mod ? (mod.default ?? mod) : '';
    return {
      id: idx + 1,
      src,
      alt: meta.title || `Photo ${idx + 1}`,
      ...meta,
    };
  })
  .filter(p => p.src)
  .sort((a, b) => new Date(b.date) - new Date(a.date));
