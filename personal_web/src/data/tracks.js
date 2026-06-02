// Music playlist for the Photo Album control panel.
// Currently a single track; the array shape supports adding more later —
// each entry needs { id, name, url, src }. Drop new audio files in src/assets/
// and reference them with `new URL('../assets/<file>', import.meta.url).href`.
import song1 from '../assets/Oneul - Wildflowers.mp3';
import song2 from '../assets/Oneul - Surrounded By Love.mp3';

export const tracks = [
  {
    id: 'oneul',
    name: 'Oneul - Wideflowers',
    url: 'https://www.youtube.com/watch?v=Z4ppsIMfLvU&t=422s',
    src: song1,
  },
  {
    id: 'oneul',
    name: 'Oneul — Surrounded By Love',
    url: 'https://www.youtube.com/watch?v=nPdWL2ZZWpE',
    src: song2,
  },
];
