import { useEffect, useState } from 'react';

// The strawberry market used throughout the lesson. Quantities are thousands of boxes
// per week and prices are dollars per box. Every curve is a straight line written as
// quantity = q0 + slope × price, so a shift left or right just changes q0.
export type Curve = { q0: number; slope: number };
export const D0: Curve = { q0: 18, slope: -2 };
export const S0: Curve = { q0: -2, slope: 3 };
// Every shift in parts 3 and 5 moves a curve this far, which keeps the new prices whole dollars.
export const SHIFT = 5;
export const P_MAX = 10, Q_MAX = 24;

export const qAt = (c: Curve, p: number) => Math.max(0, c.q0 + c.slope * p);
export const shifted = (c: Curve, dq: number): Curve => ({ ...c, q0: c.q0 + dq });
// The price on a curve at quantity q (the height of the curve there).
export const pAt = (c: Curve, q: number) => (q - c.q0) / c.slope;
export function equilibrium(d: Curve, s: Curve) {
 const p = (d.q0 - s.q0) / (s.slope - d.slope);
 return { p, q: d.q0 + d.slope * p };
}

export const money = (p: number) => `$${p.toFixed(2)}`;
// 12.4 → "12,400 boxes"
export const boxes = (q: number) => `${Math.round(q * 1000).toLocaleString('en-US')} boxes`;
export const sayMoney = (p: number) => { const d = Math.floor(p + 1e-9), c = Math.round((p - d) * 100); return c ? `${d} dollars ${c} cents` : `${d} dollars`; };

export type Dir = -1 | 0 | 1;
export const word = (d: Dir) => d > 0 ? 'rises' : d < 0 ? 'falls' : 'stays the same';
// Direction of change from a to b, ignoring floating-point dust.
export const sign = (a: number, b: number): Dir => Math.abs(b - a) < 1e-9 ? 0 : b > a ? 1 : -1;

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// True on phone-width screens, so charts can use a narrower drawing and keep labels readable.
export function useNarrow() {
 const query = '(max-width: 560px)';
 const [narrow, setNarrow] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
 useEffect(() => {
  if (typeof matchMedia === 'undefined') return;
  const m = matchMedia(query), on = () => setNarrow(m.matches);
  m.addEventListener('change', on);
  return () => m.removeEventListener('change', on);
 }, []);
 return narrow;
}
