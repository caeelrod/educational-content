import { useEffect, useRef, useState } from 'react';

// On narrow screens wide drawings scroll sideways; start them scrolled to the middle, where the action is.
export function useCentered<T extends HTMLElement>() {
 const ref = useRef<T>(null);
 useEffect(() => { const el = ref.current; if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2; }, []);
 return ref;
}

export function useReducedMotion() {
 const query = '(prefers-reduced-motion: reduce)';
 const [reduce, setReduce] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
 useEffect(() => {
  const m = matchMedia(query), on = () => setReduce(m.matches);
  m.addEventListener('change', on);
  return () => m.removeEventListener('change', on);
 }, []);
 return reduce;
}

// Calls tick(seconds since last frame) on every animation frame while running.
export function useFrames(running: boolean, tick: (dt: number) => void) {
 const cb = useRef(tick);
 cb.current = tick;
 useEffect(() => {
  if (!running) return;
  let last = performance.now(), id = 0;
  const step = (now: number) => { cb.current(Math.min(0.1, (now - last) / 1000)); last = now; id = requestAnimationFrame(step); };
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
 }, [running]);
}

export const near = (a: number, b: number, tol = 0.03) => Math.abs(a - b) <= Math.max(Math.abs(b) * tol, 1e-9);
export function parseNum(s: string) {
 const t = s.trim().replace(/,/g, '').replace(/\s*(cm|centimeters?)(\s*(\/|per)\s*(yr|year))?\s*$/i, '');
 if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
 return Number(t);
}
