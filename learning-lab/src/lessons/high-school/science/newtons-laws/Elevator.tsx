import { useEffect, useState } from 'react';
import { Arrow, G, TimeGraph, V, fmt, useLoop, useNarrow } from './shared';

type Mode = 'up' | 'down' | 'drop';
type Rel = 'more' | 'same' | 'less';
type Sim = { t: number; y: number; v: number; going: boolean; samples: { t: number; y: number }[] };
const PRE = 0.5, ACC = 2, CRUISE = 3, POST = 0.8;
const FALL = 1.5, BRAKE = 1; // drop tower: free fall, then braking to rest
const BRAKE_A = G * FALL / BRAKE;

// Acceleration (up is positive) and a description of the phase at time t.
function phase(mode: Mode, acc: number, t: number): { a: number; label: string; row: number } {
 const s = t - PRE;
 if (mode === 'drop') {
  if (s < 0) return { a: 0, label: 'At rest at the top', row: -1 };
  if (s < FALL) return { a: -G, label: 'Free fall', row: 0 };
  if (s < FALL + BRAKE) return { a: BRAKE_A, label: 'Braking (moving down, slowing)', row: 1 };
  return { a: 0, label: 'At rest at the bottom', row: -1 };
 }
 const dir = mode === 'up' ? 1 : -1, going = mode === 'up' ? 'going up' : 'going down';
 if (s < 0) return { a: 0, label: 'At rest', row: -1 };
 if (s < ACC) return { a: dir * acc, label: `Speeding up, ${going}`, row: 0 };
 if (s < ACC + CRUISE) return { a: 0, label: `Steady speed, ${going}`, row: 1 };
 if (s < 2 * ACC + CRUISE) return { a: -dir * acc, label: `Slowing down, ${going}`, row: 2 };
 return { a: 0, label: 'Stopped', row: -1 };
}
// Velocity (up is positive), the exact integral of phase().a.
function velocity(mode: Mode, acc: number, t: number) {
 const s = t - PRE;
 if (s <= 0) return 0;
 if (mode === 'drop') return s < FALL ? -G * s : s < FALL + BRAKE ? -G * FALL + BRAKE_A * (s - FALL) : 0;
 const dir = mode === 'up' ? 1 : -1;
 return dir * acc * (s < ACC ? s : s < ACC + CRUISE ? ACC : Math.max(0, 2 * ACC + CRUISE - s));
}
const total = (mode: Mode) => PRE + (mode === 'drop' ? FALL + BRAKE : 2 * ACC + CRUISE) + POST;
const truth: Record<'up' | 'down', Rel[]> = { up: ['more', 'same', 'less'], down: ['less', 'same', 'more'] };
const relText: Record<Rel, string> = { more: 'more than', same: 'the same as', less: 'less than' };
const fresh = (): Sim => ({ t: 0, y: 0, v: 0, going: false, samples: [] });

export default function Elevator() {
 const [mode, setMode] = useState<Mode>('up');
 const [m, setM] = useState(60);
 const [acc, setAcc] = useState(2);
 const [sim, setSim] = useState<Sim>(fresh);
 const [guesses, setGuesses] = useState<Record<'up' | 'down', (Rel | null)[]>>({ up: [null, null, null], down: [null, null, null] });
 const [rode, setRode] = useState<Record<Mode, boolean>>({ up: false, down: false, drop: false });
 const narrow = useNarrow();

 useLoop(sim.going, dt => setSim(p => {
  const t = Math.min(total(mode), p.t + dt), v = velocity(mode, acc, t);
  return { t, v, y: p.y + (p.v + v) / 2 * (t - p.t), going: t < total(mode), samples: [...p.samples, { t, y: m * (G + phase(mode, acc, t).a) }] };
 }));
 const done = !sim.going && sim.t >= total(mode);
 useEffect(() => { if (done) setRode(r => r[mode] ? r : { ...r, [mode]: true }); }, [done, mode]);

 const reset = (fn?: () => void) => { fn?.(); setSim(fresh()); };
 const ph = phase(mode, acc, sim.t);
 const W = m * G, N = m * (G + ph.a);
 const rows = mode === 'drop' ? [] : ['speeding up', 'moving at a steady speed', 'slowing down'];
 const g = mode === 'drop' ? null : guesses[mode];
 const ready = mode === 'drop' || g!.every(Boolean);

 // Shaft view: the car stays centered and floor markers scroll past.
 const SW = 200, SH = 300, carY = 110, carH = 120, ppm = 10;
 const floors: number[] = [];
 for (let k = Math.floor((sim.y - 20) / 4); k <= Math.ceil((sim.y + 20) / 4); k++) floors.push(k * 4);
 const fy = (h: number) => carY + carH - (h - sim.y) * ppm;
 const k = 0.085, FC = 150;

 return <div className="nl-panel">
  <p>Stand on a bathroom scale in an elevator. A scale doesn’t measure your weight directly. It measures how hard it has to push up on you, the <strong>normal force</strong>. Does that change during a ride?</p>

  <div className="nl-controls">
   <div>
    <span className="nl-label">Ride</span>
    <div className="nl-seg" role="group" aria-label="Ride">
     {([['up', 'Elevator up'], ['down', 'Elevator down'], ['drop', 'Drop-tower ride']] as const).map(([id, t]) => <button key={id} aria-pressed={mode === id} onClick={() => reset(() => setMode(id))}>{t}</button>)}
    </div>
   </div>
   <div>
    <span className="nl-label">Your mass</span>
    <div className="nl-seg" role="group" aria-label="Rider mass">{[50, 60, 70].map(v => <button key={v} aria-pressed={m === v} onClick={() => reset(() => setM(v))}>{v} kg</button>)}</div>
   </div>
   {mode !== 'drop' && <div>
    <span className="nl-label">Elevator acceleration</span>
    <div className="nl-seg" role="group" aria-label="Elevator acceleration">{[1, 2, 3].map(v => <button key={v} aria-pressed={acc === v} onClick={() => reset(() => setAcc(v))}>{v} m/s²</button>)}</div>
   </div>}
  </div>
  {mode !== 'drop' && <p className="nl-hint">Ordinary passenger elevators speed up more gently than 2 m/s². The larger settings exaggerate the effect so it is easy to see.</p>}
  {mode === 'drop' && <p className="nl-hint">Imagine riding a drop tower standing on a scale: {FALL} s of free fall, then brakes that stop you in {BRAKE} s. A thought experiment, not a description of any real ride.</p>}

  {mode !== 'drop' && <div className="nl-predict">
   <span>Predict first. While the elevator is…, the scale reads ___ your weight ({fmt(W, 0)} N).</span>
   <table className="nl-predict-table"><tbody>
    {rows.map((r, i) => <tr key={r}><th scope="row">{r}</th><td><div className="nl-seg" role="group" aria-label={`While ${r}`}>
     {(['more', 'same', 'less'] as Rel[]).map(x => <button key={x} aria-pressed={g![i] === x} className={rode[mode] && g![i] === x ? (truth[mode][i] === x ? 'right' : 'wrong') : ''}
      onClick={() => setGuesses(G2 => ({ ...G2, [mode]: G2[mode as 'up' | 'down'].map((y, j) => j === i ? x : y) }))}>{relText[x]}</button>)}
    </div></td></tr>)}
   </tbody></table>
  </div>}

  <div className="nl-row">
   <button className="nl-primary" disabled={sim.going || !ready} onClick={() => setSim({ ...fresh(), going: true })}>{done ? '↺ Ride again' : '▶ Start the ride'}</button>
   {!ready && <span className="nl-hint">Make all three predictions to start.</span>}
  </div>

  <div className="nl-elev-grid">
   <figure className="nl-figure">
    <svg viewBox={`0 0 ${SW} ${SH}`} role="img" aria-label={`Elevator shaft. ${ph.label}. Scale reads ${fmt(N, 0)} newtons.`}>
     <rect className="nl-shaft" x={0} y={0} width={SW} height={SH} />
     {floors.map(h => <g key={h} className="nl-floorline"><line x1={0} x2={SW} y1={fy(h)} y2={fy(h)} /><text x={6} y={fy(h) - 4}>{h} m</text></g>)}
     <rect className="nl-car" x={50} y={carY} width={100} height={carH} rx={4} />
     <line className="nl-cord" x1={100} y1={0} x2={100} y2={carY} />
     <g className="nl-person" transform={`translate(100,${carY + carH - 14})`}><circle cx={0} cy={-62} r={9} /><line x1={0} y1={-53} x2={0} y2={-22} /><line x1={0} y1={-22} x2={-8} y2={0} /><line x1={0} y1={-22} x2={8} y2={0} /><line x1={0} y1={-46} x2={-12} y2={-28} /><line x1={0} y1={-46} x2={12} y2={-28} /></g>
     <rect className="nl-scale" x={78} y={carY + carH - 14} width={44} height={10} rx={3} />
    </svg>
   </figure>
   <div>
    <div className="nl-scale-display" aria-live="polite">
     <span>Scale reading</span>
     <strong>{fmt(N, 0)} N</strong>
     <small>shown on a bathroom scale as {fmt(N / G, 1)} kg</small>
    </div>
    <p className="nl-phase"><strong>{ph.label}</strong>{ph.a !== 0 && <> · acceleration {fmt(Math.abs(ph.a), 1)} m/s² {ph.a > 0 ? 'up' : 'down'}</>}</p>
    <div className="nl-readout">
     <div><span>Velocity</span><strong>{fmt(Math.abs(sim.v), 1)} m/s {Math.abs(sim.v) > 0.05 ? (sim.v > 0 ? 'up' : 'down') : ''}</strong></div>
     <div><span>Your weight <V>mg</V></span><strong>{fmt(W, 0)} N</strong></div>
    </div>
   </div>
   <figure className="nl-figure">
    <svg viewBox={`0 0 200 ${SH}`} role="img" aria-label={`Free-body diagram of the rider: weight ${fmt(W, 0)} newtons down, normal force ${fmt(N, 0)} newtons up.`}>
     <Arrow kind="normal" x={100} y={FC} dx={0} dy={-N * k} label={`N = ${fmt(N, 0)} N`} labelSide="right" />
     <Arrow kind="gravity" x={100} y={FC} dx={0} dy={W * k} label={`mg = ${fmt(W, 0)} N`} labelSide="right" />
     <circle className="nl-fbd-dot" cx={100} cy={FC} r={6} />
     {N < 1 && <text className="nl-zero-net" x={112} y={FC - 14}>N = 0</text>}
    </svg>
    <figcaption>Forces on you</figcaption>
   </figure>
  </div>

  <p className="nl-formula">Up is positive. Second law for you: <V>N</V> − <V>m</V><V>g</V> = <V>m</V><V>a</V>, so <V>N</V> = <V>m</V>(<V>g</V> + <V>a</V>) = {m} × ({fmt(G, 1)} {ph.a >= 0 ? '+' : '−'} {fmt(Math.abs(ph.a), 1)}) = <strong>{fmt(N, 0)} N</strong></p>

  <TimeGraph points={sim.samples} tMax={sim.t} yMin={0} yMax={mode === 'drop' ? m * (G + BRAKE_A) * 1.1 : m * (G + 3) * 1.1} yLabel="scale reading (N)" guide={W} guideLabel="your weight" narrow={narrow}
   label={`Graph of the scale reading over the ride. Your weight is ${fmt(W, 0)} newtons.`} />

  {done && mode !== 'drop' && <div className="nl-feedback info" aria-live="polite">
   <ul>{rows.map((r, i) => <li key={r}>{g![i] === truth[mode][i] ? '✓' : '✗'} While {r}, the scale read <strong>{relText[truth[mode][i]]}</strong> your weight{g![i] !== truth[mode][i] ? ` (you predicted ${relText[g![i]!]})` : ''}.
    {i === 1 ? ' Steady speed means zero acceleration, so the floor only has to balance gravity, even while you are moving fast.' : truth[mode][i] === 'more' ? ' Your acceleration points up, so the floor must push up harder than gravity pulls down.' : ' Your acceleration points down, so the floor pushes up less than gravity pulls.'}</li>)}</ul>
   <p>The scale responds to <strong>acceleration</strong>, not to speed or direction of travel. Speeding up going down feels the same as slowing down going up: both are acceleration downward.</p>
  </div>}
  {done && mode === 'drop' && <p className="nl-feedback info" aria-live="polite">During free fall the scale read 0 N. You and the scale fell together with acceleration <V>g</V>, so the scale didn’t need to push on you at all, and you felt “weightless”, though gravity still pulled on you with {fmt(W, 0)} N. While braking, the scale had to stop you as well as hold you up: {fmt(m * (G + BRAKE_A), 0)} N, {fmt((G + BRAKE_A) / G, 1)} times your weight.</p>}

  <div className="nl-takeaway">
   <p><strong>All three laws at once.</strong> Gravity on you never changes during the ride. What changes is the normal force from the floor, set by the second law: <V>N</V> = <V>m</V>(<V>g</V> + <V>a</V>). When <V>a</V> = 0 (at rest or at steady speed) the first law says the forces balance. And the scale reads <V>N</V> because, by the third law, you push down on the scale exactly as hard as it pushes up on you.</p>
  </div>
 </div>;
}
