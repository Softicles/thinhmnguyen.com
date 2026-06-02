import { useEffect, useRef, useState, useCallback } from 'react';
import { tracks } from '../data/tracks';

// Drives a single <Audio> element across a playlist for the control panel.
// No autoplay — playback only starts on an explicit user Play. Prev/Next cycle
// (wrapping) through `tracks`, preserving the play/pause state. With a single
// track the element loops; with several it advances on `ended`.
export default function useAudioPlayer(initialVolume = 0.6) {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [available, setAvailable] = useState(false);

  const singleTrack = tracks.length <= 1;

  // Keep a ref to "advance" so the `ended` listener stays stable.
  const advanceRef = useRef(() => {});

  // ── Create the audio element once ──
  useEffect(() => {
    const audio = new Audio();
    audio.loop = singleTrack;
    audio.volume = initialVolume;
    audio.src = tracks[0]?.src ?? '';
    audio.preload = 'auto';

    const onReady = () => setAvailable(true);
    const onError = () => setAvailable(false);
    const onEnded = () => { if (!singleTrack) advanceRef.current(); };

    audio.addEventListener('canplaythrough', onReady);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', onReady);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
    // initialVolume / singleTrack are stable for the component's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Swap the source when the track changes, keeping play/pause state ──
  // Skips the very first render so we don't trigger playback before a user Play.
  const didMount = useRef(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!didMount.current) { didMount.current = true; return; }

    audio.src = tracks[currentIndex]?.src ?? '';
    if (isPlaying) audio.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [available, isPlaying]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((i) => (i + 1) % tracks.length);
  }, []);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
  }, []);

  advanceRef.current = next;

  const setVolume = useCallback((v) => {
    const audio = audioRef.current;
    const clamped = Math.min(1, Math.max(0, v));
    if (audio) audio.volume = clamped;
    setVolumeState(clamped);
  }, []);

  return {
    currentTrack: tracks[currentIndex] ?? null,
    isPlaying,
    volume,
    available,
    togglePlay,
    next,
    prev,
    setVolume,
  };
}
