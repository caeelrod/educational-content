import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { freq } from './notes';

// All sound is made in the browser with the Web Audio API: no audio files and no network.
// Nothing plays until a student presses something, and mute / volume are shared by every activity.

type State = { muted: boolean; volume: number };
let state: State = { muted: false, volume: 0.7 };
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
function update(p: Partial<State>) { state = { ...state, ...p }; listeners.forEach(l => l()); }

export const useSound = () => useSyncExternalStore(subscribe, () => state, () => state);
export const isMuted = () => state.muted;

type AudioCtor = typeof AudioContext;
const Ctor: AudioCtor | undefined = typeof window === 'undefined' ? undefined
 : window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
export const canPlay = !!Ctor;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const level = () => state.muted ? 0 : state.volume ** 2 * 0.9; // squared so the slider feels even

function audio(): AudioContext | null {
 if (!Ctor || state.muted) return null;
 if (!ctx) {
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = level();
  // A compressor keeps chords and fast passages from getting harsh or too loud.
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  master.connect(comp).connect(ctx.destination);
 }
 if (ctx.state === 'suspended') void ctx.resume();
 return ctx;
}

function applyLevel() {
 if (ctx && master) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.02);
}
export function setMuted(muted: boolean) { update({ muted }); applyLevel(); if (muted) stopAll(); }
export function setVolume(volume: number) { update({ volume }); applyLevel(); }

type Voice = { stop: (at?: number) => void };
const live = new Set<Voice>();

type ToneOpts = { vel?: number; dur?: number; hold?: boolean };
// A soft, piano-like tone: a triangle wave plus a quiet octave, through a filter that mellows as it fades.
// `dur` schedules the release; without it the note rings until its voice is stopped (a held key).
// `hold` keeps a steady level instead of fading, so long and short notes are easy to tell apart.
function tone(c: AudioContext, midi: number, at: number, { vel = 0.8, dur, hold = false }: ToneOpts): Voice {
 const f = freq(midi);
 const g = c.createGain();
 const peak = 0.32 * vel;
 g.gain.setValueAtTime(0, at);
 g.gain.linearRampToValueAtTime(peak, at + 0.008);
 g.gain.setTargetAtTime(peak * (hold ? 0.55 : 0.35), at + 0.008, 0.18);
 if (!hold && (dur === undefined || dur > 0.5)) g.gain.setTargetAtTime(0.0001, at + 0.5, 1.6);
 const lp = c.createBiquadFilter();
 lp.type = 'lowpass';
 lp.frequency.setValueAtTime(Math.min(9000, f * 8), at);
 lp.frequency.setTargetAtTime(Math.min(4000, f * 3), at, 0.3);
 const o1 = c.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
 const o2 = c.createOscillator(); o2.frequency.value = f * 2;
 const g2 = c.createGain(); g2.gain.value = 0.22;
 o1.connect(lp); o2.connect(g2).connect(lp); lp.connect(g).connect(master!);
 o1.start(at); o2.start(at);
 // Calling stop() again on an oscillator replaces the earlier stop time, so a stop can come early.
 const end = (t: number) => { try { o1.stop(t); o2.stop(t); } catch { /* already ended */ } };
 let stopped = false;
 const voice: Voice = {
  stop(t = c.currentTime) {
   if (stopped) return;
   stopped = true;
   g.gain.cancelScheduledValues(t);
   g.gain.setTargetAtTime(0, Math.max(t, at), 0.05);
   end(Math.max(t, at) + 0.4);
   live.delete(voice);
  }
 };
 if (dur !== undefined) {
  g.gain.setTargetAtTime(0, at + dur, 0.05);
  end(at + dur + 0.4);
 } else end(at + 8); // a key held down still fades out on its own
 o1.onended = () => live.delete(voice);
 live.add(voice);
 return voice;
}

function tick(c: AudioContext, at: number, accent: boolean): Voice {
 const o = c.createOscillator(), g = c.createGain();
 o.frequency.value = accent ? 1568 : 1046;
 g.gain.setValueAtTime(0, at);
 g.gain.linearRampToValueAtTime(accent ? 0.3 : 0.18, at + 0.002);
 g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
 o.connect(g).connect(master!);
 o.start(at); o.stop(at + 0.08);
 const voice: Voice = { stop: t => { try { o.stop(t); } catch { /* already stopped */ } live.delete(voice); } };
 o.onended = () => live.delete(voice);
 live.add(voice);
 return voice;
}

// Starts a note now and returns a function that releases it (for keys held down).
export function noteOn(midi: number, vel = 0.8): () => void {
 const c = audio();
 if (!c) return () => {};
 const v = tone(c, midi, c.currentTime, { vel });
 return () => v.stop();
}

export function stopAll() {
 const t = ctx?.currentTime;
 [...live].forEach(v => v.stop(t));
}

export type Ev = { t: number; dur: number; midi?: number | number[]; vel?: number; hold?: boolean; click?: 'beat' | 'accent' };

// Schedules a list of sounds starting `offset` seconds from now. Returns a stopper.
function schedule(events: Ev[], offset: number): () => void {
 const c = audio();
 if (!c) return () => {};
 const base = c.currentTime + Math.max(0, offset);
 const voices: Voice[] = [];
 for (const e of events) {
  const at = base + e.t;
  if (e.click) voices.push(tick(c, at, e.click === 'accent'));
  const ms = e.midi === undefined ? [] : Array.isArray(e.midi) ? e.midi : [e.midi];
  ms.forEach(m => voices.push(tone(c, m, at, { vel: e.vel, dur: e.dur, hold: e.hold })));
 }
 return () => voices.forEach(v => v.stop());
}

// Plays a list of sounds and reports the elapsed time on every animation frame, so the page can
// light up each note as it sounds. The visuals run on their own clock, so they work when muted too.
export function usePlayer() {
 const [t, setT] = useState<number | null>(null);
 const run = useRef<{ frame: number; stops: (() => void)[] } | null>(null);

 const stop = useCallback(() => {
  if (run.current) { cancelAnimationFrame(run.current.frame); run.current.stops.forEach(s => s()); run.current = null; }
  setT(null);
 }, []);

 useEffect(() => {
  const hide = () => { if (document.hidden) stop(); };
  document.addEventListener('visibilitychange', hide);
  return () => { document.removeEventListener('visibilitychange', hide); stop(); };
 }, [stop]);

 const play = useCallback((events: Ev[], total: number, opts: { loop?: boolean; onEnd?: () => void } = {}) => {
  stop();
  const lead = 0.08;
  let t0 = performance.now() + lead * 1000;
  let queued = false; // whether the next loop has been scheduled yet
  const r = { frame: 0, stops: [schedule(events, lead)] };
  run.current = r;
  const step = () => {
   let el = (performance.now() - t0) / 1000;
   if (opts.loop && !queued && el > total - 0.2) { r.stops.push(schedule(events, total - el)); queued = true; }
   if (el >= total) {
    if (!opts.loop) { run.current = null; setT(null); opts.onEnd?.(); return; }
    t0 += total * 1000; el -= total; queued = false;
    r.stops = r.stops.slice(-1);
   }
   setT(Math.max(0, el));
   r.frame = requestAnimationFrame(step);
  };
  setT(0);
  r.frame = requestAnimationFrame(step);
 }, [stop]);

 return { t, playing: t !== null, play, stop };
}

export const reducedMotion = () =>
 typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
export function speak(text: string) {
 if (!canSpeak || state.muted) return;
 window.speechSynthesis.cancel();
 window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

// True on narrow screens, so the piano can show fewer, bigger keys.
export function useNarrow(px = 640) {
 const q = `(max-width: ${px}px)`;
 const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
 useEffect(() => {
  const m = window.matchMedia?.(q);
  if (!m) return;
  const on = () => setNarrow(m.matches);
  m.addEventListener('change', on);
  return () => m.removeEventListener('change', on);
 }, [q]);
 return narrow;
}
