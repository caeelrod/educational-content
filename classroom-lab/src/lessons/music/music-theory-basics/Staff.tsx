import type { KeyboardEvent, ReactNode } from 'react';
import { beatsOf, name, onLine, restNames, spell, staffStep, stepY, valueNames, type Spelling, type Value } from './notes';

// Music notation drawn in SVG. Units: staff lines are 10 apart, the top line is at y = 0.
export type Item =
 | { kind: 'note'; midi: number[]; value: Value; spelling?: Spelling }
 | { kind: 'rest'; value: Value };
export type Focus = 'staff' | 'clef' | 'time' | 'bars' | 'notes' | 'lines' | 'spaces' | null;

const UNIT = 34; // width of one beat
const PAD = 12; // space after a bar line
export const TOP = -34, BOTTOM = 78;

export const filled = (v: Value) => v !== 'whole' && v !== 'half' && v !== 'dottedHalf';
const stemmed = (v: Value) => v !== 'whole';
const dotted = (v: Value) => v === 'dottedHalf' || v === 'dottedQuarter';

export function TrebleClef({ x = 0, className = '' }: { x?: number; className?: string }) {
 // One continuous stroke: start inside the curl around the G line, spiral out, rise to the top
 // loop, then drop straight down through the staff to the hook at the bottom.
 return <g className={`mu-clef ${className}`} transform={`translate(${x} 0)`}>
  <path d="M15.6 31.5C11.6 32.6 9.6 27.6 13.4 25.2C18.6 22.2 23.6 26.4 22.4 32.2C21.2 38.6 12.6 40.2 8.2 35.2C3.4 29.6 6.4 22.4 12.2 16.8C17.4 11.8 21.4 6.2 19.8 -2.4C18.8 -8.6 14.8 -10.4 13 -5.4C11 0.2 12.4 12 14.8 26L18.2 46.8C19.2 53.2 13.6 56.4 10.4 52.8" />
  <circle cx="11.6" cy="51" r="3.4" />
 </g>;
}

export function NeutralClef({ x = 0 }: { x?: number }) {
 return <g className="mu-clef mu-neutral" transform={`translate(${x} 0)`}><rect x="6" y="10" width="3.4" height="20" /><rect x="13" y="10" width="3.4" height="20" /></g>;
}

function Head({ x, y, v }: { x: number; y: number; v: Value }) {
 if (v === 'whole') return <g className="mu-head"><ellipse cx={x} cy={y} rx="7.4" ry="4.7" /><ellipse className="mu-hole" cx={x} cy={y} rx="3.2" ry="3.7" transform={`rotate(-38 ${x} ${y})`} /></g>;
 return <g className="mu-head" transform={`rotate(-22 ${x} ${y})`}>
  <ellipse cx={x} cy={y} rx="6.3" ry="4.4" />
  {!filled(v) && <ellipse className="mu-hole" cx={x} cy={y} rx="4.6" ry="2.1" transform={`rotate(-14 ${x} ${y})`} />}
 </g>;
}

function Accidental({ x, y, acc }: { x: number; y: number; acc: number }) {
 if (acc > 0) return <g className="mu-acc"><path d={`M${x - 16} ${y - 10}V${y + 9}M${x - 12} ${y - 11}V${y + 8}`} /><path className="mu-acc-bar" d={`M${x - 19} ${y - 2}L${x - 9} ${y - 5}M${x - 19} ${y + 5}L${x - 9} ${y + 2}`} /></g>;
 if (acc < 0) return <g className="mu-acc"><path d={`M${x - 15} ${y - 15}V${y + 4}C${x - 8} ${y} ${x - 8} ${y - 6} ${x - 15} ${y - 2}`} /></g>;
 return null;
}

function ledgers(x: number, steps: number[]) {
 const out: number[] = [];
 const lo = Math.min(...steps), hi = Math.max(...steps);
 for (let s = -2; s >= lo; s -= 2) out.push(s);
 for (let s = 10; s <= hi; s += 2) out.push(s);
 return out.map(s => <line key={s} className="mu-ledger" x1={x - 10} x2={x + 10} y1={stepY(s)} y2={stepY(s)} />);
}

export function Rest({ x, v }: { x: number; v: Value }) {
 if (v === 'whole') return <rect className="mu-rest" x={x - 6} y="10" width="12" height="5" />;
 if (v === 'half') return <rect className="mu-rest" x={x - 6} y="15" width="12" height="5" />;
 if (v === 'eighth') return <g className="mu-rest"><circle cx={x - 3} cy="15" r="2.6" /><path className="mu-rest-line" d={`M${x - 3} 16.5C${x} 18 ${x + 3} 15 ${x + 4.5} 13L${x - 1} 31`} /></g>;
 return <path className="mu-rest mu-rest-line mu-qrest" d={`M${x - 3} 5L${x + 4} 13.5L${x - 2} 20L${x + 4} 27C${x - 3} 24.5 ${x - 5} 30 ${x} 34`} />;
}

// Where each measure's beats sit on a percussion staff with a clef and time signature, as fractions
// of the drawing's width, so HTML beneath it can line up with the notes.
export function beatColumns(measures: number) {
 const head = 64;
 const width = head + measures * (PAD + 4 * UNIT) + 6;
 const cols: number[] = [];
 for (let m = 0; m < measures; m++) cols.push(head + PAD + m * (PAD + 4 * UNIT));
 return { width, starts: cols, span: 4 * UNIT };
}

type Placed = { item: Item; x: number; beat: number; index: number; steps: number[]; up: boolean };

export function layout(measures: Item[][], start: number, percussion = false) {
 let x = start;
 let index = 0;
 const placed: Placed[] = [];
 const bars: number[] = [];
 for (const m of measures) {
  x += PAD;
  let beat = 0, last = -Infinity, shift = 0;
  for (const item of m) {
   const steps = item.kind === 'note' ? (percussion ? [4] : item.midi.map(n => staffStep(n, item.spelling))) : [4];
   const avg = steps.reduce((a, b) => a + b, 0) / steps.length;
   // Spacing follows the beat, but a short unbeamed note gets a little extra room so its flag stays clear.
   const want = x + beat * UNIT + 6 + shift;
   const nx = percussion ? want : Math.max(want, last + 26);
   shift += nx - want; last = nx;
   placed.push({ item, x: nx, beat, index: index++, steps, up: percussion || avg < 4 });
   beat += beatsOf[item.value];
  }
  x += 4 * UNIT + shift;
  bars.push(x);
 }
 return { placed, bars, end: x };
}

type Props = {
 measures: Item[][];
 label: string;
 clef?: 'treble' | 'neutral' | false;
 time?: boolean;
 final?: boolean;
 bars?: boolean;
 percussion?: boolean;
 active?: number | null; // index of the item sounding now
 hint?: number | null; // index of an item to point out
 selected?: number | null;
 focus?: Focus;
 letters?: boolean;
 onItem?: (i: number) => void;
 itemLabel?: (it: Item, i: number) => string;
 className?: string;
 children?: ReactNode;
};

export default function Staff({ measures, label, clef = 'treble', time = true, final = true, bars: showBars = true, percussion = false, active = null, hint = null, selected = null, focus = null, letters = false, onItem, itemLabel, className = '', children }: Props) {
 const head = (clef ? 38 : 4) + (time ? 26 : 0);
 const { placed, bars, end } = layout(measures, head, percussion);
 const width = end + 6 + (focus === 'lines' || focus === 'spaces' ? 12 : 0);
 const lines = percussion ? [20] : [0, 10, 20, 30, 40];
 const top = percussion ? -18 : TOP, bottom = percussion ? 54 : BOTTOM;

 // Beam pairs of eighth notes that start on a beat.
 const beamed = new Set<number>();
 const beams: [Placed, Placed][] = [];
 for (let i = 0; i < placed.length - 1; i++) {
  const a = placed[i], b = placed[i + 1];
  if (a.item.kind === 'note' && b.item.kind === 'note' && a.item.value === 'eighth' && b.item.value === 'eighth'
   && Number.isInteger(a.beat) && b.beat === a.beat + 0.5) {
   beamed.add(i); beamed.add(i + 1); beams.push([a, b]); i++;
  }
 }
 for (const [a, b] of beams) { const up = (a.steps[0] + b.steps[0]) / 2 < 4 || percussion; a.up = up; b.up = up; }
 const stemEnd = (p: Placed) => p.up ? stepY(Math.max(...p.steps)) - 33 : stepY(Math.min(...p.steps)) + 33;
 const beamY = (a: Placed, b: Placed) => a.up ? Math.min(stemEnd(a), stemEnd(b)) : Math.max(stemEnd(a), stemEnd(b));

 const key = (e: KeyboardEvent, i: number) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItem?.(i); } };

 return <svg className={`mu-staff${focus ? ` focus-${focus}` : ''} ${className}`} viewBox={`0 ${top} ${width} ${bottom - top}`} role={onItem ? 'group' : 'img'} aria-label={label}>
  {focus === 'spaces' && [1, 3, 5, 7].map(s => <rect key={s} className="mu-space-glow" x={0} y={stepY(s) - 4.5} width={width} height={9} />)}
  {focus === 'staff' && <rect className="mu-glow" x={1} y={-6} width={width - 2} height={52} rx={6} />}
  {focus === 'clef' && clef && <rect className="mu-glow" x={1} y={-16} width={34} height={76} rx={8} />}
  {focus === 'time' && time && <rect className="mu-glow" x={head - 26} y={-4} width={24} height={48} rx={6} />}
  <g className="mu-lines">{lines.map(y => <line key={y} x1={0} x2={showBars ? bars[bars.length - 1] : width} y1={y} y2={y} />)}</g>
  {clef === 'treble' && <TrebleClef x={4} />}
  {clef === 'neutral' && <NeutralClef x={8} />}
  {time && <g className="mu-time"><text x={head - 14} y={percussion ? 10 : 10}>4</text><text x={head - 14} y={30}>4</text></g>}
  <g className="mu-bars">{showBars && bars.map((x, i) => {
   const last = i === bars.length - 1 && final;
   const y1 = percussion ? 10 : 0, y2 = percussion ? 30 : 40;
   return last ? <g key={i}><line x1={x - 6} x2={x - 6} y1={y1} y2={y2} /><rect x={x - 3} y={y1} width={3.5} height={y2 - y1} /></g>
    : <line key={i} x1={x} x2={x} y1={y1} y2={y2} />;
  })}</g>
  {placed.map(p => {
   const { item, x, index, steps, up } = p;
   const cls = `mu-item${index === active ? ' on' : ''}${index === hint ? ' hint' : ''}${index === selected ? ' sel' : ''}`;
   const slot = beatsOf[item.value] * UNIT;
   const interactive = onItem ? {
    role: 'button', tabIndex: 0, 'aria-label': itemLabel?.(item, index) ?? '', 'aria-pressed': index === selected,
    onClick: () => onItem(index), onKeyDown: (e: KeyboardEvent) => key(e, index)
   } : {};
   return <g key={index} className={cls} {...interactive}>
    {(onItem || index === active || index === hint) && <rect className="mu-slot" x={x - 12} y={top + (percussion ? 2 : 8)} width={Math.max(24, slot - 4)} height={bottom - top - (percussion ? 4 : 30)} rx={8} />}
    {item.kind === 'rest' ? <Rest x={x} v={item.value} /> : <>
     {!percussion && ledgers(x, steps)}
     {item.midi.map((m, k) => { const s = staffStep(m, item.spelling); const y = stepY(percussion ? 4 : s); return <g key={k}>
      {!percussion && <Accidental x={x} y={y} acc={spell(m, item.spelling).acc} />}
      <Head x={x} y={y} v={item.value} />
      {dotted(item.value) && <circle className="mu-dot" cx={x + 11} cy={onLine(percussion ? 4 : s) ? y - 5 : y} r="1.9" />}
     </g>; })}
     {stemmed(item.value) && <line className="mu-stem" x1={up ? x + 5.7 : x - 5.7} x2={up ? x + 5.7 : x - 5.7}
      y1={up ? stepY(percussion ? 4 : Math.min(...steps)) : stepY(percussion ? 4 : Math.max(...steps))} y2={beamed.has(index) ? beamY(...beams.find(bm => bm[0] === p || bm[1] === p)!) : stemEnd(p)} />}
     {item.value === 'eighth' && !beamed.has(index) && <Flag x={up ? x + 5.7 : x - 5.7} y={stemEnd(p)} up={up} />}
     {letters && !percussion && <text className="mu-letter" x={x} y={66}>{item.midi.map(m => name(m, item.spelling)).join(' ')}</text>}
    </>}
   </g>;
  })}
  {beams.map(([a, b], i) => {
   const y = beamY(a, b), ax = a.up ? a.x + 5.7 : a.x - 5.7, bx = b.up ? b.x + 5.7 : b.x - 5.7;
   return <rect key={i} className={`mu-beam${a.index === active || b.index === active ? ' on' : ''}`} x={ax - 0.7} y={a.up ? y : y - 5} width={bx - ax + 1.4} height={5} />;
  })}
  {focus === 'lines' && <g className="mu-line-names">{['E', 'G', 'B', 'D', 'F'].map((l, i) => <text key={l} x={width - 4} y={stepY(i * 2) + 0.5}>{l}</text>)}</g>}
  {focus === 'spaces' && <g className="mu-line-names">{['F', 'A', 'C', 'E'].map((l, i) => <text key={l} x={width - 4} y={stepY(i * 2 + 1) + 0.5}>{l}</text>)}</g>}
  {children}
 </svg>;
}

function Flag({ x, y, up }: { x: number; y: number; up: boolean }) {
 const d = up ? 1 : -1;
 return <path className="mu-flag" d={`M${x} ${y}C${x + 1} ${y + 6 * d} ${x + 11} ${y + 9 * d} ${x + 9} ${y + 21 * d}C${x + 8.5} ${y + 14 * d} ${x + 5} ${y + 11.5 * d} ${x} ${y + 10 * d}Z`} />;
}

// A single note or rest drawn on its own, for buttons and quiz cards.
export function Glyph({ item, label, lines = true }: { item: Item; label?: string; lines?: boolean }) {
 const desc = label ?? (item.kind === 'rest' ? restNames[item.value] : valueNames[item.value]);
 const x = 24;
 const up = true;
 return <svg className="mu-glyph" viewBox="0 -14 52 66" role="img" aria-label={desc}>
  {lines && <g className="mu-lines faint">{[0, 10, 20, 30, 40].map(y => <line key={y} x1={0} x2={52} y1={y} y2={y} />)}</g>}
  {item.kind === 'rest' ? <Rest x={x} v={item.value} /> : <>
   <Head x={x} y={30} v={item.value} />
   {dotted(item.value) && <circle className="mu-dot" cx={x + 11} cy={25} r="1.9" />}
   {stemmed(item.value) && <line className="mu-stem" x1={x + 5.7} x2={x + 5.7} y1={30} y2={-3} />}
   {item.value === 'eighth' && <Flag x={x + 5.7} y={-3} up={up} />}
  </>}
 </svg>;
}
