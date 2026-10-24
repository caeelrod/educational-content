import { useEffect, useRef, useState } from 'react';
import { ONE, dec, div, q, sub } from './frac';
import { Frac, Num, V, useNarrow } from './MathText';

type Use = 'decimals' | 'ball';
const blocks = ['9', '3', '27', '142857', '012'];
const G = 9.8;

function Decimals() {
 const [block, setBlock] = useState('27');
 const digits = block.replace(/\D/g, '').slice(0, 6) || '9';
 const L = digits.length, B = Number(digits), P = 10 ** L;
 const a = q(B, P), r = q(1, P), sum = div(a, sub(ONE, r));
 const shown = (digits.repeat(Math.ceil(12 / L))).slice(0, 12);
 return <div>
  <p>A repeating decimal is a geometric series in disguise. Each copy of the repeating block is the previous copy shifted {L} place{L > 1 ? 's' : ''} to the right, which is the same as multiplying by <Num v={r} />.</p>
  <div className="gs-controls">
   <div><label className="gs-label" htmlFor="gs-block">Repeating block (up to 6 digits)</label>
    <input id="gs-block" className="gs-input" inputMode="numeric" value={block} maxLength={6} onChange={e => setBlock(e.target.value.replace(/\D/g, ''))} /></div>
   <div><span className="gs-label">Try</span>
    <div className="gs-chips" role="group" aria-label="Example blocks">{blocks.map(b => <button key={b} aria-pressed={digits === b} onClick={() => setBlock(b)}>0.{b}{b}…</button>)}</div></div>
  </div>
  <p className="gs-series big">0.{shown}… = <Num v={a} /> + <Frac top={B} bottom={P * P} /> + <Frac top={B} bottom={P * P * P} /> + ⋯</p>
  <p>First term <V>a</V> = <Num v={a} />, ratio <V>r</V> = <Num v={r} />, and |<V>r</V>| &lt; 1, so</p>
  <p className="gs-formula gs-center"><Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} /> = <Frac top={<Num v={a} />} bottom={<>1 − <Num v={r} /></>} /> = <Frac top={B} bottom={P - 1} />{(sum.d !== P - 1 || sum.n !== B) && <> = <Num v={sum} /></>}</p>
  {digits === '9'
   ? <div className="gs-takeaway"><p><strong>So 0.999… = 1 exactly.</strong> Not "almost 1". After <V>n</V> nines the gap to 1 is 1/10<sup>n</sup>, and the infinite decimal means the limit of those partial sums. The gap shrinks below every positive number, so the only value the limit can be is 1. If 0.999… were less than 1, you could name a number between them, and there isn't one.</p></div>
   : <p className="gs-aside">This is the rule you may have memorized, "put the block over that many 9s", and now you can see where it comes from: 1 − 1/10<sup>{L}</sup> has {L} nine{L > 1 ? 's' : ''} in its numerator.</p>}
 </div>;
}

function Ball() {
 const [h, setH] = useState(2);
 const [r, setR] = useState(0.6);
 const [t, setT] = useState<number | null>(null);
 const raf = useRef(0);
 const narrow = useNarrow();
 const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
 const dist = h + 2 * h * r / (1 - r);
 const t0 = Math.sqrt(2 * h / G), sr = Math.sqrt(r);
 const time = t0 * (1 + sr) / (1 - sr);

 // Ball path: drop, then bounces k = 1, 2, … reaching height h·rᵏ, each lasting 2·t0·(√r)ᵏ.
 const bounces = Array.from({ length: 30 }, (_, k) => ({ peak: h * r ** (k + 1), dur: 2 * t0 * sr ** (k + 1) }));
 const W = narrow ? 380 : 600, H = 220, top = 18, floor = 196, Hmax = 5;
 const totalShown = time;
 const px = (s: number) => 20 + s / totalShown * (W - 40);
 const py = (y: number) => floor - y / Hmax * (floor - top);
 const pts: string[] = [];
 for (let i = 0; i <= 20; i++) { const s = t0 * i / 20; pts.push(`${px(s)},${py(h - G * s * s / 2)}`); }
 let start = t0;
 for (const b of bounces) {
  for (let i = 1; i <= 16; i++) { const s = b.dur * i / 16, v = G * b.dur / 2; pts.push(`${px(start + s)},${py(Math.max(0, v * s - G * s * s / 2))}`); }
  start += b.dur;
 }
 function heightAt(s: number) {
  if (s <= t0) return h - G * s * s / 2;
  let st = t0;
  for (const b of bounces) { if (s <= st + b.dur) { const u = s - st, v = G * b.dur / 2; return Math.max(0, v * u - G * u * u / 2); } st += b.dur; }
  return 0;
 }
 useEffect(() => () => cancelAnimationFrame(raf.current), []);
 function drop() {
  cancelAnimationFrame(raf.current);
  if (reduce) { setT(time); return; }
  const begin = performance.now();
  const tick = (now: number) => { const s = (now - begin) / 1000; if (s >= time) { setT(time); return; } setT(s); raf.current = requestAnimationFrame(tick); };
  raf.current = requestAnimationFrame(tick);
 }
 const set = (fn: () => void) => { cancelAnimationFrame(raf.current); setT(null); fn(); };

 return <div>
  <p>Drop a ball from height <V>h</V>. Each bounce reaches a fixed fraction <V>r</V> of the height before. It falls <V>h</V>, then goes up and down <V>h</V><V>r</V>, then up and down <V>h</V><V>r</V><sup>2</sup>, and so on, bouncing infinitely many times in this model. How far does it travel?</p>
  <div className="gs-controls">
   <div className="gs-grow"><label className="gs-label" htmlFor="gs-h">Drop height <V>h</V> = {h} m</label>
    <input id="gs-h" type="range" min={1} max={5} step={0.5} value={h} onChange={e => set(() => setH(Number(e.target.value)))} /></div>
   <div className="gs-grow"><label className="gs-label" htmlFor="gs-br">Bounce ratio <V>r</V> = {r.toFixed(2)}</label>
    <input id="gs-br" type="range" min={0.3} max={0.9} step={0.05} value={r} onChange={e => set(() => setR(Number(e.target.value)))} /></div>
  </div>
  <figure className="gs-figure wide">
   <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Height of the ball over time. It is dropped from ${h} meters and each bounce reaches ${r.toFixed(2)} of the previous height.`}>
    <line className="gs-axis" x1={10} x2={W - 10} y1={floor} y2={floor} />
    <line className="gs-target" x1={px(time)} x2={px(time)} y1={top} y2={floor} />
    <text className="gs-target-label" x={px(time) - 4} y={top + 10} textAnchor="end">{narrow ? '' : 'all bounces done: '}{time.toFixed(2)} s</text>
    <polyline className="gs-path" points={pts.join(' ')} />
    {t !== null && <circle className="gs-ball" cx={px(t)} cy={py(heightAt(t)) - 7} r={7} />}
    <text className="gs-axis-title" x={W - 12} y={H - 6} textAnchor="end">time →</text>
   </svg>
   <figcaption>Height against time. The bounces get shorter <em>and</em> quicker.</figcaption>
  </figure>
  <div className="gs-row"><button className="gs-primary" onClick={drop}>Drop the ball</button></div>
  <p className="gs-series big">distance = <V>h</V> + 2<V>h</V><V>r</V> + 2<V>h</V><V>r</V><sup>2</sup> + ⋯ = <V>h</V> + <Frac top={<>2<V>h</V><V>r</V></>} bottom={<>1 − <V>r</V></>} /> = <strong>{dec(dist, 4)} m</strong></p>
  <p>The part after the first drop is a geometric series with first term 2<V>h</V><V>r</V> (up and back down the first bounce) and ratio <V>r</V>. Watch the first term: it is <em>not</em> <V>h</V>, because the first drop is only one way. Splitting off terms that don't fit the pattern is a move you'll use constantly.</p>
  <div className="gs-takeaway"><p><strong>Infinitely many bounces in finite time.</strong> A fall from height <V>y</V> takes √(2<V>y</V>/<V>g</V>), so each bounce lasts √<V>r</V> times as long as the one before. The bounce times form a geometric series too, with ratio √<V>r</V> = {sr.toFixed(3)} &lt; 1, so they add up to {time.toFixed(2)} seconds. This is Zeno's paradox with a happy ending.</p></div>
  <p className="gs-aside">Model: no air resistance, <V>g</V> = 9.8 m/s², and the same bounce ratio every time. A real ball's ratio changes a little with speed, and it stops after a finite number of bounces once they get tiny, but the totals stay close.</p>
 </div>;
}

export default function Uses() {
 const [use, setUse] = useState<Use>('decimals');
 return <div className="gs-panel">
  <div className="gs-seg" role="group" aria-label="Example">
   <button aria-pressed={use === 'decimals'} onClick={() => setUse('decimals')}>Repeating decimals</button>
   <button aria-pressed={use === 'ball'} onClick={() => setUse('ball')}>Bouncing ball</button>
  </div>
  {use === 'decimals' ? <Decimals /> : <Ball />}
 </div>;
}
