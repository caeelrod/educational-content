import { useEffect, useState, type KeyboardEvent } from 'react';
import { Arrow, TimeGraph, V, fmt, useLoop, useNarrow } from './shared';

const M = 1; // kg
const surfaces = [
 { id: 'wood', name: 'Wooden floor', f: 2 },
 { id: 'carpet', name: 'Carpet', f: 4 },
 { id: 'ice', name: 'Ice', f: 0.2 },
 { id: 'none', name: 'No friction (imagined)', f: 0 }
] as const;
type SurfaceId = typeof surfaces[number]['id'];
type Sim = { x: number; v: number; t: number; shove: number; coast: number; steady: number; samples: { t: number; y: number }[] };
type Guess = 'stops' | 'steady' | 'faster' | null;
const fresh = (): Sim => ({ x: 0, v: 0, t: 0, shove: 0, coast: 0, steady: 0, samples: [{ t: 0, y: 0 }] });
const SHOVE = 3, SHOVE_TIME = 1; // N, s

export default function FirstLaw() {
 const [surface, setSurface] = useState<SurfaceId>('wood');
 const [push, setPush] = useState(2.5);
 const [holding, setHolding] = useState(false);
 const [paused, setPaused] = useState(false);
 const [sim, setSim] = useState<Sim>(fresh);
 const [guess, setGuess] = useState<Guess>(null);
 const [steadyWon, setSteadyWon] = useState(false);
 const narrow = useNarrow();

 const s = surfaces.find(x => x.id === surface)!;
 const applied = sim.shove > 0 ? SHOVE : holding ? push : 0;
 // Kinetic friction opposes sliding. At rest, static friction matches the push up to the same limit
 // (the lesson uses one friction value for both, a labeled simplification).
 const friction = sim.v > 1e-9 ? s.f : Math.min(applied, s.f);
 const net = applied - friction;
 const a = net / M;
 const moving = sim.v > 1e-9;

 useLoop(!paused && (moving || applied > 0), dt => setSim(p => {
  const F = p.shove > 0 ? SHOVE : holding ? push : 0;
  let v = p.v;
  const f = v > 1e-9 ? s.f : Math.min(F, s.f);
  v += (F - f) / M * dt;
  if (v < 0) v = 0;
  const t = p.t + dt;
  const samples = t - p.samples[p.samples.length - 1].t >= 0.05 ? [...p.samples.slice(-400), { t, y: v }] : p.samples;
  const coast = surface === 'none' && F === 0 && v > 0 ? p.coast + dt : p.coast;
  const steady = s.f > 0 && F === s.f && p.shove <= 0 && v > 0.2 ? p.steady + dt : 0;
  return { x: p.x + (p.v + v) / 2 * dt, v, t, shove: Math.max(0, p.shove - dt), coast, steady, samples };
 }));
 useEffect(() => { if (sim.steady > 1.5) setSteadyWon(true); }, [sim.steady]);

 const reset = () => { setSim(fresh()); setPaused(false); };
 const choose = (id: SurfaceId) => { setSurface(id); reset(); };
 const key = (on: boolean) => (e: KeyboardEvent) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  e.preventDefault();
  if (!e.repeat) setHolding(on);
 };

 // Camera follows the block once it has gone a third of the way across.
 const W = narrow ? 380 : 640, H = 176, X0 = narrow ? 112 : 130, ground = 118, ppm = narrow ? 42 : 60, scale = 18;
 const cam = Math.max(0, sim.x - (W * 0.36 - X0) / ppm);
 const sx = (m: number) => X0 + (m - cam) * ppm;
 const bw = 56, bh = 44, bx = sx(sim.x), mid = bx + bw / 2;
 const marks: number[] = [];
 const every = narrow ? 2 : 1;
 for (let m = Math.floor(cam / every) * every; m <= cam + W / ppm; m += every) marks.push(m);

 const state = paused ? 'paused'
  : applied > 0 ? (moving ? (Math.abs(net) < 1e-9 ? 'steady' : 'faster') : (applied <= s.f ? 'stuck' : 'faster'))
  : moving ? (s.f > 0 ? 'slowing' : 'coasting') : 'rest';
 const coastDone = sim.coast > 2;

 return <div className="nl-panel">
  <p>A 1 kg block sits on a long, flat floor. Push it, let go, and watch what happens to its speed. Then change the floor.</p>
  <ol className="nl-steps">
   <li>On the <strong>wooden floor</strong>, press <em>Shove</em> and watch. Why does the block stop?</li>
   <li>Switch to <strong>ice</strong> and shove again. Same push, so what changed?</li>
   <li>Predict, then try <strong>no friction</strong> at all.</li>
   <li>Back on wood: get the block moving, then hold <em>Push</em> with a force that keeps it at a <strong>steady speed</strong>.</li>
  </ol>

  <div className="nl-controls">
   <div>
    <span className="nl-label">Floor</span>
    <div className="nl-seg" role="group" aria-label="Floor surface">
     {surfaces.map(x => <button key={x.id} aria-pressed={surface === x.id} onClick={() => choose(x.id)}>{x.name}</button>)}
    </div>
   </div>
   <div className="nl-grow">
    <label className="nl-label" htmlFor="nl-push">Push force while holding: <strong>{fmt(push, 1)} N</strong></label>
    <input id="nl-push" type="range" min={0} max={6} step={0.1} value={push} aria-valuetext={`${fmt(push, 1)} newtons`} onChange={e => setPush(Number(e.target.value))} />
   </div>
  </div>

  {surface === 'none' && !guess && <div className="nl-predict">
   <span>Predict first: with no friction at all, you give the block a short shove and then let go. After you let go, the block will…</span>
   <div className="nl-row">
    <button onClick={() => setGuess('stops')}>slow down and stop</button>
    <button onClick={() => setGuess('steady')}>keep going at the same speed</button>
    <button onClick={() => setGuess('faster')}>keep speeding up</button>
   </div>
  </div>}

  <div className="nl-row">
   <button className="nl-primary" disabled={sim.shove > 0 || (surface === 'none' && !guess)} onClick={() => { setPaused(false); setSim(p => ({ ...p, shove: SHOVE_TIME })); }}>Shove ({SHOVE} N for {SHOVE_TIME} s)</button>
   <button className="nl-hold" aria-pressed={holding} disabled={surface === 'none' && !guess}
    onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setPaused(false); setHolding(true); }}
    onPointerUp={() => setHolding(false)} onPointerCancel={() => setHolding(false)} onBlur={() => setHolding(false)}
    onKeyDown={e => { key(true)(e); setPaused(false); }} onKeyUp={key(false)}>
    {holding ? 'Pushing…' : 'Hold to push'}
   </button>
   <button onClick={() => setPaused(p => !p)} disabled={!moving && applied === 0} aria-pressed={paused}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
   <button onClick={reset}>Reset</button>
  </div>
  <p className="nl-hint">Hold the button with a mouse, finger, or the space bar. Let go to stop pushing.</p>

  <figure className="nl-figure">
   <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Block on ${s.name.toLowerCase()}, ${fmt(sim.x, 1)} meters from the start, moving at ${fmt(sim.v)} meters per second. Push ${fmt(applied, 1)} newtons, friction ${fmt(friction, 1)} newtons.`}>
    <rect className={`nl-floor nl-floor-${surface}`} x={0} y={ground} width={W} height={H - ground} />
    {marks.map(m => <g key={m} className="nl-tick"><line className="zero" x1={sx(m)} x2={sx(m)} y1={ground} y2={ground + 10} /><text x={sx(m)} y={ground + 26} textAnchor="middle">{m} m</text></g>)}
    <rect className="nl-block" x={bx} y={ground - bh} width={bw} height={bh} rx={5} />
    <text className="nl-block-label" x={mid} y={ground - bh / 2 + 5} textAnchor="middle">1 kg</text>
    <Arrow kind="applied" x={bx - 4 - applied * scale} y={ground - bh / 2} dx={applied * scale} dy={0} label={applied ? `push ${fmt(applied, 1)} N` : undefined} labelSide="above" />
    <Arrow kind="friction" x={mid} y={ground - 6} dx={-friction * scale} dy={0} label={friction ? `friction ${fmt(friction, 1)} N` : undefined} />
    <Arrow kind="net" x={mid} y={ground - bh - 18} dx={net * scale} dy={0} dashed label={Math.abs(net) > 1e-9 ? `net ${fmt(net, 1)} N` : undefined} />
    {Math.abs(net) < 1e-9 && <text className="nl-zero-net" x={mid} y={ground - bh - 14} textAnchor="middle">net force = 0</text>}
   </svg>
   <figcaption>Only horizontal forces are drawn. Gravity and the floor's normal force also act on the block, but they cancel each other in the vertical direction.</figcaption>
  </figure>

  <div className="nl-readout" aria-live="polite">
   <div><span>Speed</span><strong>{fmt(sim.v)} m/s</strong></div>
   <div><span>Push</span><strong>{fmt(applied, 1)} N</strong></div>
   <div><span>Friction</span><strong>{fmt(friction, 1)} N</strong></div>
   <div><span>Net force</span><strong>{fmt(net, 1)} N</strong></div>
   <div><span>Acceleration</span><strong>{fmt(a)} m/s²</strong></div>
  </div>

  {surface === 'none' && guess && coastDone && <p className={`nl-feedback ${guess === 'steady' ? 'good' : 'bad'}`}>
   {guess === 'steady' ? 'Your prediction holds up. ' : 'Not what you predicted. '}
   Since you let go, nothing pushes the block forward and nothing holds it back, so its speed hasn't changed: still {fmt(sim.v)} m/s. It doesn't need a force to keep moving. A force is needed only to <em>change</em> its motion.
  </p>}
  {steadyWon && <p className="nl-feedback good"><strong>Steady speed!</strong> Your push of {fmt(s.f, 1)} N exactly matched friction, so the net force was zero, and the speed stopped changing. Moving at constant velocity needs zero net force, the same as sitting still.</p>}

  <div className="nl-explain" aria-live="polite">
   {state === 'rest' && <p>The block is at rest and nothing pushes it. Net force is zero, so it stays at rest.</p>}
   {state === 'stuck' && <p><strong>Not moving yet.</strong> Your {fmt(applied, 1)} N push is no more than friction can hold ({fmt(s.f, 1)} N here), so friction pushes back just as hard. Net force is zero and the block stays put. Push harder to get it going.</p>}
   {state === 'faster' && <p><strong>Speeding up.</strong> The push ({fmt(applied, 1)} N) is bigger than friction ({fmt(friction, 1)} N), so there is a net force of {fmt(net, 1)} N forward. A net force changes the velocity: here it grows by {fmt(a)} m/s every second.</p>}
   {state === 'steady' && <p><strong>Steady speed.</strong> The push and friction are equal and opposite, so the net force is zero. The block keeps the speed it already has. It doesn't speed up and it doesn't slow down.</p>}
   {state === 'slowing' && <p><strong>Slowing down.</strong> You let go, so the only horizontal force left is friction ({fmt(s.f, 1)} N), pointing backward. That backward net force is what slows the block. {surface === 'ice' ? 'On ice the friction is tiny, so the block takes a long time to stop.' : 'Less friction would mean a slower slowdown.'}</p>}
   {state === 'coasting' && <p><strong>Coasting.</strong> No push and no friction means no horizontal force at all. Nothing changes the velocity, so the block keeps moving at {fmt(sim.v)} m/s in a straight line. On this imagined floor it would never stop.</p>}
   {state === 'paused' && <p>Paused. Describe the forces on the block right now, then predict what its speed will do next.</p>}
  </div>

  <TimeGraph points={sim.samples} tMax={sim.t} yMin={0} yMax={Math.max(4, Math.ceil(Math.max(...sim.samples.map(p => p.y)) + 0.5))} yLabel="speed (m/s)" narrow={narrow}
   label={`Graph of the block's speed over time. Current speed ${fmt(sim.v)} meters per second.`} />

  <div className="nl-takeaway">
   <p><strong>Newton's first law (inertia).</strong> An object at rest stays at rest, and a moving object keeps moving at the same speed in the same direction, unless a <strong>net external force</strong> acts on it. In symbols: if Σ<V>F</V> = 0, the velocity doesn't change.</p>
   <p>Everyday objects stop because friction and air resistance are forces, not because motion "runs out". The frictionless floor is an idealization you can't build, but a hockey puck on ice or a spacecraft coasting between planets comes close.</p>
  </div>
 </div>;
}
