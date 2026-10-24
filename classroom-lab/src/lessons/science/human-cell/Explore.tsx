import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { Scene } from './Scene';
import { FREE_RIBOS, H, LENS_H, LENS_W, LYSOSOMES, MITOS, VESICLES, EXO, W, WHOLE, lensTransform, toLens, type Pt, type View } from './geometry';
import { partById, parts, type Part, type PartId, type Sub } from './parts';
import { canSpeak, speak, useView } from './useView';

export type Names = 'science' | 'city';
type Selection = { id: PartId; at: Pt };

const DWELL = 320;
const MOVE_AGAIN = 40; // how far the pointer must rest away from the last spot to re-aim the lens
const instances: Partial<Record<PartId, Pt[]>> = {
 mitochondria: MITOS.map(m => [m.x, m.y] as Pt), lysosomes: LYSOSOMES, vesicles: [...VESICLES, EXO], ribosomes: FREE_RIBOS
};
const fixed: PartId[] = ['nucleus', 'nucleolus', 'golgi', 'centrosome', 'smoothER'];
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Where the lens should look when a part is pointed at: the part itself for one-off parts,
// the nearest copy for parts the cell has many of, or right where you pointed for the rest.
export function focusFor(id: PartId, pt: Pt): Pt {
 if (fixed.includes(id)) return partById[id].home;
 const list = instances[id];
 if (list) {
  const near = list.reduce((a, b) => dist(a, pt) < dist(b, pt) ? a : b);
  if (dist(near, pt) < 60) return near;
 }
 return pt;
}

export function svgPoint(svg: SVGSVGElement, x: number, y: number): Pt {
 const m = svg.getScreenCTM();
 if (!m) return [0, 0];
 const p = new DOMPoint(x, y).matrixTransform(m.inverse());
 return [p.x, p.y];
}
export const partAt = (el: EventTarget | null) =>
 ((el as Element | null)?.closest?.('[data-part]')?.getAttribute('data-part') ?? null) as PartId | null;

export const nameOf = (p: Part, names: Names) => names === 'city' ? p.city.name : p.short;

export default function Explore({ jump }: { jump?: { id: PartId; n: number } }) {
 const [sel, setSel] = useState<Selection | null>(null);
 const [level, setLevel] = useState<1 | 2>(1);
 const [sub, setSub] = useState<Sub | null>(null);
 const [hover, setHover] = useState<{ id: PartId; x: number; y: number } | null>(null);
 const [chipHover, setChipHover] = useState<PartId | null>(null);
 const [names, setNames] = useState<Names>('science');
 const [labels, setLabels] = useState(false);
 const [said, setSaid] = useState('');

 const svgRef = useRef<SVGSVGElement>(null);
 const wrapRef = useRef<HTMLDivElement>(null);
 const lensRef = useRef<HTMLDivElement>(null);
 const timer = useRef<number | undefined>(undefined);
 const pending = useRef<{ id: PartId; at: Pt } | null>(null);

 const part = sel ? partById[sel.id] : null;
 const closeup = part?.closeup;
 const zoomed = level === 2 && !!closeup;
 const target: View = !sel || !part ? WHOLE : zoomed ? closeup!.view : { x: sel.at[0], y: sel.at[1], w: part.zoom };
 const [view, moving] = useView(target);

 useEffect(() => () => window.clearTimeout(timer.current), []);
 useEffect(() => { if (jump) choose(jump.id, partById[jump.id].home, 'list'); }, [jump?.n]);

 function choose(id: PartId, at: Pt, how: 'point' | 'list' | 'key' | 'tap') {
  const p = partById[id];
  const again = sel?.id === id && dist(sel.at, at) < 1;
  if (again && how !== 'point' && p.closeup && level === 1) { setLevel(2); setSub(null); return; }
  if (again) return;
  setSel({ id, at });
  setLevel(1);
  setSub(null);
  setSaid(`${p.name}. ${p.job}`);
  if (how === 'tap' && window.matchMedia('(max-width: 760px)').matches)
   lensRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
 }

 function aim(e: PointerEvent<SVGSVGElement>) {
  const id = partAt(e.target);
  const box = wrapRef.current!.getBoundingClientRect();
  if (!id) { setHover(null); return; }
  if (e.pointerType !== 'mouse') return;
  setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
  const at = focusFor(id, svgPoint(svgRef.current!, e.clientX, e.clientY));
  const p = pending.current;
  if (p && p.id === id && dist(p.at, at) < MOVE_AGAIN) return;
  pending.current = { id, at };
  window.clearTimeout(timer.current);
  timer.current = window.setTimeout(() => {
   if (sel?.id === id && dist(sel.at, at) < MOVE_AGAIN) return;
   choose(id, at, 'point');
  }, DWELL);
 }

 function leave() {
  window.clearTimeout(timer.current);
  pending.current = null;
  setHover(null);
 }

 function tap(e: MouseEvent<SVGSVGElement>) {
  const id = partAt(e.target);
  if (!id) return;
  window.clearTimeout(timer.current);
  choose(id, focusFor(id, svgPoint(svgRef.current!, e.clientX, e.clientY)), 'tap');
 }

 function key(e: KeyboardEvent<SVGSVGElement>) {
  const i = sel ? parts.findIndex(p => p.id === sel.id) : -1;
  const go = (k: number) => { const p = parts[(k + parts.length) % parts.length]; choose(p.id, p.home, 'key'); };
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(i + 1);
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(i < 0 ? -1 : i - 1);
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(-1);
  else if ((e.key === 'Enter' || e.key === ' ' || e.key === '+' || e.key === '=') && part) { if (closeup) { setLevel(2); setSub(null); } }
  else if (e.key === 'Escape' || e.key === '-') { zoomOut(); }
  else return;
  e.preventDefault();
 }

 function zoomOut() {
  if (zoomed) { setLevel(1); setSub(null); setSaid(`Back to the ${part!.short}.`); }
  else if (sel) { setSel(null); setSaid('Whole cell.'); }
 }

 function pickSub(s: Sub) {
  setSub(s);
  setSaid(`${s.name}. ${s.text}`);
 }

 const lensBox = { x: target.x - target.w / 2, y: target.y - target.w * LENS_H / LENS_W / 2, w: target.w, h: target.w * LENS_H / LENS_W };
 const showBox = !!sel && target.w < W * 0.9;
 const callouts = zoomed && !moving ? closeup!.subs : [];

 return <div className="hc-explore">
  <div className="hc-toolbar">
   <div className="hc-seg" role="group" aria-label="Names on the parts">
    <button aria-pressed={names === 'science'} onClick={() => setNames('science')}>Science names</button>
    <button aria-pressed={names === 'city'} onClick={() => setNames('city')}>City jobs</button>
   </div>
   <label className="hc-check"><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)} /> Show labels</label>
  </div>

  <div className="hc-explore-grid">
   <div className="hc-overview" ref={wrapRef}>
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} tabIndex={0} role="group" className="hc-cell-svg"
     aria-label="Model of a human cell. Use the arrow keys to move from part to part, Enter to look closer, and Escape to zoom out."
     aria-describedby="hc-explore-help"
     onPointerMove={aim} onPointerLeave={leave} onClick={tap} onKeyDown={key}>
     <Scene active={sel?.id ?? null} hover={chipHover ?? hover?.id ?? null} hits />
     {showBox && <rect className="hc-lens-box" x={lensBox.x} y={lensBox.y} width={lensBox.w} height={lensBox.h} rx={Math.min(14, lensBox.w / 12)} />}
     {labels && <g className="hc-labels" aria-hidden="true">{parts.map(p => {
      const [tx, ty] = p.label.text;
      return <g key={p.id}>
       <line x1={tx} y1={ty} x2={p.home[0]} y2={p.home[1]} />
       <circle cx={p.home[0]} cy={p.home[1]} r="3" />
       <text x={tx} y={ty + (ty < p.home[1] ? -4 : 14)} textAnchor={p.label.anchor}>{nameOf(p, names)}</text>
      </g>;
     })}</g>}
    </svg>
    {hover && <div className="hc-tip" style={{ left: hover.x, top: hover.y }} aria-hidden="true">{nameOf(partById[hover.id], names)}</div>}
    <p id="hc-explore-help" className="hc-help">Point at a part to zoom in, or tap it. Tap it again to look even closer. On a keyboard, click the cell or press Tab to reach it, then use the arrow keys.</p>
   </div>

   <div className="hc-side">
    <div className="hc-lens" ref={lensRef}>
     <div className="hc-lens-head">
      <span className="hc-lens-title">{sub ? sub.name : part ? nameOf(part, names) : 'Whole cell'}</span>
      <span className="hc-zoom">Zoom ×{Math.round(W / view.w)}</span>
     </div>
     <div className="hc-lens-view">
      <svg viewBox={`0 0 ${LENS_W} ${LENS_H}`} aria-hidden="true">
       <g transform={lensTransform(view)}><Scene active={zoomed ? null : sel?.id ?? null} /></g>
      </svg>
      {callouts.map((s, i) => {
       const [x, y] = toLens(target, s.at);
       return <button key={s.id} className={`hc-callout${sub?.id === s.id ? ' on' : ''}`} style={{ left: `${x / LENS_W * 100}%`, top: `${y / LENS_H * 100}%`, animationDelay: `${i * 60}ms` }}
        aria-label={s.name} aria-pressed={sub?.id === s.id} onClick={() => pickSub(s)} onPointerEnter={e => { if (e.pointerType === 'mouse') pickSub(s); }}>{i + 1}</button>;
      })}
     </div>
     <div className="hc-lens-tools">
      <button onClick={zoomOut} disabled={!sel}>− Zoom out</button>
      <button className="hc-primary" onClick={() => { setLevel(2); setSub(null); }} disabled={!closeup || zoomed}>+ Look closer</button>
     </div>
    </div>

    <div className="hc-info">
     {!part ? <>
      <h3>A human cell</h3>
      <p>Your body is built from about 30 trillion cells. Most are far too small to see without a microscope. This model shows the main parts found in many human cells. Most of the parts are <strong>organelles</strong>, tiny structures that each have a job. They all work together to keep the cell alive.</p>
      <p>Pick any part to zoom in. Parts with a <strong>Look closer</strong> view have smaller pieces you can explore, too.</p>
     </> : <>
      <div className="hc-info-head">
       <h3><span className="hc-swatch" style={{ background: part.color }} />{part.name}</h3>
       {canSpeak && <button className="hc-speak" aria-label={`Read about the ${part.short} aloud`} onClick={() => speak(sub ? `${sub.name}. ${sub.text}` : `${part.name}. ${part.job} ${part.more}`)}>🔊</button>}
      </div>
      {names === 'city' && <p className="hc-city-name">City job: {part.city.name}</p>}
      {sub && <div className="hc-sub">
       <strong>Close-up: {sub.name}</strong>
       <p>{sub.text}</p>
       {sub.part && sub.part !== part.id && <button className="hc-link" onClick={() => choose(sub.part!, partById[sub.part!].home, 'list')}>Go to the {partById[sub.part].short} →</button>}
      </div>}
      <p className="hc-job">{part.job}</p>
      <p>{part.more}</p>
      <dl className="hc-facts">
       <div><dt>Think of it like…</dt><dd><strong>{part.city.name}.</strong> {part.city.text}</dd></div>
       <div><dt>Did you know?</dt><dd>{part.fact}</dd></div>
       <div><dt>How many in a cell?</dt><dd>{part.count}</dd></div>
      </dl>
      {closeup && !zoomed && <p className="hc-hint">Press <strong>Look closer</strong> to see {closeup.subs.length} smaller pieces.</p>}
      {zoomed && !sub && <p className="hc-hint">Point at or tap a numbered dot in the zoom view.</p>}
     </>}
    </div>
   </div>

   <div className="hc-extra">
    <div className="hc-chips" role="group" aria-label="Parts of the cell">
     {parts.map(p => <button key={p.id} aria-pressed={sel?.id === p.id} onClick={() => choose(p.id, p.home, 'list')}
      onPointerEnter={() => setChipHover(p.id)} onPointerLeave={() => setChipHover(null)} onFocus={() => setChipHover(p.id)} onBlur={() => setChipHover(null)}>
      <span className="hc-swatch" style={{ background: p.color }} />{nameOf(p, names)}
     </button>)}
    </div>

    <details className="hc-more">
     <summary>Looking for a cell wall or chloroplasts?</summary>
     <p>Those belong to plant cells. Human cells, like other animal cells, have no cell wall, no chloroplasts, and no large central vacuole. The soft, flexible membrane is their outer edge. That's one reason many human cells can change shape.</p>
    </details>
   </div>
  </div>

  {names === 'city' && <p className="note">An analogy is a comparison, not a match. A cell isn't really a city, so every comparison breaks down somewhere. Ask: where does this one stop working?</p>}
  <div className="hc-sr" aria-live="polite">{said}</div>
 </div>;
}
