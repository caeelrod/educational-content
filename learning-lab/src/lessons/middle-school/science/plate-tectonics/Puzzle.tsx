import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { FIT, MAP_H, MAP_W, TODAY, africa, clues, madagascar, pathOf, poseTransform, southAmerica, type ClueId, type Pose } from './geo';
import { useReducedMotion } from './motion';

const OPEN_MA = 130; // the South Atlantic began to open roughly 130 million years ago
const lerp = (a: Pose, b: Pose, k: number): Pose => ({ dx: a.dx + (b.dx - a.dx) * k, dy: a.dy + (b.dy - a.dy) * k, deg: a.deg + (b.deg - a.deg) * k });
const off = (p: Pose) => ({ dist: Math.hypot(p.dx - FIT.dx, p.dy - FIT.dy), turn: p.deg - FIT.deg });
const close = (p: Pose) => { const o = off(p); return o.dist < 20 && Math.abs(o.turn) <= 9; };

function hint(p: Pose) {
 const o = off(p);
 if (Math.abs(o.turn) > 9) return o.turn < 0 ? 'Africa needs to turn clockwise (⟳) to line up with South America.' : 'You have turned Africa a little too far. Turn it back (⟲).';
 if (o.dist > 120) return 'Good angle. Now slide Africa west, toward South America.';
 if (o.dist > 45) return 'Getting closer. Look for where the bulge of Brazil could tuck in.';
 return 'Almost! Nudge it so Brazil\'s bulge tucks into the bend of West Africa.';
}

export default function Puzzle() {
 const [pose, setPose] = useState<Pose>(TODAY);
 const [fitted, setFitted] = useState(false);
 const [ma, setMa] = useState(OPEN_MA);
 const [shown, setShown] = useState<Set<ClueId>>(new Set());
 const [msg, setMsg] = useState('Drag Africa (or use the buttons and arrow keys) to see whether it fits against South America.');
 const svg = useRef<SVGSVGElement>(null);
 const drag = useRef<{ x: number; y: number; start: Pose } | null>(null);
 const anim = useRef(0);
 const reduce = useReducedMotion();

 useEffect(() => () => cancelAnimationFrame(anim.current), []);

 function glide(from: Pose, to: Pose, done?: () => void) {
  cancelAnimationFrame(anim.current);
  if (reduce) { setPose(to); done?.(); return; }
  const t0 = performance.now();
  const step = (now: number) => {
   const k = Math.min(1, (now - t0) / 500), e = 1 - (1 - k) ** 3;
   setPose(lerp(from, to, e));
   if (k < 1) anim.current = requestAnimationFrame(step); else done?.();
  };
  anim.current = requestAnimationFrame(step);
 }

 function settle(p: Pose) {
  if (fitted) return;
  if (close(p)) {
   glide(p, FIT, () => { setFitted(true); setMa(OPEN_MA); });
   setMsg('They fit! Now turn on the clues and look at how they line up across the join.');
  } else setMsg(hint(p));
 }

 function move(p: Pose) { if (!fitted) setPose(p); }

 function toSvg(e: { clientX: number; clientY: number }) {
  const m = svg.current?.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: pt.x, y: pt.y };
 }
 function down(e: PointerEvent<SVGGElement>) {
  if (fitted) return;
  (e.currentTarget as Element).setPointerCapture(e.pointerId);
  const { x, y } = toSvg(e);
  drag.current = { x, y, start: pose };
 }
 function moveDrag(e: PointerEvent<SVGGElement>) {
  const d = drag.current;
  if (!d) return;
  const { x, y } = toSvg(e);
  move({ ...d.start, dx: d.start.dx + x - d.x, dy: d.start.dy + y - d.y });
 }
 function up() { if (drag.current) { drag.current = null; settle(pose); } }

 function turn(by: number) { if (fitted) return; const p = { ...pose, deg: pose.deg + by }; setPose(p); settle(p); }
 function key(e: KeyboardEvent<SVGGElement>) {
  if (fitted) return;
  const s = e.shiftKey ? 15 : 5;
  const k = e.key;
  let p: Pose | null = null;
  if (k === 'ArrowLeft') p = { ...pose, dx: pose.dx - s };
  else if (k === 'ArrowRight') p = { ...pose, dx: pose.dx + s };
  else if (k === 'ArrowUp') p = { ...pose, dy: pose.dy - s };
  else if (k === 'ArrowDown') p = { ...pose, dy: pose.dy + s };
  else if (k === 'q' || k === 'Q' || k === '[') p = { ...pose, deg: pose.deg - 3 };
  else if (k === 'e' || k === 'E' || k === ']') p = { ...pose, deg: pose.deg + 3 };
  if (!p) return;
  e.preventDefault();
  setPose(p); settle(p);
 }

 function showFit() { setMsg('Here is the fit scientists found. Turn on the clues to see what else lines up.'); glide(pose, FIT, () => { setFitted(true); setMa(OPEN_MA); }); }
 function reset() { cancelAnimationFrame(anim.current); setFitted(false); setPose(TODAY); setMa(OPEN_MA); setMsg('Drag Africa (or use the buttons and arrow keys) to see whether it fits against South America.'); }
 function drift(v: number) { setMa(v); setPose(lerp(FIT, TODAY, (OPEN_MA - v) / OPEN_MA)); }
 function toggle(id: ClueId) { setShown(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }

 const active = clues.filter(c => shown.has(c.id));
 const patches = (side: 'sa' | 'af') => active.map(c => c[side].map((poly, i) => <path key={c.id + i} d={pathOf(poly)} className="pt-clue" fill={`url(#${c.pattern})`} stroke={c.color} />));
 const drifting = fitted && ma < OPEN_MA;

 return <div className="pt-panel">
  <h3>Clue 1: Do the continents fit together?</h3>
  <p>In 1912 a German scientist named <strong>Alfred Wegener</strong> argued that the continents were once joined and have slowly drifted apart. Test his idea yourself: can you fit Africa against South America?</p>
  <div className="pt-two">
   <div>
    <svg ref={svg} className={`pt-map${fitted ? ' fitted' : ''}`} viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-labelledby="pt-map-title">
     <title id="pt-map-title">{fitted ? (drifting ? `South America and Africa ${Math.round(ma)} million years ago, drifting apart` : 'South America and Africa fitted together') : 'Map of South America and Africa with the Atlantic Ocean between them'}</title>
     <defs>
      {clues.map(c => <pattern key={c.id} id={c.pattern} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={`rotate(${c.id === 'gloss' ? -45 : c.id === 'ice' ? 0 : 45})`}>
       <rect width="6" height="6" fill={c.color} fillOpacity=".18" /><line x1="0" y1="0" x2="0" y2="6" stroke={c.color} strokeWidth="2.2" strokeOpacity=".75" />
      </pattern>)}
     </defs>
     <rect className="pt-sea" width={MAP_W} height={MAP_H} />
     {[0, -20, -40].map(lat => <g key={lat} className="pt-grid"><line x1="0" x2={MAP_W} y1={(40 - lat) * 4} y2={(40 - lat) * 4} /><text x="4" y={(40 - lat) * 4 - 3}>{lat === 0 ? 'Equator' : `${-lat}°S`}</text></g>)}
     {!fitted && pose === TODAY && <text className="pt-ocean-label" x="270" y="250">Atlantic</text>}
     <g className="pt-land sa"><path d={pathOf(southAmerica)} />{patches('sa')}<text className="pt-land-label" x="95" y="230">South</text><text className="pt-land-label" x="95" y="248">America</text></g>
     <g className={`pt-land af${fitted ? '' : ' movable'}`} transform={poseTransform(pose)} tabIndex={fitted ? -1 : 0} role="button"
      aria-label="Africa. Drag to move, or use the arrow keys to slide and Q or E to turn. Hold Shift for bigger steps."
      onPointerDown={down} onPointerMove={moveDrag} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
      <path d={pathOf(africa)} /><path d={pathOf(madagascar)} />{patches('af')}
      <text className="pt-land-label" x="390" y="170">Africa</text>
     </g>
    </svg>
    {!fitted && <div className="pt-row">
     <button onClick={() => turn(-5)} aria-label="Turn Africa counterclockwise">⟲ Turn</button>
     <button onClick={() => turn(5)} aria-label="Turn Africa clockwise">⟳ Turn</button>
     <button className="pt-link" onClick={showFit}>Show me the fit</button>
    </div>}
    {fitted && <div className="pt-drift">
     <label htmlFor="pt-drift"><strong>{Math.round(ma) === 0 ? 'Today' : `${Math.round(ma)} million years ago`}</strong> · drag to watch the ocean open</label>
     <input id="pt-drift" type="range" min={0} max={OPEN_MA} step={1} value={OPEN_MA - ma} aria-valuetext={`${Math.round(ma)} million years ago`} onChange={e => drift(OPEN_MA - Number(e.target.value))} />
     <div className="pt-scale"><span>130 million years ago</span><span>Today</span></div>
     <button onClick={reset}>Pull them apart and try again</button>
    </div>}
    <p className="pt-help" aria-live="polite">{msg}</p>
   </div>
   <div className="pt-side">
    <p className="pt-label">Turn on clues</p>
    <div className="pt-chips" role="group" aria-label="Clues">
     {clues.map(c => <button key={c.id} aria-pressed={shown.has(c.id)} onClick={() => toggle(c.id)}><span className="pt-key" style={{ background: c.color }} aria-hidden="true" />{c.key} {c.name}</button>)}
    </div>
    {active.length === 0 && <p className="pt-muted">Each clue shows where something is found today. Turn one on, then fit the continents and see what happens to it.</p>}
    {active.map(c => <div key={c.id} className="pt-card" style={{ borderColor: c.color }}>
     <strong>{c.key} {c.name}</strong>
     <p>{c.what}</p>
     <p>{c.why}</p>
    </div>)}
    {fitted && <div className="pt-takeaway">
     <p><strong>Wegener's argument:</strong> the coastlines fit, and fossils, rocks, and glacier marks all continue across the join. One clue could be a coincidence; four clues pointing the same way are hard to explain any other way.</p>
     <p><strong>Why many scientists still said no:</strong> Wegener could not explain <em>how</em> whole continents could move. He guessed they plowed through the ocean floor, which turned out to be wrong. The answer came decades later, from the bottom of the sea. That's Clue 2.</p>
    </div>}
   </div>
  </div>
  <p className="pt-note">Coastlines are simplified, and the map is a flat drawing of a round Earth, so the fit is close but not perfect. Scientists fit the edges of the continental shelves (the shallow underwater rims of the continents), which match even better. Clue areas are approximate. The drift slider shows a straight-line slide; the real path curved and turned.</p>
 </div>;
}
