export function groupByDay(photos) {
  return _group(photos, p =>
    new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  );
}

export function groupByMonth(photos) {
  return _group(photos, p =>
    new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', year: 'numeric',
    })
  );
}

export function groupByYear(photos) {
  return _group(photos, p =>
    String(new Date(p.date + 'T00:00:00').getFullYear())
  );
}

function _group(photos, keyFn) {
  const map = new Map();
  for (const photo of photos) {
    const label = keyFn(photo);
    if (!map.has(label)) map.set(label, []);
    map.get(label).push(photo);
  }
  return Array.from(map.entries()).map(([label, photos]) => ({ label, photos }));
}
