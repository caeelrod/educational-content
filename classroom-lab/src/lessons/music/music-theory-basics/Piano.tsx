import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { noteOn } from './audio';
import { MIDDLE_C, isBlack, name, spoken, type Spelling } from './notes';

// Computer keys laid out like a piano, starting from the lowest C shown (a common layout in music apps).
const KEYMAP = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';', "'"];
export const keyFor = (from: number, midi: number) => KEYMAP[midi - from]?.toUpperCase();

type Props = {
 from: number; // must be a C
 to: number;
 label: string;
 lit?: number[];
 hint?: number | null;
 letters?: boolean;
 spelling?: Spelling;
 onPlay?: (midi: number) => void;
 onRelease?: (midi: number) => void;
};

export default function Piano({ from, to, label, lit = [], hint = null, letters = false, spelling = 'sharp', onPlay, onRelease }: Props) {
 const keys = Array.from({ length: to - from + 1 }, (_, i) => from + i);
 const whites = keys.filter(k => !isBlack(k));
 const [down, setDown] = useState<number[]>([]);
 const [cur, setCur] = useState(from);
 const releases = useRef(new Map<number, () => void>());
 const dragging = useRef(false);
 const refs = useRef(new Map<number, HTMLButtonElement>());

 useEffect(() => { if (cur < from || cur > to) setCur(from); }, [from, to]);
 useEffect(() => {
  const up = () => { dragging.current = false; [...releases.current.keys()].forEach(end); };
  window.addEventListener('pointerup', up);
  window.addEventListener('blur', up);
  return () => { window.removeEventListener('pointerup', up); window.removeEventListener('blur', up); up(); };
 }, []);

 function start(m: number) {
  if (releases.current.has(m)) return;
  releases.current.set(m, noteOn(m));
  setDown(d => [...d, m]);
  onPlay?.(m);
 }
 function end(m: number) {
  const r = releases.current.get(m);
  if (!r) return;
  r(); releases.current.delete(m);
  setDown(d => d.filter(x => x !== m));
  onRelease?.(m);
 }
 function tapOnce(m: number) { start(m); window.setTimeout(() => end(m), 450); }

 function pointerDown(e: PointerEvent<HTMLButtonElement>, m: number) {
  if (e.button !== 0) return;
  e.preventDefault();
  // Let a finger slide across the keys: without this, a touch stays captured by the first key.
  e.currentTarget.releasePointerCapture?.(e.pointerId);
  dragging.current = true;
  setCur(m);
  start(m);
 }
 function pointerEnter(m: number) { if (dragging.current) start(m); }

 function move(to: number) {
  setCur(to);
  refs.current.get(to)?.focus();
 }
 function keyDown(e: KeyboardEvent<HTMLDivElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const mapped = KEYMAP.indexOf(k);
  if (mapped >= 0 && from + mapped <= to) { e.preventDefault(); if (!e.repeat) { setCur(from + mapped); start(from + mapped); } return; }
  if (e.key === 'ArrowRight') move(Math.min(to, cur + 1));
  else if (e.key === 'ArrowLeft') move(Math.max(from, cur - 1));
  else if (e.key === 'Home') move(from);
  else if (e.key === 'End') move(to);
  else if (e.key === 'Enter' || e.key === ' ') { if (!e.repeat) start(cur); }
  else return;
  e.preventDefault();
 }
 function keyUp(e: KeyboardEvent<HTMLDivElement>) {
  const mapped = KEYMAP.indexOf(e.key.toLowerCase());
  if (mapped >= 0) end(from + mapped);
  if (e.key === 'Enter' || e.key === ' ') end(cur);
 }

 const w = 100 / whites.length;
 return <div className="mu-piano" role="group" aria-label={label} onKeyDown={keyDown} onKeyUp={keyUp}>
  {keys.map(m => {
   const black = isBlack(m);
   const left = black ? (whites.filter(x => x < m).length) * w - w * 0.31 : whites.indexOf(m) * w;
   const on = down.includes(m) || lit.includes(m);
   const aria = black ? `${spoken(m, 'sharp')}, also called ${spoken(m, 'flat')}` : `${spoken(m)}${m === MIDDLE_C ? ', middle C' : ''}`;
   return <button key={m} ref={el => { if (el) refs.current.set(m, el); else refs.current.delete(m); }}
    className={`mu-key ${black ? 'black' : 'white'}${on ? ' on' : ''}${hint === m ? ' hint' : ''}`}
    style={{ left: `${left}%`, width: `${black ? w * 0.62 : w}%` }}
    tabIndex={m === cur ? 0 : -1} aria-label={aria} aria-pressed={down.includes(m)}
    onPointerDown={e => pointerDown(e, m)} onPointerEnter={() => pointerEnter(m)} onPointerUp={() => end(m)} onPointerLeave={() => { if (dragging.current) end(m); }}
    onClick={e => { if (e.detail === 0) tapOnce(m); }} onFocus={() => setCur(m)} onContextMenu={e => e.preventDefault()}>
    {letters && <span className="mu-key-name">{black ? name(m, spelling) : name(m)}</span>}
    {!black && m === MIDDLE_C && <span className="mu-key-mark" aria-hidden="true">middle C</span>}
   </button>;
  })}
 </div>;
}
