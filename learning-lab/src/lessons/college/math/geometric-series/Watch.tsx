import { useEffect, useRef, useState } from 'react';
import { ONE, abs, dec, div, eq, fromSlider, q, say, sub, val, type Q } from './frac';
import { Frac, Num, V, useNarrow } from './MathText';

const MAX = 40;
const presets: Q[] = [q(1, 2), q(1, 3), q(2, 3), q(9, 10), q(-1, 2), q(-4, 5), q(1), q(-1), q(6, 5)];
type Guess = 'settles' | 'runs' | null;

function ticks(lo: number, hi: number, count = 6) {
 const span = hi - lo || 1, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw));
 const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= count) ?? mag * 10;
 const out: number[] = [];
 for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) out.push(Math.abs(t) < 1e-12 ? 0 : t);
 return out;
}

export default function Watch() {
 const [a, setA] = useState(1);
 const [r, setR] = useState<Q>(q(1, 2));
 const [n, setN] = useState(1);
 const [playing, setPlaying] = useState(false);
 const [guess, setGuess] = useState<Guess>(null);
 const timer = useRef<number>(undefined);
 const narrow = useNarrow();

 const rv = val(r);
 const converges = Math.abs(rv) < 1;
 const target = eq(r, ONE) ? null : div(q(a), sub(ONE, r));
 const T = target ? val(target) : NaN;
 const terms = Array.from({ length: n }, (_, k) => a * rv ** k);
 const sums: number[] = [];
 terms.reduce((s, t) => { sums.push(s + t); return s + t; }, 0);
 const Sn = sums[n - 1];
 const gap = T - Sn, prevGap = n > 1 ? T - sums[n - 2] : T;

 useEffect(() => {
  if (!playing) return;
  timer.current = window.setInterval(() => setN(k => k + 1), 450);
  return () => window.clearInterval(timer.current);
 }, [playing]);
 useEffect(() => { if (n >= MAX) setPlaying(false); }, [n]);

 const restart = (na: number, nr: Q) => { setA(na); setR(nr); setN(1); setPlaying(false); setGuess(null); };

 // Number line and graph share one vertical/horizontal value range.
 const vals = [0, ...sums, ...(converges ? [T] : [])];
 let lo = Math.min(...vals), hi = Math.max(...vals);
 if (hi - lo < 1e-9) hi = lo + 1;
 const padV = (hi - lo) * 0.06; lo -= padV; hi += padV;
 const W = narrow ? 380 : 640, X0 = 28, X1 = W - 28;
 const x = (v: number) => X0 + (v - lo) / (hi - lo) * (X1 - X0);
 const base = 86;
 const tickVals = ticks(lo, hi, narrow ? 4 : 6);

 const hops = sums.map((s, k) => {
  const from = k === 0 ? 0 : sums[k - 1];
  const x0 = x(from), x1 = x(s), len = Math.abs(x1 - x0);
  const h = Math.min(56, Math.max(8, len * 0.45)) * (x1 >= x0 ? -1 : 0.7);
  return { d: `M${x0},${base} Q${(x0 + x1) / 2},${base + h * 2} ${x1},${base}`, k, len };
 });

 const GW = narrow ? 380 : 640, GH = narrow ? 260 : 230, G0 = 44, G1 = GW - 16, GT = 14, GB = GH - 30;
 const nMax = Math.max(10, n);
 const gx = (k: number) => G0 + (k - 1) / (nMax - 1) * (G1 - G0);
 const gy = (v: number) => GB - (v - lo) / (hi - lo) * (GB - GT);

 const regime = rv === 0 ? 'zero' : converges ? (rv > 0 ? 'pos' : 'neg') : rv === 1 ? 'one' : rv === -1 ? 'flip' : 'blow';
 const covered = Math.round((1 - rv) * 100);
 const showGuess = n >= 8 && guess;
 const guessRight = guess === (converges ? 'settles' : 'runs');
 const rows = sums.map((s, k) => ({ k: k + 1, t: terms[k], s, g: T - s })).slice(-6);

 return <div className="gs-panel">
  <div className="gs-controls">
   <div>
    <span className="gs-label">First term <V>a</V></span>
    <div className="gs-seg" role="group" aria-label="First term a">
     {[1, 2, 3, 4].map(v => <button key={v} aria-pressed={a === v} onClick={() => restart(v, r)}>{v}</button>)}
    </div>
   </div>
   <div className="gs-grow">
    <label className="gs-label" htmlFor="gs-r">Ratio <V>r</V> = <strong>{say(r)}</strong></label>
    <input id="gs-r" type="range" min={-1.25} max={1.25} step={0.05} value={rv} aria-valuetext={say(r)}
     onChange={e => restart(a, fromSlider(Number(e.target.value)))} />
    <div className="gs-chips" role="group" aria-label="Ratio presets">
     {presets.map(p => <button key={say(p)} aria-pressed={eq(p, r)} onClick={() => restart(a, p)}>{say(p)}</button>)}
    </div>
   </div>
  </div>

  <p className="gs-series big" aria-label={`Series: ${a} plus ${a} times ${say(r)} plus ${a} times ${say(r)} squared, and so on`}>
   {terms.slice(0, 4).map((t, k) => <span key={k}>{k > 0 && (t < 0 ? ' − ' : ' + ')}<span className={k === n - 1 ? 'gs-hl' : ''}>{dec(Math.abs(t), 4)}</span></span>)}
   {n > 4 && <> + ⋯ {terms[n - 1] < 0 ? '−' : '+'} <span className="gs-hl">{dec(Math.abs(terms[n - 1]), 4)}</span></>}
   {' + ⋯'}
  </p>

  {!guess && <div className="gs-predict">
   <span>Predict before you add terms: will the running total settle down?</span>
   <div className="gs-row"><button onClick={() => setGuess('settles')}>It settles on a number</button><button onClick={() => setGuess('runs')}>It never settles</button></div>
  </div>}

  <div className="gs-row">
   <button className="gs-primary" disabled={n >= MAX} onClick={() => setN(n + 1)}>Add the next term</button>
   <button disabled={n >= MAX} onClick={() => setPlaying(p => !p)} aria-pressed={playing}>{playing ? '⏸ Pause' : '▶ Keep adding'}</button>
   <button disabled={n >= MAX} onClick={() => setN(Math.min(MAX, n + 10))}>+10 terms</button>
   <button disabled={n === 1} onClick={() => restart(a, r)}>Start over</button>
  </div>

  <figure className="gs-figure wide">
   <svg viewBox={`0 0 ${W} 172`} role="img" aria-label={`Number line. After ${n} terms the running total is ${dec(Sn)}.${converges ? ` The target a over 1 minus r is ${say(target!)} and the gap is ${dec(gap)}.` : ''}`}>
    <line className="gs-axis" x1={X0 - 10} x2={X1 + 10} y1={base} y2={base} />
    {tickVals.map(t => <g key={t} className="gs-tick"><line x1={x(t)} x2={x(t)} y1={base - 4} y2={base + 4} /><text x={x(t)} y={base + 18} textAnchor="middle">{dec(t, 3)}</text></g>)}
    {converges && <>
     <line className="gs-gapbar" x1={x(Sn)} x2={x(T)} y1={base} y2={base} />
     <line className="gs-target" x1={x(T)} x2={x(T)} y1={22} y2={base + 26} />
     <text className="gs-target-label" x={x(T)} y={14} textAnchor={x(T) > W - 120 ? 'end' : x(T) < 120 ? 'start' : 'middle'}>{narrow ? 'target' : 'target a/(1−r)'} = {say(target!)}</text>
    </>}
    {hops.map(h => <path key={h.k} className={`gs-hop ${h.k === n - 1 ? 'last' : ''}`} d={h.d} />)}
    <circle className="gs-start" cx={x(0)} cy={base} r={4} />
    {sums.slice(Math.max(0, n - 12)).map((s, i) => <circle key={i} className="gs-dot" cx={x(s)} cy={base} r={3} />)}
    <circle className="gs-now" cx={x(Sn)} cy={base} r={6} />
    <text className="gs-now-label" x={x(Sn)} y={base + 40} textAnchor={x(Sn) > W - 80 ? 'end' : x(Sn) < 80 ? 'start' : 'middle'}>S{sub2(n)} = {dec(Sn, 5)}</text>
    {converges && Math.abs(gap) > 1e-9 && <text className="gs-gap-label" x={W / 2} y={166} textAnchor="middle">gap to target: {dec(Math.abs(gap), 4)}</text>}
   </svg>
  </figure>

  <div className="gs-readout" aria-live="polite">
   <div><span>Terms added</span><strong>{n}</strong></div>
   <div><span>Running total <V>S</V><sub>{n}</sub></span><strong>{dec(Sn)}</strong></div>
   {converges && <div><span>Gap to target</span><strong>{dec(gap)}</strong></div>}
   {converges && n > 1 && <div><span>Gap now ÷ gap before</span><strong>{dec(gap / prevGap, 4)}</strong></div>}
  </div>

  {showGuess && <p className={`gs-feedback ${guessRight ? 'good' : 'bad'}`}>
   {guessRight ? 'Your prediction holds up. ' : 'Not what you predicted. '}
   {converges ? `With |r| = ${say(abs(r))} < 1 the running total closes in on ${say(target!)}.` : `With |r| = ${say(abs(r))} ≥ 1 the terms never shrink toward 0, so the running total can't settle.`}
  </p>}

  <div className="gs-explain">
   {regime === 'pos' && <p><strong>Why it settles.</strong> Each new term covers {covered}% of the remaining gap and leaves the other {100 - covered}%. In other words, every step multiplies the gap by <V>r</V> = {say(r)} (check the last readout). A gap that keeps getting multiplied by a number between −1 and 1 shrinks toward 0, so the running totals close in on the target.</p>}
   {regime === 'neg' && <p><strong>Why it zigzags and still settles.</strong> A negative <V>r</V> flips the sign of every other term, so the running total overshoots the target, then undershoots, landing on alternate sides. The gap is still multiplied by <V>r</V> = {say(r)} each step (the sign flip is the side switch), and since |<V>r</V>| &lt; 1 it still shrinks to 0.</p>}
   {regime === 'zero' && <p><strong>Every term after the first is 0,</strong> so the sum is just <V>a</V> = {a}. Boring, but it fits the formula: <V>a</V>/(1 − 0) = {a}.</p>}
   {regime === 'one' && <p><strong>Diverges.</strong> Every term equals <V>a</V>, so after <V>n</V> terms the total is <V>n</V>·<V>a</V> = {n * a}. It grows without bound. The formula <V>a</V>/(1 − <V>r</V>) would divide by zero here, which is a warning sign rather than an answer.</p>}
   {regime === 'flip' && <p><strong>Diverges, even though it stays bounded.</strong> The terms go {a}, −{a}, {a}, −{a}, … so the running total flips between {a} and 0 forever and never settles on one number. Plugging in anyway gives <V>a</V>/(1 − (−1)) = {say(target!)}, which is not the sum. The formula only applies when |<V>r</V>| &lt; 1.</p>}
   {regime === 'blow' && <p><strong>Diverges.</strong> With |<V>r</V>| &gt; 1 each term is bigger than the last, so the running total runs off{rv < 0 ? ', swinging wider each time' : ''}. Careful: <V>a</V>/(1 − <V>r</V>) = {say(target!)} is a perfectly good number, but it is <em>not</em> the sum. The formula only applies when |<V>r</V>| &lt; 1, so always check the ratio first.</p>}
   {converges && <p className="gs-formula">Gap after <V>n</V> terms = target × <V>r</V><sup>n</sup>, so <V>S</V><sub>n</sub> = <Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} />(1 − <V>r</V><sup>n</sup>) = <Frac top={<><V>a</V>(1 − <V>r</V><sup>n</sup>)</>} bottom={<>1 − <V>r</V></>} />. As <V>n</V> → ∞, <V>r</V><sup>n</sup> → 0 and <V>S</V> = <Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} /> = <Num v={target!} />.</p>}
  </div>

  <figure className="gs-figure wide">
   <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={`Graph of the running total against the number of terms, for n from 1 to ${n}.`}>
    <line className="gs-axis" x1={G0} x2={G1} y1={GB} y2={GB} />
    <line className="gs-axis" x1={G0} x2={G0} y1={GT} y2={GB} />
    {tickVals.map(t => <g key={t} className="gs-tick"><line x1={G0 - 4} x2={G0} y1={gy(t)} y2={gy(t)} /><text x={G0 - 8} y={gy(t)} dy="0.35em" textAnchor="end">{dec(t, 3)}</text></g>)}
    {ticks(1, nMax, narrow ? 5 : 8).filter(k => Number.isInteger(k)).map(k => <g key={k} className="gs-tick"><line x1={gx(k)} x2={gx(k)} y1={GB} y2={GB + 4} /><text x={gx(k)} y={GB + 18} textAnchor="middle">{k}</text></g>)}
    <text className="gs-axis-title" x={G1} y={GH - 2} textAnchor="end">terms added, n</text>
    {converges && <line className="gs-target" x1={G0} x2={G1} y1={gy(T)} y2={gy(T)} />}
    <polyline className="gs-path" points={sums.map((s, k) => `${gx(k + 1)},${gy(s)}`).join(' ')} />
    {sums.map((s, k) => <circle key={k} className={k === n - 1 ? 'gs-now' : 'gs-dot'} cx={gx(k + 1)} cy={gy(s)} r={k === n - 1 ? 5 : 3} />)}
   </svg>
   <figcaption>Running total <V>S</V><sub>n</sub> after each term{converges ? ', with the target as a dashed line' : ''}.</figcaption>
  </figure>

  <div className="gs-table-wrap">
   <table className="gs-table">
    <caption>Last few steps</caption>
    <thead><tr><th scope="col"><V>n</V></th><th scope="col">term <V>a</V><V>r</V><sup>n−1</sup></th><th scope="col"><V>S</V><sub>n</sub></th>{converges && <th scope="col">gap</th>}</tr></thead>
    <tbody>{rows.map(row => <tr key={row.k}><td>{row.k}</td><td>{dec(row.t)}</td><td>{dec(row.s)}</td>{converges && <td>{dec(row.g)}</td>}</tr>)}</tbody>
   </table>
  </div>
 </div>;
}

const sub2 = (n: number) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');
