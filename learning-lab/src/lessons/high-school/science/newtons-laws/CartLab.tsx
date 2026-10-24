import { useEffect, useState } from 'react';
import { Arrow, V, fmt, ticks, useLoop, useNarrow, useReducedMotion } from './shared';

const forces = [0.5, 1, 1.5, 2, 2.5, 3];
const masses = [0.5, 1, 1.5, 2, 2.5];
const ROUGH = 0.5; // N of friction on the rough track
const L = 1.5; // m of track
const STROBE = 0.2; // s between position marks
type Trial = { id: number; F: number; m: number; f: number; a: number };
type Run = { t: number; aTrue: number; T: number; going: boolean; recorded?: boolean } | null;
type Axis = 'F' | 'm' | 'inv';
type Guess = 'double' | 'same' | 'more' | 'half' | null;

// Small random error, like a real motion sensor, so the data has to be read as data.
const measure = (a: number) => Math.round(a * (1 + (Math.random() * 2 - 1) * 0.04) * 100) / 100;

function fit(pts: { x: number; y: number }[]) {
 const n = pts.length, sx = pts.reduce((s, p) => s + p.x, 0), sy = pts.reduce((s, p) => s + p.y, 0);
 const sxx = pts.reduce((s, p) => s + p.x * p.x, 0), sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
 const den = n * sxx - sx * sx;
 if (n < 2 || Math.abs(den) < 1e-12) return null;
 const k = (n * sxy - sx * sy) / den;
 return { k, b: (sy - k * sx) / n };
}

// Two trials that differ only in `key`, with one value double the other.
function doubling(trials: Trial[], key: 'F' | 'm') {
 const other = key === 'F' ? 'm' : 'F';
 for (const p of trials) for (const q of trials) if (p.f === 0 && q.f === 0 && p[other] === q[other] && Math.abs(q[key] - 2 * p[key]) < 1e-9) return [p, q];
 return null;
}

export default function CartLab() {
 const [F, setF] = useState(1);
 const [m, setM] = useState(1);
 const [rough, setRough] = useState(false);
 const [run, setRun] = useState<Run>(null);
 const [trials, setTrials] = useState<Trial[]>([]);
 const [axis, setAxis] = useState<Axis>('F');
 const [guessF, setGuessF] = useState<Guess>(null);
 const [guessM, setGuessM] = useState<Guess>(null);
 const [stuck, setStuck] = useState(false);
 const reduced = useReducedMotion();
 const [animate, setAnimate] = useState(!reduced);
 const narrow = useNarrow();
 const f = rough ? ROUGH : 0;

 useLoop(!!run?.going, dt => setRun(r => r && { ...r, t: Math.min(r.T, r.t + dt), going: r.t + dt < r.T }));
 // Record each run once, when it reaches the end of the track.
 useEffect(() => {
  if (!run || run.going || run.recorded) return;
  setTrials(ts => [...ts, { id: (ts[ts.length - 1]?.id ?? 0) + 1, F, m, f, a: measure(run.aTrue) }]);
  setRun({ ...run, recorded: true });
 }, [run, F, m, f]);

 const start = () => {
  const aTrue = (F - f) / m;
  setStuck(aTrue <= 0);
  if (aTrue <= 0) { setRun(null); return; }
  const T = Math.sqrt(2 * L / aTrue);
  setRun(animate ? { t: 0, aTrue, T, going: true } : { t: T, aTrue, T, going: false });
 };
 const change = (fn: () => void) => { fn(); setRun(null); setStuck(false); };

 const t = run?.t ?? 0, aNow = run?.aTrue ?? 0;
 const x = 0.5 * aNow * t * t, v = aNow * t;
 const last = trials[trials.length - 1];
 const justDone = run?.recorded && last;

 // Track drawing.
 const W = narrow ? 380 : 640, H = 168, T0 = 30, T1 = W - 30, rail = 86;
 const cw = 70, ppm = (T1 - T0 - cw - 100) / L, cx = T0 + x * ppm;
 const blocks = Math.round((m - 0.5) / 0.5);
 const strobe: number[] = [];
 for (let s = 0; s <= t + 1e-9; s += STROBE) strobe.push(0.5 * aNow * s * s);

 // Graph of the recorded data.
 const xOf = (tr: Trial) => axis === 'F' ? tr.F : axis === 'm' ? tr.m : 1 / tr.m;
 const pts = trials.map(tr => ({ x: xOf(tr), y: tr.a, id: tr.id }));
 const sameM = trials.every(tr => tr.m === trials[0]?.m), sameF = trials.every(tr => tr.F === trials[0]?.F);
 const sameFr = trials.every(tr => tr.f === trials[0]?.f);
 const controlled = trials.length > 0 && sameFr && (axis === 'F' ? sameM : sameF);
 const distinctX = new Set(pts.map(p => p.x)).size;
 const line = axis !== 'm' && controlled && distinctX >= 2 ? fit(pts) : null;
 const GW = narrow ? 380 : 560, GH = narrow ? 260 : 250, G0 = 50, G1 = GW - 16, GT = 14, GB = GH - 38;
 const xMax = axis === 'F' ? 3.2 : axis === 'm' ? 2.7 : 2.1, yMax = Math.max(1, ...pts.map(p => p.y)) * 1.12;
 const gx = (v: number) => G0 + v / xMax * (G1 - G0), gy = (v: number) => GB - v / yMax * (GB - GT);
 const xTitle = axis === 'F' ? 'pulling force F (N)' : axis === 'm' ? 'mass m (kg)' : '1 / mass (1/kg)';

 const pairF = doubling(trials, 'F'), pairM = doubling(trials, 'm');

 return <div className="nl-panel">
  <p>Pull a low-friction cart along a 1.5 m track with a steady force and measure its acceleration. Change one thing at a time, record trials, and look for the rule in your data.</p>

  <div className="nl-two">
   <div className="nl-predict">
    <span><strong>Experiment A.</strong> Keep the mass the same. If you <strong>double the pulling force</strong>, the acceleration will…</span>
    <div className="nl-row nl-small">
     {([['double', 'double'], ['same', 'stay the same'], ['more', 'increase a little'], ['half', 'halve']] as const).map(([id, text]) => <button key={id} aria-pressed={guessF === id} onClick={() => setGuessF(id)}>{text}</button>)}
    </div>
    {guessF && !pairF && <p className="nl-hint">Now test it on the smooth track: for example 1 N and 2 N with the same mass.</p>}
    {guessF && pairF && <p className={`nl-feedback ${guessF === 'double' ? 'good' : 'bad'}`}>{guessF === 'double' ? 'Your data agrees. ' : 'Check your data. '}With {fmt(pairF[0].m)} kg, {fmt(pairF[0].F)} N gave {fmt(pairF[0].a)} m/s² and {fmt(pairF[1].F)} N gave {fmt(pairF[1].a)} m/s². Twice the force, about twice the acceleration: <V>a</V> is proportional to <V>F</V>.</p>}
   </div>
   <div className="nl-predict">
    <span><strong>Experiment B.</strong> Keep the force the same. If you <strong>double the mass</strong>, the acceleration will…</span>
    <div className="nl-row nl-small">
     {([['double', 'double'], ['same', 'stay the same'], ['more', 'decrease a little'], ['half', 'halve']] as const).map(([id, text]) => <button key={id} aria-pressed={guessM === id} onClick={() => setGuessM(id)}>{text}</button>)}
    </div>
    {guessM && !pairM && <p className="nl-hint">Now test it on the smooth track: for example 1 kg and 2 kg with the same force.</p>}
    {guessM && pairM && <p className={`nl-feedback ${guessM === 'half' ? 'good' : 'bad'}`}>{guessM === 'half' ? 'Your data agrees. ' : 'Check your data. '}With {fmt(pairM[0].F)} N, {fmt(pairM[0].m)} kg gave {fmt(pairM[0].a)} m/s² and {fmt(pairM[1].m)} kg gave {fmt(pairM[1].a)} m/s². Twice the mass, about half the acceleration: <V>a</V> is inversely proportional to <V>m</V>.</p>}
   </div>
  </div>

  <div className="nl-controls">
   <div>
    <span className="nl-label">Pulling force <V>F</V></span>
    <div className="nl-seg" role="group" aria-label="Pulling force in newtons">
     {forces.map(v => <button key={v} aria-pressed={F === v} onClick={() => change(() => setF(v))}>{fmt(v)} N</button>)}
    </div>
   </div>
   <div>
    <span className="nl-label">Cart mass <V>m</V> (0.5 kg cart + 0.5 kg blocks)</span>
    <div className="nl-seg" role="group" aria-label="Cart mass in kilograms">
     {masses.map(v => <button key={v} aria-pressed={m === v} onClick={() => change(() => setM(v))}>{fmt(v)} kg</button>)}
    </div>
   </div>
   <div>
    <span className="nl-label">Track</span>
    <div className="nl-seg" role="group" aria-label="Track friction">
     <button aria-pressed={!rough} onClick={() => change(() => setRough(false))}>Smooth (no friction)</button>
     <button aria-pressed={rough} onClick={() => change(() => setRough(true))}>Rough ({ROUGH} N friction)</button>
    </div>
   </div>
  </div>

  <div className="nl-row">
   <button className="nl-primary" disabled={!!run?.going} onClick={start}>▶ Run trial</button>
   <label className="nl-check"><input type="checkbox" checked={animate} onChange={e => setAnimate(e.target.checked)} /> Animate the run</label>
  </div>

  <figure className="nl-figure">
   <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Cart of ${fmt(m)} kilograms pulled by ${fmt(F)} newtons${f ? ` against ${f} newtons of friction` : ''}. ${run ? `It has moved ${fmt(x)} meters after ${fmt(t)} seconds.` : 'Ready to run.'}`}>
    <rect className={rough ? 'nl-rail rough' : 'nl-rail'} x={T0} y={rail} width={T1 - T0} height={8} rx={3} />
    <line className="nl-finish" x1={T0 + L * ppm + cw} x2={T0 + L * ppm + cw} y1={rail - 52} y2={rail + 8} />
    <g transform={`translate(${cx},0)`}>
     <rect className="nl-cart" x={0} y={rail - 26} width={cw} height={22} rx={4} />
     {Array.from({ length: blocks }, (_, i) => <rect key={i} className="nl-mass-block" x={6 + (i % 4) * 15} y={rail - 40 - Math.floor(i / 4) * 13} width={13} height={13} rx={2} />)}
     <circle className="nl-wheel" cx={14} cy={rail - 2} r={6} /><circle className="nl-wheel" cx={cw - 14} cy={rail - 2} r={6} />
    </g>
    <Arrow kind="applied" x={cx + cw} y={rail - 15} dx={F * 22} dy={0} label={`F = ${fmt(F)} N`} labelSide="above" />
    {f > 0 && <Arrow kind="friction" x={cx + 6} y={rail - 2} dx={-f * 22 - 8} dy={0} label={`${f} N`} />}
    <line className="nl-axis" x1={T0 + cw} x2={T0 + cw + L * ppm} y1={rail + 36} y2={rail + 36} />
    {[0, 0.5, 1, 1.5].map(d => <g key={d} className="nl-tick"><line className="zero" x1={T0 + cw + d * ppm} x2={T0 + cw + d * ppm} y1={rail + 32} y2={rail + 40} /><text x={T0 + cw + d * ppm} y={rail + 56} textAnchor="middle">{d} m</text></g>)}
    {strobe.map((d, i) => <circle key={i} className="nl-strobe" cx={T0 + cw + d * ppm} cy={rail + 36} r={4} />)}
   </svg>
   <figcaption>Dots mark the front of the cart every {STROBE} s. Growing gaps mean the cart is speeding up.</figcaption>
  </figure>

  <div className="nl-readout" aria-live="polite">
   <div><span>Time</span><strong>{fmt(t)} s</strong></div>
   <div><span>Distance</span><strong>{fmt(x)} m</strong></div>
   <div><span>Speed</span><strong>{fmt(v)} m/s</strong></div>
   <div><span>Measured acceleration</span><strong>{justDone ? `${fmt(last.a)} m/s²` : '–'}</strong></div>
  </div>
  {stuck && <p className="nl-feedback bad">The cart didn't move. A {fmt(F)} N pull is no more than the {ROUGH} N of friction, so the net force is zero. Pull harder or use the smooth track.</p>}
  {justDone && <p className="nl-hint">Recorded as trial {last.id}. The sensor reading has a small random error, like real lab data.</p>}

  <h3>Your data</h3>
  {trials.length === 0 ? <p className="nl-hint">Each run you finish is recorded here.</p> : <>
   <div className="nl-table-wrap">
    <table className="nl-table">
     <thead><tr><th scope="col">Trial</th><th scope="col">Pull <V>F</V> (N)</th><th scope="col">Friction (N)</th><th scope="col">Mass <V>m</V> (kg)</th><th scope="col">Measured <V>a</V> (m/s²)</th><th scope="col"><V>m</V> × <V>a</V> (N)</th><th scope="col"><span className="nl-sr">Remove</span></th></tr></thead>
     <tbody>{trials.map(tr => <tr key={tr.id}><td>{tr.id}</td><td>{fmt(tr.F)}</td><td>{fmt(tr.f)}</td><td>{fmt(tr.m)}</td><td>{fmt(tr.a)}</td><td>{fmt(tr.m * tr.a)}</td><td><button className="nl-link" aria-label={`Remove trial ${tr.id}`} onClick={() => setTrials(ts => ts.filter(x => x.id !== tr.id))}>✕</button></td></tr>)}</tbody>
    </table>
   </div>
   <div className="nl-row"><button onClick={() => setTrials([])}>Clear all trials</button></div>
  </>}

  <div className="nl-row">
   <span className="nl-label">Graph acceleration against</span>
   <div className="nl-seg" role="group" aria-label="Horizontal axis of the graph">
    <button aria-pressed={axis === 'F'} onClick={() => setAxis('F')}>force <V>F</V></button>
    <button aria-pressed={axis === 'm'} onClick={() => setAxis('m')}>mass <V>m</V></button>
    <button aria-pressed={axis === 'inv'} onClick={() => setAxis('inv')}>1 / <V>m</V></button>
   </div>
  </div>
  <figure className="nl-figure nl-graph">
   <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={`Scatter graph of measured acceleration against ${xTitle}, ${pts.length} points.${line ? ` Best-fit line slope ${fmt(line.k)}, intercept ${fmt(line.b)}.` : ''}`}>
    <line className="nl-axis" x1={G0} x2={G1} y1={GB} y2={GB} /><line className="nl-axis" x1={G0} x2={G0} y1={GT} y2={GB} />
    {ticks(0, yMax, 4).map(v => <g key={v} className="nl-tick"><line x1={G0 - 4} x2={G1} y1={gy(v)} y2={gy(v)} className={v === 0 ? 'zero' : ''} /><text x={G0 - 8} y={gy(v)} dy="0.35em" textAnchor="end">{fmt(v, 1)}</text></g>)}
    {ticks(0, xMax, narrow ? 4 : 6).map(v => <g key={v} className="nl-tick"><line x1={gx(v)} x2={gx(v)} y1={GB} y2={GB + 4} /><text x={gx(v)} y={GB + 18} textAnchor="middle">{fmt(v, 1)}</text></g>)}
    <text className="nl-axis-title" x={G1} y={GH - 4} textAnchor="end">{xTitle}</text>
    <text className="nl-axis-title" x={G0 + 6} y={GT + 2} dy="0.35em">acceleration a (m/s²)</text>
    {line && <line className="nl-fit" x1={gx(Math.max(0, -line.b / line.k > 0 ? -line.b / line.k : 0))} y1={gy(Math.max(0, line.b))} x2={gx(xMax)} y2={gy(line.k * xMax + line.b)} />}
    {pts.map(p => <circle key={p.id} className={`nl-pt ${controlled ? '' : 'mixed'}`} cx={gx(p.x)} cy={gy(p.y)} r={5} />)}
   </svg>
  </figure>

  <div className="nl-explain" aria-live="polite">
   {trials.length < 2 && <p>Record at least two trials to start seeing a pattern.</p>}
   {trials.length >= 2 && !sameFr && <p>Some trials use the rough track and some the smooth one. Compare like with like: clear the table or remove trials so all use the same track.</p>}
   {trials.length >= 2 && sameFr && axis === 'F' && !sameM && <p>These trials use different masses, so the graph mixes two effects. To see what force alone does, keep the mass the same in every trial.</p>}
   {trials.length >= 2 && sameFr && axis !== 'F' && !sameF && <p>These trials use different pulling forces, so the graph mixes two effects. To see what mass alone does, keep the force the same in every trial.</p>}
   {line && axis === 'F' && <p><strong>A straight line.</strong> Acceleration rises in proportion to force. The slope is {fmt(line.k)} per kg, close to 1 ÷ {fmt(trials[0].m)} kg = {fmt(1 / trials[0].m)}: the slope of <V>a</V> against <V>F</V> is 1/<V>m</V>.
    {trials[0].f > 0 ? <> On the rough track the line misses the origin and crosses the force axis near {fmt(-line.b / line.k, 1)} N. That much of every pull just cancels friction; only the rest, the <strong>net</strong> force, accelerates the cart.</> : ' On the smooth track the line passes (close to) the origin: no force, no acceleration.'}</p>}
   {controlled && axis === 'm' && distinctX >= 2 && <p><strong>A curve, not a line.</strong> More mass means less acceleration, but not in a straight-line way: doubling the mass halves the acceleration. When one thing halves as another doubles, try graphing against the reciprocal. Switch the axis to 1 / <V>m</V>.</p>}
   {line && axis === 'inv' && <p><strong>Now it's a straight line.</strong> Acceleration is proportional to 1/<V>m</V>. The slope is {fmt(line.k)} N, close to the net force on the cart ({fmt(trials[0].F - trials[0].f)} N): <V>a</V> = <V>F</V><sub>net</sub> × (1/<V>m</V>).</p>}
   <p>Look at the last column of the table too. Mass times measured acceleration comes out close to the net force (pull minus friction) every time.</p>
  </div>

  <div className="nl-takeaway">
   <p><strong>Newton's second law.</strong> The acceleration of an object is proportional to the net force on it and inversely proportional to its mass: <span className="nl-eq"><V>a</V> = <V>F</V><sub>net</sub> / <V>m</V></span>, usually written <span className="nl-eq"><V>F</V><sub>net</sub> = <V>m</V><V>a</V></span>. Acceleration points the same way as the net force.</p>
   <p>This is also what a newton is: 1 N is the net force that gives a 1 kg mass an acceleration of 1 m/s².</p>
  </div>
 </div>;
}
