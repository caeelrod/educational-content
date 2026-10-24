import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type Ref } from 'react';
import { formatWithCommas } from './decimal';

// The magnetic whiteboard. Digit magnets sit in slots; the button-magnet decimal point and the
// comma magnets sit in the gaps between slots. Gap k is the gap just left of slot k.
// Sizes are in units of --u (one magnet's width), so the board scales to any screen.

const GAP = 0.42; // gap width as a fraction of a magnet's width
const tileColors = ['#b03a2e', '#1f63a8', '#1d7a45', '#b9520c', '#6c3483', '#0e6f78', '#a3243f'];

export type Range = { min: number; max: number }; // slots min … max-1; point gaps min+1 … max

type Props = {
 digits: string;
 point: number;
 range: Range;
 commas: Set<number>;
 mode: 'point' | 'commas' | 'static';
 label: string;
 startPoint?: number;
 hops?: { from: number; to: number };
 settle?: boolean; // magnet glides instead of snapping (used for "show answer")
 rowRef?: Ref<HTMLDivElement>;
 onPoint?: (gap: number) => void;
 onToggleComma?: (gap: number) => void;
 onSubmit?: () => void;
};

type Slot = { kind: 'digit' | 'zero' | 'lead' | 'empty'; text: string };

export function slotAt(digits: string, point: number, i: number): Slot {
 if (i >= 0 && i < digits.length) return { kind: 'digit', text: digits[i] };
 if (i < 0 && i >= point) return { kind: 'zero', text: '0' };
 if (i < 0 && i === point - 1) return { kind: 'lead', text: '0' };
 if (i >= digits.length && i < point) return { kind: 'zero', text: '0' };
 return { kind: 'empty', text: '' };
}

const at = (j: number) => `calc(var(--u) * ${(1 + GAP) * j + GAP / 2})`;

export default function Board({ digits, point, range, commas, mode, label, startPoint, hops, settle, rowRef, onPoint, onToggleComma, onSubmit }: Props) {
 const dragging = useRef(false);
 const slots = Array.from({ length: range.max - range.min }, (_, j) => range.min + j);
 const n = slots.length;
 const clamp = (g: number) => Math.min(range.max, Math.max(range.min + 1, g));
 const reading = formatWithCommas({ digits, point }, commas);

 function gapFromPointer(e: PointerEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const u = rect.width / (n + (n + 1) * GAP);
  const j = Math.round(((e.clientX - rect.left) / u - GAP / 2) / (1 + GAP));
  return clamp(range.min + j);
 }
 function down(e: PointerEvent<HTMLDivElement>) {
  if (mode !== 'point' || !onPoint) return;
  dragging.current = true;
  e.currentTarget.setPointerCapture(e.pointerId);
  onPoint(gapFromPointer(e));
 }
 function move(e: PointerEvent<HTMLDivElement>) { if (dragging.current && onPoint) onPoint(gapFromPointer(e)); }
 function up() { dragging.current = false; }
 function key(e: KeyboardEvent<HTMLDivElement>) {
  if (mode !== 'point' || !onPoint) return;
  const moves: Record<string, number> = { ArrowLeft: point - 1, ArrowDown: point - 1, ArrowRight: point + 1, ArrowUp: point + 1, Home: range.min + 1, End: range.max };
  if (e.key in moves) { e.preventDefault(); onPoint(clamp(moves[e.key])); }
  else if (e.key === 'Enter' && onSubmit) { e.preventDefault(); onSubmit(); }
 }

 const hopList = hops && hops.from !== hops.to
  ? Array.from({ length: Math.abs(hops.to - hops.from) }, (_, i) => {
   const right = hops.to > hops.from;
   const from = hops.from + (right ? i : -i);
   return { i, right, left: Math.min(from, right ? from + 1 : from - 1) };
  })
  : [];

 const sliderProps = mode === 'point' ? {
  role: 'slider', tabIndex: 0, 'aria-valuemin': range.min + 1, 'aria-valuemax': range.max, 'aria-valuenow': point,
  'aria-valuetext': `The board reads ${reading}`, 'aria-label': label
 } as const : { role: 'img', 'aria-label': `${label} The board reads ${reading}.` } as const;

 return <div className="dm-board">
  <div className="dm-board-inner">
   <div ref={rowRef} className={`dm-row dm-${mode}`} style={{ '--n': n } as CSSProperties}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key} {...sliderProps}>
    {slots.map(i => {
     const s = slotAt(digits, point, i);
     return <span key={i} className={`dm-slot dm-${s.kind}`} style={s.kind === 'digit' ? { '--tile': tileColors[i % tileColors.length] } as CSSProperties : undefined} aria-hidden="true">
      {s.kind !== 'empty' && <span key={`${s.kind}${point}`} className="dm-face">{s.text}</span>}
     </span>;
    })}
    {slots.slice(1).map(g => {
     const has = commas.has(g);
     const left = slotAt(digits, point, g - 1), right = slotAt(digits, point, g);
     const style = { left: at(g - range.min) };
     if (mode === 'commas' && g !== point && left.kind !== 'empty' && right.kind !== 'empty') {
      return <button key={g} type="button" className={`dm-comma-spot${has ? ' on' : ''}`} style={style} aria-pressed={has}
       aria-label={`Comma between ${left.text} and ${right.text}`} onClick={() => onToggleComma?.(g)}><span aria-hidden="true">,</span></button>;
     }
     return has ? <span key={g} className="dm-comma" style={style} aria-hidden="true">,</span> : null;
    })}
    {startPoint !== undefined && startPoint !== point && <span className="dm-start" style={{ left: at(startPoint - range.min) }} aria-hidden="true" />}
    {hopList.map(h => <span key={`${hops!.from}-${h.i}`} className={`dm-hop${h.right ? ' right' : ' left'}`} style={{ left: at(h.left - range.min), animationDelay: `${h.i * 0.22}s` }} aria-hidden="true"><b>{h.i + 1}</b></span>)}
    <span className={`dm-magnet${settle ? ' settle' : ''}`} style={{ left: at(point - range.min) }} aria-hidden="true"><i /><i /><i /><i /></span>
   </div>
  </div>
 </div>;
}
