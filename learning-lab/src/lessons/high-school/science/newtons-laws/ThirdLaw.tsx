import { useState } from 'react';
import { Arrow, V, fmt, useLoop, useNarrow } from './shared';

const masses = [25, 50, 75, 100];
const PUSH = 0.5; // s of contact
const GLIDE = 2.5; // s shown after the push
type Who = 'A' | 'B' | 'both';
type Sim = { t: number; going: boolean };
type Guess = 'heavy' | 'light' | 'pusher' | 'same' | null;

// Position (m from the meeting point) and velocity of a skater pushed outward with force F for PUSH seconds.
function motion(F: number, m: number, t: number) {
 const a = F / m, tc = Math.min(t, PUSH);
 const x = 0.5 * a * tc * tc + a * PUSH * Math.max(0, t - PUSH);
 return { x, v: a * tc, a };
}

type Pair = { force: string; options: string[]; answer: number; why: string };
const pairs: Pair[] = [
 { force: 'Earth pulls down on an apple (the apple’s weight).',
  options: ['The table pushes up on the apple.', 'The apple pulls up on Earth.', 'The apple pushes down on the table.'], answer: 1,
  why: 'Gravity between Earth and the apple is one interaction: Earth pulls the apple down and the apple pulls Earth up just as hard. The table’s push is a different interaction (contact, not gravity), and it acts on the apple, the same object, so it can’t be the partner.' },
 { force: 'A swimmer’s hands push water backward.',
  options: ['The water pushes the swimmer’s hands forward.', 'The swimmer’s legs kick the water backward.', 'Water resistance slows the swimmer down.'], answer: 0,
  why: 'The partner of “hands push water” is “water pushes hands”, the same two objects with the roles swapped. That forward push from the water is what moves the swimmer.' },
 { force: 'A car’s tires push backward on the road.',
  options: ['The engine pushes the car forward.', 'Friction from the air pushes the car backward.', 'The road pushes forward on the tires.'], answer: 2,
  why: 'Tires push the road back; the road pushes the tires forward. That forward push from the road (a friction force) is the force that accelerates the car. The engine only turns the wheels.' },
 { force: 'A table pushes up on a book resting on it (the normal force).',
  options: ['The book pushes down on the table.', 'Earth pulls down on the book.', 'The floor pushes up on the table.'], answer: 0,
  why: 'Earth’s pull on the book is equal and opposite here, but it acts on the same object and comes from a different interaction (gravity). The two forces balance; they are not a third-law pair. The partner is the book pushing down on the table.' },
 { force: 'A rocket engine pushes hot exhaust gas downward.',
  options: ['The air below pushes up on the rocket.', 'The exhaust gas pushes up on the rocket.', 'Gravity pulls the rocket down.'], answer: 1,
  why: 'The rocket pushes the gas out, and the gas pushes the rocket the other way. No air is needed, which is why rockets work in space.' }
];

export default function ThirdLaw() {
 const [mA, setMA] = useState(75);
 const [mB, setMB] = useState(50);
 const [F, setF] = useState(100);
 const [who, setWho] = useState<Who>('A');
 const [sim, setSim] = useState<Sim>({ t: 0, going: false });
 const [guess, setGuess] = useState<Guess>(null);
 const [answers, setAnswers] = useState<(number | null)[]>(pairs.map(() => null));
 const narrow = useNarrow();

 useLoop(sim.going, dt => setSim(s => {
  const t = s.t + dt, A = motion(F, mA, t).x, B = motion(F, mB, t).x;
  return { t, going: t < PUSH + GLIDE && Math.max(A, B) < 5.2 };
 }));
 const reset = (fn?: () => void) => { fn?.(); setSim({ t: 0, going: false }); };

 const A = motion(F, mA, sim.t), B = motion(F, mB, sim.t);
 const pushing = sim.going && sim.t < PUSH;
 const done = sim.t >= PUSH && !sim.going;

 const W = narrow ? 380 : 640, H = narrow ? 210 : 220, ice = H - 40, mid = W / 2, ppm = (W / 2 - 40) / 5.4;
 const scale = narrow ? 0.35 : 0.5;
 // A simple skater whose size grows with mass. side = -1 faces right (A), +1 faces left (B).
 const skater = (x: number, m: number, side: number, armOut: boolean, name: string) => {
  const s = 0.75 + m / 200, h = 70 * s, body = 16 * s;
  const hand = x - side * (body / 2 + 6);
  const edge = side < 0 ? x < 80 : x > W - 80; // keep the name label on screen
  return <g className={`nl-skater ${name === 'A' ? 'a' : 'b'}`}>
   <rect x={x - body / 2} y={ice - h + 18 * s} width={body} height={h - 30 * s} rx={body / 2} />
   <circle cx={x} cy={ice - h + 8 * s} r={10 * s} />
   <line className="nl-limb" x1={x - 4 * s} x2={x - 6 * s} y1={ice - 14 * s} y2={ice - 2} /><line className="nl-limb" x1={x + 4 * s} x2={x + 6 * s} y1={ice - 14 * s} y2={ice - 2} />
   <line className="nl-limb" x1={x} y1={ice - h + 26 * s} x2={armOut ? hand : x - side * (body / 2 + 2)} y2={armOut ? ice - h + 30 * s : ice - h + 50 * s} />
   <text x={edge ? x : x + side * 10} y={ice + 22} textAnchor={edge ? (side < 0 ? 'start' : 'end') : side < 0 ? 'end' : 'start'}>{name} · {m} kg</text>
  </g>;
 };
 const xA = mid - 22 - A.x * ppm, xB = mid + 22 + B.x * ppm;
 const contact = sim.t < PUSH;
 const armsA = contact && (who !== 'B'), armsB = contact && (who !== 'A');

 const right = guess === 'same';
 return <div className="nl-panel">
  <p>Two skaters stand face to face on smooth ice, then one pushes the other away. Choose their masses and who does the pushing.</p>

  <div className="nl-controls">
   <div>
    <span className="nl-label">Skater A’s mass</span>
    <div className="nl-seg" role="group" aria-label="Skater A mass">{masses.map(v => <button key={v} aria-pressed={mA === v} onClick={() => reset(() => setMA(v))}>{v} kg</button>)}</div>
   </div>
   <div>
    <span className="nl-label">Skater B’s mass</span>
    <div className="nl-seg" role="group" aria-label="Skater B mass">{masses.map(v => <button key={v} aria-pressed={mB === v} onClick={() => reset(() => setMB(v))}>{v} kg</button>)}</div>
   </div>
   <div>
    <span className="nl-label">Who pushes?</span>
    <div className="nl-seg" role="group" aria-label="Who pushes">
     {([['A', 'A pushes B'], ['B', 'B pushes A'], ['both', 'Both push']] as const).map(([id, t]) => <button key={id} aria-pressed={who === id} onClick={() => reset(() => setWho(id))}>{t}</button>)}
    </div>
   </div>
   <div className="nl-grow">
    <label className="nl-label" htmlFor="nl-pf">Force between their hands: <strong>{F} N</strong> for {PUSH} s</label>
    <input id="nl-pf" type="range" min={50} max={200} step={10} value={F} aria-valuetext={`${F} newtons`} onChange={e => reset(() => setF(Number(e.target.value)))} />
   </div>
  </div>

  {!guess && <div className="nl-predict">
   <span>Predict first: during the push, which skater has the bigger force on them?</span>
   <div className="nl-row nl-small">
    <button onClick={() => setGuess('heavy')}>the heavier one</button>
    <button onClick={() => setGuess('light')}>the lighter one</button>
    <button onClick={() => setGuess('pusher')}>the one doing the pushing</button>
    <button onClick={() => setGuess('same')}>both the same</button>
   </div>
  </div>}

  <div className="nl-row">
   <button className="nl-primary" disabled={sim.going || !guess} onClick={() => setSim({ t: 0, going: true })}>{done ? '↺ Push again' : '▶ Push'}</button>
   {!guess && <span className="nl-hint">Make a prediction to unlock the push.</span>}
  </div>

  <figure className="nl-figure">
   <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Skater A, ${mA} kilograms, and skater B, ${mB} kilograms. ${pushing ? `Pushing: ${F} newtons on each, in opposite directions.` : done ? `After the push A glides left at ${fmt(A.v)} meters per second and B glides right at ${fmt(B.v)}.` : 'Ready.'}`}>
    <rect className="nl-floor nl-floor-ice" x={0} y={ice} width={W} height={H - ice} />
    <line className="nl-centerline" x1={mid} x2={mid} y1={ice - 4} y2={ice + 8} />
    {skater(xA, mA, -1, armsA, 'A')}
    {skater(xB, mB, 1, armsB, 'B')}
    {contact && sim.going && <>
     <Arrow kind="applied" x={xA} y={ice - 108} dx={-F * scale} dy={0} label={`${F} N on A`} />
     <Arrow kind="applied" x={xB} y={ice - 108} dx={F * scale} dy={0} label={`${F} N on B`} />
    </>}
    {!contact && <>
     <text className="nl-vel" x={xA} y={ice - 112} textAnchor="middle">← {fmt(A.v)} m/s</text>
     <text className="nl-vel" x={xB} y={ice - 112} textAnchor="middle">{fmt(B.v)} m/s →</text>
    </>}
   </svg>
   <figcaption>Arrows show the force on each skater during the {PUSH} s push: B’s hands push A, and A’s hands push B. Smooth ice is treated as frictionless.</figcaption>
  </figure>

  <div className="nl-table-wrap">
   <table className="nl-table">
    <thead><tr><th scope="col">Skater</th><th scope="col">Mass</th><th scope="col">Force on them</th><th scope="col">Acceleration (during push)</th><th scope="col">Speed after</th></tr></thead>
    <tbody>
     <tr><td>A</td><td>{mA} kg</td><td>{F} N left</td><td>{fmt(F / mA)} m/s²</td><td>{fmt(F * PUSH / mA)} m/s</td></tr>
     <tr><td>B</td><td>{mB} kg</td><td>{F} N right</td><td>{fmt(F / mB)} m/s²</td><td>{fmt(F * PUSH / mB)} m/s</td></tr>
    </tbody>
   </table>
  </div>

  {done && guess && <p className={`nl-feedback ${right ? 'good' : 'bad'}`} aria-live="polite">
   {right ? 'Your prediction holds up. ' : 'Not what you predicted. '}
   The forces are exactly equal: {F} N on A and {F} N on B, in opposite directions, no matter who pushed{mA !== mB ? ' or who is heavier' : ''}.
   {mA !== mB ? ` What differs is the result. The same force on less mass gives more acceleration (a = F/m), so ${mA < mB ? 'A' : 'B'}, the lighter skater, glides away faster.` : ' With equal masses they also glide apart at equal speeds.'}
  </p>}

  <div className="nl-explain">
   <p><strong>“But only A pushed!”</strong> Try each option under <em>Who pushes?</em> The numbers don’t change. Hands that press on each other press equally both ways. You can’t push something without it pushing back on you, which is why the pusher moves too.</p>
  </div>

  <div className="nl-takeaway">
   <p><strong>Newton's third law.</strong> When object A exerts a force on object B, object B exerts a force on A that is equal in size and opposite in direction: <span className="nl-eq"><V>F</V><sub>A on B</sub> = −<V>F</V><sub>B on A</sub></span>.</p>
   <p>The two forces in a pair act on <strong>different objects</strong>, so they never cancel each other. Each object responds to the force on it according to its own mass.</p>
  </div>

  <h3>Find the partner force</h3>
  <p>For each force, pick its third-law partner. A partner is the same interaction seen from the other object: swap the two objects in the sentence.</p>
  <ol className="nl-quiz">
   {pairs.map((p, i) => { const a = answers[i]; return <li key={i}>
    <p><strong>{p.force}</strong> Its partner is:</p>
    <div className="nl-options" role="group" aria-label={`Partner force for: ${p.force}`}>
     {p.options.map((o, j) => <button key={j} aria-pressed={a === j} className={a === null ? '' : j === p.answer ? 'right' : a === j ? 'wrong' : ''}
      onClick={() => setAnswers(xs => xs.map((x, k) => k === i ? j : x))}>{o}</button>)}
    </div>
    {a !== null && <p className={`nl-feedback ${a === p.answer ? 'good' : 'bad'}`} aria-live="polite">{a === p.answer ? 'Yes. ' : 'Not that one. '}{p.why}</p>}
   </li>; })}
  </ol>
 </div>;
}
