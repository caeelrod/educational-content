import { useEffect, useRef, useState, type ReactNode } from 'react';

// Gravitational field strength used everywhere in the lesson, as in OpenStax Physics.
export const G = 9.8;

// Rounded number with a real minus sign, trimming trailing zeros ("2.50" → "2.5").
export function fmt(x: number, digits = 2) {
 if (Math.abs(x) < 0.5 * 10 ** -digits) x = 0;
 let s = x.toFixed(digits);
 if (s.includes('.')) s = s.replace(/\.?0+$/, '');
 return s.replace('-', '−');
}

export const V = ({ children }: { children: ReactNode }) => <i className="nl-var">{children}</i>;

// One color per kind of force, used for arrows, chips, and labels across every part.
export type ForceKind = 'gravity' | 'normal' | 'friction' | 'applied' | 'tension' | 'air' | 'net';
export const forceNames: Record<ForceKind, string> = {
 gravity: 'Gravity (weight)', normal: 'Normal force', friction: 'Friction', applied: 'Applied push or pull',
 tension: 'Tension', air: 'Air resistance', net: 'Net force'
};

// An arrow from (x, y) with components (dx, dy) in drawing units. Zero-length arrows draw nothing.
export function Arrow({ x, y, dx, dy, kind, label, labelSide = 'end', dashed }: {
 x: number; y: number; dx: number; dy: number; kind: ForceKind; label?: string; labelSide?: 'end' | 'left' | 'right' | 'above'; dashed?: boolean;
}) {
 const len = Math.hypot(dx, dy);
 if (len < 2) return null;
 const ux = dx / len, uy = dy / len, head = Math.min(11, len * 0.6);
 const bx = x + dx - ux * head, by = y + dy - uy * head;
 const px = -uy * head * 0.55, py = ux * head * 0.55;
 let tx = x + dx + ux * 14, ty = y + dy + uy * 14 + 4, anchor: 'start' | 'middle' | 'end' = Math.abs(ux) > 0.5 ? (ux > 0 ? 'start' : 'end') : 'middle';
 if (labelSide === 'above') { tx = x + dx / 2; ty = y + dy / 2 - 10; anchor = 'middle'; }
 else if (labelSide !== 'end') { tx = x + dx / 2 + (labelSide === 'right' ? 12 : -12); ty = y + dy / 2 + 4; anchor = labelSide === 'right' ? 'start' : 'end'; }
 return <g className={`nl-arrow nl-f-${kind}`}>
  <line x1={x} y1={y} x2={bx} y2={by} strokeDasharray={dashed ? '6 4' : undefined} />
  <polygon points={`${x + dx},${y + dy} ${bx + px},${by + py} ${bx - px},${by - py}`} />
  {label && <text x={tx} y={ty} textAnchor={anchor}>{label}</text>}
 </g>;
}

// Runs tick(dt) once per animation frame while running is true. dt is in seconds, capped so a
// background tab doesn't make objects jump.
export function useLoop(running: boolean, tick: (dt: number) => void) {
 const ref = useRef(tick);
 ref.current = tick;
 useEffect(() => {
  if (!running) return;
  let id = 0, last = performance.now();
  const frame = (now: number) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; ref.current(dt); id = requestAnimationFrame(frame); };
  id = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(id);
 }, [running]);
}

function useMedia(query: string) {
 const [on, setOn] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
 useEffect(() => {
  if (typeof matchMedia === 'undefined') return;
  const m = matchMedia(query), change = () => setOn(m.matches);
  m.addEventListener('change', change);
  return () => m.removeEventListener('change', change);
 }, [query]);
 return on;
}
// True on phone-width screens, so drawings can use a narrower viewBox and keep labels readable.
export const useNarrow = () => useMedia('(max-width: 560px)');
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');

// "Nice" tick values covering lo..hi.
export function ticks(lo: number, hi: number, count = 5) {
 const span = hi - lo || 1, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw));
 const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= count) ?? mag * 10;
 const out: number[] = [];
 for (let t = Math.ceil(lo / step - 1e-9) * step; t <= hi + 1e-9; t += step) out.push(Math.abs(t) < 1e-12 ? 0 : +t.toFixed(10));
 return out;
}

// A small line graph of y against t, used for speed and scale readings.
export function TimeGraph({ points, tMax, yMin, yMax, yLabel, tLabel = 'time (s)', guide, guideLabel, label, narrow }: {
 points: { t: number; y: number }[]; tMax: number; yMin: number; yMax: number; yLabel: string; tLabel?: string;
 guide?: number; guideLabel?: string; label: string; narrow?: boolean;
}) {
 const W = narrow ? 380 : 640, H = narrow ? 230 : 200, X0 = 50, X1 = W - 14, Y0 = H - 32, Y1 = 14;
 const t0 = Math.max(0, tMax - (narrow ? 8 : 12)), t1 = Math.max(tMax, t0 + (narrow ? 8 : 12));
 const x = (t: number) => X0 + (t - t0) / (t1 - t0) * (X1 - X0);
 const y = (v: number) => Y0 - (v - yMin) / (yMax - yMin) * (Y0 - Y1);
 const shown = points.filter(p => p.t >= t0);
 return <figure className="nl-figure">
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
   <line className="nl-axis" x1={X0} x2={X1} y1={Y0} y2={Y0} />
   <line className="nl-axis" x1={X0} x2={X0} y1={Y1} y2={Y0} />
   {ticks(yMin, yMax, 4).map(v => <g key={v} className="nl-tick"><line x1={X0 - 4} x2={X1} y1={y(v)} y2={y(v)} className={v === 0 ? 'zero' : ''} /><text x={X0 - 8} y={y(v)} dy="0.35em" textAnchor="end">{fmt(v, 1)}</text></g>)}
   {ticks(t0, t1, narrow ? 4 : 6).map(t => <g key={t} className="nl-tick"><line x1={x(t)} x2={x(t)} y1={Y0} y2={Y0 + 4} /><text x={x(t)} y={Y0 + 18} textAnchor="middle">{fmt(t, 1)}</text></g>)}
   <text className="nl-axis-title" x={X1} y={H - 2} textAnchor="end">{tLabel}</text>
   <text className="nl-axis-title" x={X0 + 6} y={Y1 + 2} dy="0.35em">{yLabel}</text>
   {guide !== undefined && <><line className="nl-guide" x1={X0} x2={X1} y1={y(guide)} y2={y(guide)} />{guideLabel && <text className="nl-guide-label" x={X1 - 4} y={y(guide) - 6} textAnchor="end">{guideLabel}</text>}</>}
   {shown.length > 1 && <polyline className="nl-trace" points={shown.map(p => `${x(p.t)},${y(Math.max(yMin, Math.min(yMax, p.y)))}`).join(' ')} />}
   {shown.length > 0 && <circle className="nl-trace-dot" cx={x(shown[shown.length - 1].t)} cy={y(Math.max(yMin, Math.min(yMax, shown[shown.length - 1].y)))} r={4.5} />}
  </svg>
 </figure>;
}

export const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
export const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
