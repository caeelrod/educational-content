import { useId, type ReactNode } from 'react';
import { P_MAX, Q_MAX, pAt, shifted, useNarrow, type Curve } from './market';

// A price–quantity chart. Economists put price on the vertical axis and quantity on the
// horizontal one, so every helper here takes (quantity, price) in that order.
export type Scale = { x: (q: number) => number; y: (p: number) => number; W: number; H: number; L: number; R: number; T: number; B: number; narrow: boolean };

type Props = {
 label: string;
 children: (s: Scale) => ReactNode;
 numbers?: boolean;
 qMax?: number;
 pMax?: number;
 qStep?: number;
 // Draw at phone proportions even on wide screens, for charts that share a row with text.
 compact?: boolean;
 qTitle?: string;
 pTitle?: string;
 caption?: ReactNode;
 // Clicking or tapping the chart picks a price at that height.
 onPrice?: (p: number) => void;
};

export default function Chart({ label, children, numbers = true, qMax = Q_MAX, pMax = P_MAX, qStep: qStepIn, compact, qTitle, pTitle, caption, onPrice }: Props) {
 const narrow = useNarrow() || !!compact;
 const clip = `sd-clip-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
 const W = narrow ? 380 : 640, H = narrow ? 340 : 380, L = numbers ? 50 : 30, R = 18, T = 14, B = 44;
 const x = (q: number) => L + q / qMax * (W - L - R);
 const y = (p: number) => T + (1 - p / pMax) * (H - T - B);
 const s: Scale = { x, y, W, H, L, R, T, B, narrow };
 const qStep = qStepIn ?? (narrow ? 6 : 4), pStep = narrow ? 2 : 1;
 const qTicks = Array.from({ length: Math.floor(qMax / qStep) + 1 }, (_, k) => k * qStep);
 const pTicks = Array.from({ length: Math.floor(pMax / pStep) + 1 }, (_, k) => k * pStep);

 function pick(e: React.PointerEvent<SVGSVGElement>) {
  if (!onPrice) return;
  const box = e.currentTarget.getBoundingClientRect();
  const vy = (e.clientY - box.top) / box.height * H;
  onPrice(Math.min(pMax, Math.max(0, (1 - (vy - T) / (H - T - B)) * pMax)));
 }

 return <figure className="sd-figure">
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={onPrice ? 'sd-pickable' : undefined}
   onPointerDown={pick} onPointerMove={e => { if (e.buttons && e.pointerType !== 'touch') pick(e); }}>
   <defs><clipPath id={clip}><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath></defs>
   {numbers && pTicks.map(p => <g key={`p${p}`} className="sd-tick"><line className="sd-grid" x1={L} x2={W - R} y1={y(p)} y2={y(p)} /><text x={L - 8} y={y(p)} dy="0.35em" textAnchor="end">${p}</text></g>)}
   {numbers && qTicks.map(q => <g key={`q${q}`} className="sd-tick"><line x1={x(q)} x2={x(q)} y1={H - B} y2={H - B + 4} /><text x={x(q)} y={H - B + 17} textAnchor="middle">{q}</text></g>)}
   <line className="sd-axis" x1={L} x2={W - R} y1={H - B} y2={H - B} />
   <line className="sd-axis" x1={L} x2={L} y1={T} y2={H - B} />
   <text className="sd-axis-title" x={W - R} y={H - 6} textAnchor="end">{qTitle ?? (narrow ? 'Quantity (thousand boxes/week)' : 'Quantity (thousands of boxes per week)')}</text>
   <text className="sd-axis-title" x={-(T + 2)} y={12} transform="rotate(-90)" textAnchor="end">{pTitle ?? 'Price ($ per box)'}</text>
   <g clipPath={`url(#${clip})`}>{children(s)}</g>
  </svg>
  {caption && <figcaption>{caption}</figcaption>}
 </figure>;
}

// A straight-line curve. `shift` slides it sideways with a CSS transition, so a shift
// on screen looks like the whole curve moving rather than a new line appearing.
export function Line({ s, c, kind, shift = 0, ghost, name }: { s: Scale; c: Curve; kind: 'd' | 's'; shift?: number; ghost?: boolean; name?: string }) {
 const p0 = -1, p1 = P_MAX + 1;
 const dx = s.x(shift) - s.x(0);
 // Put the name near the low-price end of demand and the high-price end of supply, kept on screen.
 const at = shifted(c, shift);
 let lq = kind === 'd' ? at.q0 + at.slope * 1 : at.q0 + at.slope * 8;
 lq = Math.min(Q_MAX - 1.2, Math.max(0.6, lq));
 const lp = Math.min(P_MAX - 0.4, pAt(at, lq));
 return <g className={`sd-curve ${kind}${ghost ? ' ghost' : ''}`}>
  <g className="sd-slide" style={{ transform: `translateX(${dx}px)` }}>
   <line x1={s.x(c.q0 + c.slope * p0)} y1={s.y(p0)} x2={s.x(c.q0 + c.slope * p1)} y2={s.y(p1)} />
  </g>
  {name && <text className="sd-curve-label" x={s.x(lq) + (kind === 'd' ? 6 : -8)} y={s.y(lp)} dy="-0.5em" textAnchor={kind === 'd' ? 'start' : 'end'}>{name}</text>}
 </g>;
}

export function Dot({ s, q, p, cls = '', label, guides, side = 'right' }: { s: Scale; q: number; p: number; cls?: string; label?: string; guides?: boolean; side?: 'left' | 'right' }) {
 return <g className={`sd-point ${cls}`}>
  {guides && <><line className="sd-guide" x1={s.L} x2={s.x(q)} y1={s.y(p)} y2={s.y(p)} /><line className="sd-guide" x1={s.x(q)} x2={s.x(q)} y1={s.y(p)} y2={s.H - s.B} /></>}
  <circle cx={s.x(q)} cy={s.y(p)} r={6} />
  {label && <text x={s.x(q) + (side === 'right' ? 10 : -10)} y={s.y(p)} dy="-0.6em" textAnchor={side === 'right' ? 'start' : 'end'}>{label}</text>}
 </g>;
}

// A horizontal price line, with the gap between quantity supplied and demanded drawn on it.
export function PriceLine({ s, p, qd, qs, cls = '', label }: { s: Scale; p: number; qd?: number; qs?: number; cls?: string; label?: string }) {
 const gap = qd !== undefined && qs !== undefined && Math.abs(qd - qs) > 0.05;
 const lo = Math.min(qd ?? 0, qs ?? 0), hi = Math.max(qd ?? 0, qs ?? 0);
 const kind = qd !== undefined && qs !== undefined && qd > qs ? 'shortage' : 'surplus';
 return <g className={`sd-price ${cls}`}>
  <line className="sd-price-line" x1={s.L} x2={s.W - s.R} y1={s.y(p)} y2={s.y(p)} />
  {gap && <>
   <line className={`sd-gap ${kind}`} x1={s.x(lo)} x2={s.x(hi)} y1={s.y(p)} y2={s.y(p)} />
   <text className={`sd-gap-label ${kind}`} x={(s.x(lo) + s.x(hi)) / 2} y={s.y(p)} dy={p > 1.5 ? '1.5em' : '-0.9em'} textAnchor="middle">{kind}</text>
  </>}
  {label && <text className="sd-price-label" x={s.W - s.R - 4} y={s.y(p)} dy="-0.5em" textAnchor="end">{label}</text>}
 </g>;
}
