import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { elements, mainGroup, type Element } from './elements';

export type View = 'full' | 'main';
type Cell = { style?: CSSProperties; className?: string; value?: ReactNode; note?: string };

// Main-group view: groups 1, 2, 13 to 18 become columns 1 to 8.
const mainCol = (e: Element) => e.group! <= 2 ? e.group! : e.group! - 10;

/** True below the width where all 18 columns stop fitting comfortably. */
export function useNarrow(px = 700) {
 const q = `(max-width: ${px}px)`;
 const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(q).matches);
 useEffect(() => {
  const m = window.matchMedia?.(q);
  if (!m) return;
  const on = () => setNarrow(m.matches);
  m.addEventListener('change', on);
  return () => m.removeEventListener('change', on);
 }, [q]);
 return narrow;
}

/** Full / main-groups switch, shown above a table. */
export function ViewSwitch({ view, setView }: { view: View; setView: (v: View) => void }) {
 return <div className="cb-seg" role="group" aria-label="Table view">
  <button aria-pressed={view === 'main'} onClick={() => setView('main')}>Main groups</button>
  <button aria-pressed={view === 'full'} onClick={() => setView('full')}>Full table</button>
 </div>;
}

/**
 * The periodic table as a grid of buttons. One cell is in the tab order at a time;
 * arrow keys move between cells and Enter or Space picks one.
 */
export default function PeriodicTable({ view, selected = [], onPick, cell, label, enabled }: {
 view: View;
 selected?: number[];
 onPick: (e: Element) => void;
 cell?: (e: Element) => Cell;
 label: string;
 enabled?: (e: Element) => boolean;
}) {
 const list = view === 'main' ? mainGroup : elements;
 const pos = (e: Element) => view === 'main' ? { r: e.period, c: mainCol(e) } : { r: e.row, c: e.col };
 const [focusZ, setFocusZ] = useState<number>(selected[0] ?? list[0].z);
 const refs = useRef(new Map<number, HTMLButtonElement>());
 const tabZ = list.some(e => e.z === focusZ) ? focusZ : list[0].z;

 function move(e: Element, dr: number, dc: number) {
  const { r, c } = pos(e);
  let best: Element | null = null, bestScore = Infinity;
  for (const o of list) {
   const p = pos(o), ddr = p.r - r, ddc = p.c - c;
   if (dr && Math.sign(ddr) !== dr) continue;
   if (dc && Math.sign(ddc) !== dc) continue;
   // Stay in the same row (or column) when there is a cell that way; otherwise jump to the nearest line that has one.
   const score = dr ? Math.abs(ddc) * 1000 + Math.abs(ddr) : Math.abs(ddr) * 1000 + Math.abs(ddc);
   if (score < bestScore) { bestScore = score; best = o; }
  }
  if (best) { setFocusZ(best.z); refs.current.get(best.z)?.focus(); }
 }
 function onKey(ev: KeyboardEvent, e: Element) {
  const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  if (d[ev.key]) { ev.preventDefault(); move(e, ...d[ev.key]); }
  else if (ev.key === 'Home' || ev.key === 'End') {
   ev.preventDefault();
   const t = ev.key === 'Home' ? list[0] : list[list.length - 1];
   setFocusZ(t.z); refs.current.get(t.z)?.focus();
  }
 }

 const cols = view === 'main' ? 8 : 18, rows = view === 'main' ? 5 : 10;
 const headers = view === 'main' ? [1, 2, 13, 14, 15, 16, 17, 18] : Array.from({ length: 18 }, (_, i) => i + 1);
 return <div className={`cb-table-wrap ${view}`}>
  <div className={`cb-table ${view}`} role="group" aria-label={label}
   style={{ gridTemplateColumns: `1.4em repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `auto repeat(${rows}, auto)` }}>
   {headers.map((g, i) => <span key={'g' + g} className="cb-head" style={{ gridColumn: i + 2, gridRow: 1 }} aria-hidden="true">{g}</span>)}
   {[1, 2, 3, 4, 5, ...(view === 'full' ? [6, 7] : [])].map(p => <span key={'p' + p} className="cb-head" style={{ gridColumn: 1, gridRow: p + 1 }} aria-hidden="true">{p}</span>)}
   {view === 'full' && <>
    <span className="cb-fmark" style={{ gridColumn: 4, gridRow: 7 }} aria-hidden="true">57–71</span>
    <span className="cb-fmark" style={{ gridColumn: 4, gridRow: 8 }} aria-hidden="true">89–103</span>
    <span className="cb-fgap" style={{ gridColumn: '1 / -1', gridRow: 9 }} aria-hidden="true" />
   </>}
   {list.map(e => {
    const { r, c } = pos(e), extra = cell?.(e) ?? {}, on = enabled ? enabled(e) : true;
    const isSel = selected.includes(e.z);
    return <button key={e.z} ref={b => { if (b) refs.current.set(e.z, b); else refs.current.delete(e.z); }}
     className={`cb-cell ${e.data ? 'has-data' : 'no-data'} ${isSel ? 'sel' : ''} ${extra.className ?? ''}`}
     style={{ gridColumn: c + 1, gridRow: r + 1, ...extra.style }}
     tabIndex={e.z === tabZ ? 0 : -1} aria-pressed={isSel} aria-disabled={!on || undefined}
     aria-label={`${e.name}, ${e.sym}, atomic number ${e.z}${extra.note ? `, ${extra.note}` : ''}`}
     onFocus={() => setFocusZ(e.z)} onKeyDown={ev => onKey(ev, e)} onClick={() => on && onPick(e)}>
     <span className="cb-z" aria-hidden="true">{e.z}</span>
     <span className="cb-sym" aria-hidden="true">{e.sym}</span>
     {extra.value !== undefined && <span className="cb-val" aria-hidden="true">{extra.value}</span>}
    </button>;
   })}
  </div>
 </div>;
}
