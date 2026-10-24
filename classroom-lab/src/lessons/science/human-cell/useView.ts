import { useEffect, useRef, useState } from 'react';
import type { View } from './geometry';

export const reducedMotion = () =>
 typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

// Glides from the current view to the target: centre moves in a straight line while the width
// changes on a log scale, so zooming in and out feel equally quick. Snaps under reduced motion.
export function useView(target: View, ms = 650): [View, boolean] {
 const [view, setView] = useState(target);
 const [moving, setMoving] = useState(false);
 const current = useRef(target);
 useEffect(() => {
  const from = current.current;
  if (reducedMotion() || (from.x === target.x && from.y === target.y && from.w === target.w)) {
   current.current = target; setView(target); setMoving(false); return;
  }
  let frame = 0;
  const t0 = performance.now();
  setMoving(true);
  const step = (now: number) => {
   const k = Math.min(1, (now - t0) / ms), e = ease(k);
   const v = {
    x: from.x + (target.x - from.x) * e,
    y: from.y + (target.y - from.y) * e,
    w: Math.exp(Math.log(from.w) + (Math.log(target.w) - Math.log(from.w)) * e)
   };
   current.current = v;
   setView(v);
   if (k < 1) frame = requestAnimationFrame(step);
   else setMoving(false);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
 }, [target.x, target.y, target.w, ms]);
 return [view, moving];
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
export function speak(text: string) {
 if (!canSpeak) return;
 window.speechSynthesis.cancel();
 window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}
