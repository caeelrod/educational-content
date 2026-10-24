import { useState, type ReactNode } from 'react';
import { Arrow, forceNames, type ForceKind } from './shared';

type Dir = 'up' | 'down' | 'left' | 'right';
type Real = Exclude<ForceKind, 'net'>;
type Choice = Real | 'motion' | 'throw';
type Net = 'zero' | Dir;
type Scenario = {
 title: string; on: string; text: string; motion: string; forces: Partial<Record<Real, { dir: Dir; size: number }>>; net: Net;
 why: string; extra?: Partial<Record<Choice, string>>; missing?: Partial<Record<Real, string>>; scene: ReactNode; moveDir?: Dir;
};

const palette: Choice[] = ['gravity', 'normal', 'friction', 'applied', 'tension', 'air', 'motion', 'throw'];
const choiceNames: Record<Choice, string> = { ...forceNames, applied: 'Applied push', motion: 'Force of motion', throw: 'Force from the throw or hit' } as Record<Choice, string>;
const netNames: Record<Net, string> = { zero: 'Zero (balanced)', up: 'Up', down: 'Down', left: 'Left', right: 'Right' };

const extraDefault: Record<Choice, string> = {
 gravity: '', normal: 'No surface is pressing on it, so there is no normal force.',
 friction: 'Friction needs a surface that it slides along or grips.',
 applied: 'Nobody is pushing it in this moment.',
 tension: 'There is no rope, string, or cable pulling on it.',
 air: 'Air resistance is ignored in this scenario (or is too small to matter).',
 motion: 'There is no “force of motion”. A moving object doesn’t need a force to keep moving (the first law). Every real force has a source you can name: something touching it, or gravity.',
 throw: 'Once the object leaves the hand or stick, nothing is touching it, so that push is gone. It keeps moving because of inertia, not because it carries a force along.'
};
const missingDefault: Record<Real, string> = {
 gravity: 'Everything near Earth has weight. Gravity always pulls it down.',
 normal: 'It presses on a surface, and the surface pushes back, straight out from the surface. That push is the normal force.',
 friction: 'It slides along a surface, and friction acts along the surface, against the sliding.',
 applied: 'Someone is pushing it. That push belongs on the diagram.',
 tension: 'A rope or cord is attached and pulls on it. That pull is tension.',
 air: 'It moves fast through air, and air resistance pushes against the motion.'
};

const S = 'nl-scene';
const ground = (y = 170, cls = 'nl-floor') => <rect className={cls} x={0} y={y} width={320} height={220 - y} />;
const person = (x: number, y: number, flip = 1) => <g className="nl-person" transform={`translate(${x},${y}) scale(${flip},1)`}>
 <circle cx={0} cy={-62} r={9} /><line x1={0} y1={-53} x2={0} y2={-22} /><line x1={0} y1={-22} x2={-8} y2={0} /><line x1={0} y1={-22} x2={8} y2={0} /><line x1={0} y1={-44} x2={18} y2={-36} />
</g>;
const velocity = (x: number, y: number, dx: number, dy: number, label: string) => <g className="nl-velocity">
 <line x1={x} y1={y} x2={x + dx} y2={y + dy} /><polygon points={dx ? `${x + dx},${y} ${x + dx - Math.sign(dx) * 8},${y - 5} ${x + dx - Math.sign(dx) * 8},${y + 5}` : `${x},${y + dy} ${x - 5},${y + dy - Math.sign(dy) * 8} ${x + 5},${y + dy - Math.sign(dy) * 8}`} />
 <text x={x + dx / 2} y={dx ? y - 8 : y + dy / 2} dx={dx ? 0 : 10} textAnchor={dx ? 'middle' : 'start'}>{label}</text>
</g>;

const scenarios: Scenario[] = [
 { title: 'Book on a table', on: 'book', text: 'A book rests on a table.', motion: 'At rest',
  forces: { gravity: { dir: 'down', size: 3 }, normal: { dir: 'up', size: 3 } }, net: 'zero',
  why: 'It isn’t moving and isn’t starting to, so its velocity isn’t changing: net force zero. The table’s push up balances the book’s weight.',
  scene: <g className={S}><rect className="nl-table-top" x={60} y={150} width={200} height={10} /><rect className="nl-table-top" x={75} y={160} width={10} height={60} /><rect className="nl-table-top" x={235} y={160} width={10} height={60} /><rect className="nl-object" x={125} y={126} width={70} height={24} rx={3} /></g> },
 { title: 'Crate pushed at steady speed', on: 'crate', text: 'A worker pushes a crate across a rough floor. It slides to the right at a constant speed.', motion: 'Moving right, steady speed', moveDir: 'right',
  forces: { gravity: { dir: 'down', size: 3 }, normal: { dir: 'up', size: 3 }, applied: { dir: 'right', size: 2 }, friction: { dir: 'left', size: 2 } }, net: 'zero',
  why: 'Constant speed in a straight line means the velocity isn’t changing, so the net force is zero. The push is only as big as friction. Many people expect the push to “win”; it only has to while the crate speeds up.',
  scene: <g className={S}>{ground()}<rect className="nl-object" x={130} y={110} width={64} height={60} rx={3} />{person(105, 170)}{velocity(210, 96, 50, 0, 'steady')}</g> },
 { title: 'Ball tossed upward', on: 'ball', text: 'A ball has just left your hand and is still rising. Ignore air resistance.', motion: 'Moving up, slowing down', moveDir: 'up',
  forces: { gravity: { dir: 'down', size: 3 } }, net: 'down',
  why: 'Only gravity acts once the ball has left the hand. The net force points down even though the ball moves up, which is exactly why it is slowing down. At the top it stops for an instant, and the same net force then speeds it up on the way down.',
  extra: { air: 'This scenario says to ignore air resistance.' },
  scene: <g className={S}>{ground(200)}<circle className="nl-object" cx={160} cy={90} r={16} />{velocity(205, 120, 0, -50, 'slowing')}<path className="nl-dash" d="M160 190 L160 112" /></g> },
 { title: 'Puck sliding on ice', on: 'puck', text: 'A hockey puck slides to the right after a player hit it. The ice has a little friction.', motion: 'Moving right, slowly slowing down', moveDir: 'right',
  forces: { gravity: { dir: 'down', size: 3 }, normal: { dir: 'up', size: 3 }, friction: { dir: 'left', size: 0.7 } }, net: 'left',
  why: 'The stick is no longer touching the puck. The only horizontal force is a little friction pointing backward, so the net force points left while the puck moves right. That is why it gradually slows.',
  scene: <g className={S}>{ground(160, 'nl-floor nl-floor-ice')}<ellipse className="nl-object" cx={160} cy={152} rx={26} ry={8} /><rect className="nl-object" x={134} y={144} width={52} height={8} />{velocity(195, 120, 55, 0, 'slowing')}</g> },
 { title: 'Hanging lamp', on: 'lamp', text: 'A lamp hangs from the ceiling by a cord, perfectly still.', motion: 'At rest',
  forces: { gravity: { dir: 'down', size: 3 }, tension: { dir: 'up', size: 3 } }, net: 'zero',
  why: 'At rest, so the net force is zero: the cord’s tension pulls up exactly as hard as gravity pulls down. The ceiling doesn’t touch the lamp, so there’s no normal force on the lamp.',
  extra: { normal: 'The lamp doesn’t rest on a surface. The ceiling pushes on the cord, and the cord pulls on the lamp: that pull is tension.' },
  scene: <g className={S}><rect className="nl-table-top" x={40} y={0} width={240} height={14} /><line className="nl-cord" x1={160} y1={14} x2={160} y2={92} /><path className="nl-object" d="M130 128 L145 92 L175 92 L190 128 Z" /><circle className="nl-bulb" cx={160} cy={134} r={8} /></g> },
 { title: 'Skydiver at terminal velocity', on: 'skydiver', text: 'A skydiver falls at a steady 55 m/s, the fastest they will go before opening the parachute.', motion: 'Moving down, steady speed', moveDir: 'down',
  forces: { gravity: { dir: 'down', size: 3 }, air: { dir: 'up', size: 3 } }, net: 'zero',
  why: 'Steady speed means zero net force, even though the skydiver is falling fast. Air resistance grows with speed until it matches the weight. From then on the speed stays the same.',
  scene: <g className={S}><g className="nl-person" transform="translate(160,110)"><circle cx={0} cy={-22} r={9} /><line x1={0} y1={-13} x2={0} y2={14} /><line x1={0} y1={-8} x2={-26} y2={-20} /><line x1={0} y1={-8} x2={26} y2={-20} /><line x1={0} y1={14} x2={-18} y2={34} /><line x1={0} y1={14} x2={18} y2={34} /></g>{velocity(220, 70, 0, 60, 'steady')}<path className="nl-dash" d="M120 40 L120 80 M200 40 L200 80 M140 20 L140 55" /></g> },
 { title: 'Elevator starting upward', on: 'you', text: 'You stand in an elevator that has just started going up and is still speeding up. Draw the forces on you.', motion: 'Moving up, speeding up', moveDir: 'up',
  forces: { gravity: { dir: 'down', size: 3 }, normal: { dir: 'up', size: 4 } }, net: 'up',
  why: 'You are speeding up while moving up, so the net force on you points up. The floor must push up harder than gravity pulls down. That is why you feel heavier for a moment (part 5 measures it).',
  extra: { tension: 'The cable pulls on the elevator car, not on you. Only the floor touches you.', applied: 'Nobody is pushing you. The floor’s push on your feet is the normal force.' },
  scene: <g className={S}><rect className="nl-car" x={100} y={40} width={120} height={150} rx={4} /><line className="nl-cord" x1={160} y1={0} x2={160} y2={40} />{person(160, 190)}{velocity(250, 140, 0, -60, 'faster')}</g> },
 { title: 'Sled pulled across snow', on: 'sled', text: 'A friend pulls a sled with a horizontal rope. The sled is speeding up to the right. The snow has some friction.', motion: 'Moving right, speeding up', moveDir: 'right',
  forces: { gravity: { dir: 'down', size: 3 }, normal: { dir: 'up', size: 3 }, tension: { dir: 'right', size: 2.6 }, friction: { dir: 'left', size: 1.3 } }, net: 'right',
  why: 'The sled speeds up to the right, so the net force points right: the rope’s tension is bigger than friction. The friend pulls through the rope, so the force on the sled is tension, not a direct push.',
  extra: { applied: 'The friend doesn’t touch the sled. Their pull reaches the sled through the rope, so it is drawn as tension.' },
  scene: <g className={S}>{ground(160, 'nl-floor nl-floor-snow')}<path className="nl-object" d="M70 140 L150 140 L150 152 L66 152 Q58 152 60 146 Z" /><line className="nl-cord" x1={150} y1={146} x2={235} y2={146} />{person(250, 160, -1)}{velocity(80, 112, 55, 0, 'faster')}</g> }
];

const dirVec: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
type Result = { ok: boolean; notes: string[] };

function check(s: Scenario, chosen: Set<Choice>, net: Net | null): Result {
 const notes: string[] = [];
 for (const k of Object.keys(s.forces) as Real[]) if (!chosen.has(k)) notes.push(`Missing: ${choiceNames[k]}. ${s.missing?.[k] ?? missingDefault[k]}`);
 for (const k of chosen) if (!(k in s.forces)) notes.push(`Not here: ${choiceNames[k]}. ${s.extra?.[k] ?? extraDefault[k]}`);
 if (net && net !== s.net) {
  const hint = s.net === 'zero' ? `The motion is “${s.motion.toLowerCase()}”: the velocity isn’t changing, so the forces must balance.`
   : `The motion is “${s.motion.toLowerCase()}”. A net force points the way the velocity is changing${s.moveDir && s.moveDir !== s.net ? ', which here is opposite to the motion' : ''}.`;
  notes.push(`Net force: ${hint}`);
 }
 if (!net) notes.push('Choose the direction of the net force too.');
 return { ok: notes.length === 0, notes };
}

function Diagram({ s }: { s: Scenario }) {
 const c = 110, k = 22;
 const entries = Object.entries(s.forces) as [Real, { dir: Dir; size: number }][];
 const [nx, ny] = entries.reduce(([x, y], [, f]) => [x + dirVec[f.dir][0] * f.size, y + dirVec[f.dir][1] * f.size], [0, 0]);
 return <svg className="nl-fbd" viewBox="0 0 220 220" role="img" aria-label={`Free-body diagram: ${entries.map(([kind, f]) => `${choiceNames[kind]} ${f.dir}`).join(', ')}. Net force ${netNames[s.net].toLowerCase()}.`}>
  {entries.map(([kind, f]) => { const [dx, dy] = dirVec[f.dir];
   return <Arrow key={kind} kind={kind} x={c} y={c} dx={dx * f.size * k} dy={dy * f.size * k} label={forceNames[kind].replace(' (weight)', '').replace('Applied push or pull', 'push')} labelSide={dx ? 'end' : 'right'} />; })}
  {(Math.abs(nx) > 1e-9 || Math.abs(ny) > 1e-9) && <Arrow kind="net" x={c} y={c} dx={nx * k * 0.9} dy={ny * k * 0.9} dashed label="net" labelSide={nx ? 'end' : 'left'} />}
  <circle className="nl-fbd-dot" cx={c} cy={c} r={6} />
 </svg>;
}

export default function ForceDiagrams() {
 const [i, setI] = useState(0);
 const [chosen, setChosen] = useState<Set<Choice>>(new Set());
 const [net, setNet] = useState<Net | null>(null);
 const [result, setResult] = useState<Result | null>(null);
 const [shown, setShown] = useState(false);
 const [tries, setTries] = useState(0);
 const [scores, setScores] = useState<('first' | 'later' | 'shown' | null)[]>(scenarios.map(() => null));
 const s = scenarios[i];
 const solved = result?.ok || shown;

 const go = (k: number) => { setI(k); setChosen(new Set()); setNet(null); setResult(null); setShown(false); setTries(0); };
 const toggle = (c: Choice) => { if (solved) return; setChosen(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; }); setResult(null); };
 const submit = () => {
  const r = check(s, chosen, net);
  setResult(r); setTries(t => t + 1);
  if (r.ok) setScores(xs => xs.map((x, k) => k === i ? (x ?? (tries === 0 ? 'first' : 'later')) : x));
 };
 const reveal = () => { setShown(true); setScores(xs => xs.map((x, k) => k === i ? (x ?? 'shown') : x)); };

 return <div className="nl-panel">
  <p>A <strong>free-body diagram</strong> shows one object as a dot with an arrow for every force acting <em>on it</em>. To find the forces, look for two things: what touches the object (each contact can push, pull, or rub), and gravity. Then use the motion to decide which way the net force points.</p>

  <div className="nl-progress" role="group" aria-label="Scenarios">
   {scenarios.map((x, k) => <button key={k} aria-pressed={k === i} className={scores[k] ?? ''} aria-label={`Scenario ${k + 1}: ${x.title}${scores[k] ? (scores[k] === 'shown' ? ', answer shown' : ', solved') : ''}`} onClick={() => go(k)}>{k + 1}</button>)}
  </div>

  <div className="nl-fbd-grid">
   <div>
    <h3>{i + 1}. {s.title}</h3>
    <p>{s.text}</p>
    <svg className="nl-scene-svg" viewBox="0 0 320 220" role="img" aria-label={`Picture: ${s.text} Motion: ${s.motion}.`}>{s.scene}</svg>
    <p className="nl-motion"><strong>Motion:</strong> {s.motion}</p>
   </div>
   <div>
    <span className="nl-label">Forces acting on {s.on === 'you' ? 'you' : `the ${s.on}`} (choose all that apply)</span>
    <div className="nl-chips" role="group" aria-label="Forces">
     {palette.map(c => <button key={c} className={`nl-chip nl-chip-${c}`} aria-pressed={chosen.has(c)} disabled={solved} onClick={() => toggle(c)}>{choiceNames[c]}</button>)}
    </div>
    <span className="nl-label">Net force direction</span>
    <div className="nl-seg" role="group" aria-label="Net force direction">
     {(Object.keys(netNames) as Net[]).map(n => <button key={n} aria-pressed={net === n} disabled={solved} onClick={() => { setNet(n); setResult(null); }}>{netNames[n]}</button>)}
    </div>
    <div className="nl-row">
     <button className="nl-primary" disabled={solved} onClick={submit}>Check</button>
     {tries >= 1 && !solved && <button onClick={reveal}>Show me</button>}
     {solved && i < scenarios.length - 1 && <button className="nl-primary" onClick={() => go(i + 1)}>Next scenario →</button>}
    </div>
    <div aria-live="polite">
     {result && !result.ok && !shown && <div className="nl-feedback bad"><ul>{result.notes.map((n, k) => <li key={k}>{n}</li>)}</ul></div>}
     {solved && <div className={`nl-feedback ${result?.ok ? 'good' : 'info'}`}><p>{result?.ok ? 'Correct. ' : ''}{s.why}</p></div>}
    </div>
    {solved && <figure className="nl-figure"><Diagram s={s} /><figcaption>Arrow lengths show roughly how strong each force is. The dashed arrow is the net force, the sum of all the others.</figcaption></figure>}
   </div>
  </div>

  {scores.every(Boolean) && <p className="nl-feedback good">All {scenarios.length} done: {scores.filter(x => x === 'first').length} right on the first try. Revisit any scenario by its number.</p>}

  <div className="nl-takeaway">
   <p><strong>Rules of thumb.</strong> Every force has a source: something touching the object, or gravity. There is no force “of motion” or “left over” from a throw. Balanced forces (zero net force) mean constant velocity, which includes being at rest. An unbalanced force points in the direction the velocity is <em>changing</em>, which is not always the direction of motion.</p>
  </div>
 </div>;
}
