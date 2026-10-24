import { useEffect, useRef, useState, type ReactNode } from 'react';
import { G, V, fmt, pick, shuffle } from './shared';

type Slip = { v: number; msg: string };
type Problem = {
 text: ReactNode; steps: ReactNode[];
 unit?: string; answer?: number; slips?: Slip[];
 options?: string[]; correct?: number; optionWhy?: string[];
};
type Entry = { p: Problem; misses: number; shown: boolean; done: boolean };
const ROUND = 6;

const N = (x: number, d = 2) => fmt(x, d);
const thousands = (x: number) => x.toLocaleString('en-US');

// Each maker builds a problem with its answer computed from the same numbers, so answers are right by construction.
const makers: (() => Problem)[] = [
 () => { const m = pick([2, 3, 4, 5, 6]), F = m * pick([2, 3, 4, 5, 6, 8]) + pick([0, 0, 3]); const a = F / m;
  return { text: <>A net force of {F} N acts on a {m} kg cart. What is the cart’s acceleration?</>, unit: 'm/s²', answer: a,
   slips: [{ v: F * m, msg: 'You multiplied force by mass. The second law says a = F_net ÷ m: more mass means less acceleration.' }, { v: m / F, msg: 'That’s m ÷ F, upside down. Acceleration is net force divided by mass.' }],
   steps: [<>Second law: <V>a</V> = <V>F</V><sub>net</sub> / <V>m</V></>, <><V>a</V> = {F} N ÷ {m} kg = <strong>{N(a)} m/s²</strong></>] }; },
 () => { const m = pick([800, 1000, 1200, 1500]), a = pick([1.5, 2, 2.5, 3]); const F = m * a;
  return { text: <>A {thousands(m)} kg car speeds up at {a} m/s². What net force acts on it?</>, unit: 'N', answer: F,
   slips: [{ v: m / a, msg: 'You divided. Net force = mass × acceleration.' }, { v: m * G, msg: 'That’s the car’s weight (m × g). The question asks for the net force that produces the acceleration a.' }],
   steps: [<><V>F</V><sub>net</sub> = <V>m</V><V>a</V></>, <><V>F</V><sub>net</sub> = {thousands(m)} kg × {a} m/s² = <strong>{thousands(F)} N</strong></>] }; },
 () => { const a = pick([2, 2.5, 4, 5]), m = pick([60, 80, 90, 100]); const F = m * a;
  return { text: <>A cyclist and bike speed up at {a} m/s² when the net force on them is {F} N. What is their combined mass?</>, unit: 'kg', answer: m,
   slips: [{ v: F * a, msg: 'You multiplied. Rearrange F = ma for mass: m = F ÷ a.' }, { v: a / F, msg: 'That’s a ÷ F, upside down. m = F ÷ a.' }],
   steps: [<><V>F</V><sub>net</sub> = <V>m</V><V>a</V>, so <V>m</V> = <V>F</V><sub>net</sub> / <V>a</V></>, <><V>m</V> = {F} N ÷ {a} m/s² = <strong>{N(m)} kg</strong></>] }; },
 () => { const m = pick([5, 10, 20]), f = pick([10, 15, 20]), P = f + m * pick([1, 2, 3, 4]); const a = (P - f) / m;
  return { text: <>You push a {m} kg box across the floor with a horizontal force of {P} N. Friction on the box is {f} N. What is the box’s acceleration?</>, unit: 'm/s²', answer: a,
   slips: [{ v: P / m, msg: 'You used the push alone. Acceleration comes from the net force: push minus friction.' }, { v: (P + f) / m, msg: 'Friction points opposite to the push, so it subtracts.' }],
   steps: [<>Net force = push − friction = {P} N − {f} N = {P - f} N</>, <><V>a</V> = <V>F</V><sub>net</sub> / <V>m</V> = {P - f} N ÷ {m} kg = <strong>{N(a)} m/s²</strong></>] }; },
 () => { const m = pick([15, 20, 25, 30]), P = pick([45, 60, 75, 90]), v = pick([1.5, 2, 3]);
  return { text: <>A worker pushes a {m} kg crate with a horizontal force of {P} N. The crate slides at a constant {v} m/s. How big is the friction force on the crate?</>, unit: 'N', answer: P,
   slips: [{ v: 0, msg: `There is friction: the crate slides on a floor, and without friction a ${P} N push would speed it up.` }, { v: m * G, msg: 'That’s the crate’s weight, a vertical force. Friction is horizontal here.' }, { v: m * v, msg: 'Constant speed means zero acceleration, so the speed doesn’t enter the calculation.' }],
   steps: [<>Constant velocity, so <V>a</V> = 0 and the net force is 0 (first law).</>, <>Horizontally the push and friction must balance: friction = <strong>{P} N</strong>, pointing backward.</>] }; },
 () => { const m = pick([50, 55, 60, 65, 70]), a = pick([1, 1.5, 2]);
  const c = pick([{ s: 'going up and speeding up', up: true }, { s: 'going up and slowing down', up: false }, { s: 'going down and speeding up', up: false }, { s: 'going down and slowing down', up: true }]);
  const Nv = m * (G + (c.up ? a : -a));
  return { text: <>A {m} kg student stands on a scale in an elevator that is {c.s} at {a} m/s². What does the scale read? Use <V>g</V> = 9.8 m/s².</>, unit: 'N', answer: Nv,
   slips: [{ v: m * G, msg: 'That’s the reading at rest or at steady speed. The elevator is accelerating, so the normal force isn’t equal to the weight.' }, { v: m * (G + (c.up ? -a : a)), msg: `Check the direction of the acceleration. ${c.up ? 'Here it points up' : 'Here it points down'}: speeding up points along the motion, slowing down points against it.` }, { v: m * a, msg: 'That’s only m × a. The scale has to support your weight too: N = m(g + a).' }],
   steps: [<>Acceleration is {a} m/s² <strong>{c.up ? 'up' : 'down'}</strong> ({c.s}).</>, <>Up positive: <V>N</V> − <V>m</V><V>g</V> = <V>m</V><V>a</V>, so <V>N</V> = <V>m</V>(<V>g</V> + <V>a</V>)</>, <><V>N</V> = {m} × (9.8 {c.up ? '+' : '−'} {a}) = <strong>{N(Nv, 1)} N</strong></>] }; },
 () => { const m = pick([45, 62, 80]), moon = Math.random() < 0.5; const g = moon ? 1.6 : G, W = m * g;
  return { text: <>An astronaut has a mass of {m} kg. What is the astronaut’s weight {moon ? <>on the Moon, where <V>g</V> = 1.6 m/s²</> : <>on Earth (<V>g</V> = 9.8 m/s²)</>}?</>, unit: 'N', answer: W,
   slips: [{ v: m, msg: 'That’s the mass. Weight is the force of gravity, measured in newtons: W = mg.' }, ...(moon ? [{ v: m * G, msg: 'That’s the weight on Earth. Use the Moon’s g = 1.6 m/s².' }] : [])],
   steps: [<><V>W</V> = <V>m</V><V>g</V></>, <><V>W</V> = {m} kg × {g} m/s² = <strong>{N(W, 1)} N</strong>{moon ? '. The mass is still ' + m + ' kg; only the weight changes.' : ''}</>] }; },
 () => { const M = pick([2000, 3000, 4000]), m = 1000, F = pick([12000, 15000, 18000, 24000]);
  return { text: <>A {thousands(M)} kg truck runs into a parked {thousands(m)} kg car. At one instant during the crash, the truck pushes on the car with a force of {thousands(F)} N. How big is the force of the car on the truck at that instant?</>, unit: 'N', answer: F,
   slips: [{ v: F * m / M, msg: 'Third-law forces are equal no matter the masses: the lighter car pushes back exactly as hard as it is pushed. What differs is each vehicle’s acceleration.' }, { v: F * M / m, msg: 'The forces are equal, not scaled by mass. The masses only affect the accelerations.' }, { v: 0, msg: 'The car is parked, but it still pushes back. You can’t push on something without it pushing on you.' }],
   steps: [<>Third law: the car pushes on the truck with a force equal in size and opposite in direction.</>, <>Force on truck = <strong>{thousands(F)} N</strong> (backward). The accelerations differ: car {N(F / m, 1)} m/s², truck {N(F / M, 1)} m/s².</>] }; },
 () => { const M = pick([2000, 3000, 4000]), m = 1000, F = pick([12000, 15000, 18000, 24000]); const a = F / M;
  return { text: <>A {thousands(M)} kg truck runs into a parked {thousands(m)} kg car. At one instant the truck pushes on the car with {thousands(F)} N. What is the size of the <strong>truck’s</strong> acceleration at that instant? (Ignore friction from the road.)</>, unit: 'm/s²', answer: a,
   slips: [{ v: F / m, msg: 'That’s the car’s acceleration. Find the force on the truck first (third law), then divide by the truck’s mass.' }, { v: 0, msg: 'The car pushes back on the truck, so the truck accelerates too (it slows down).' }],
   steps: [<>Third law: the car pushes back on the truck with {thousands(F)} N.</>, <><V>a</V><sub>truck</sub> = {thousands(F)} N ÷ {thousands(M)} kg = <strong>{N(a)} m/s²</strong>, smaller than the car’s {N(F / m)} m/s² because the truck has more mass.</>] }; },
 () => pick([
  { text: <>A space probe coasts in deep space, far from any star or planet, at 15 km/s with its engines off. What force is needed to keep it moving at 15 km/s?</>,
   options: ['None. It keeps moving on its own.', 'A forward force that matches its speed', 'A small forward force, or it will slowly stop'], correct: 0,
   optionWhy: ['', 'Force doesn’t keep things moving; it changes their motion. With no net force the velocity stays the same.', 'Nothing out there slows it down: no friction, no air. Objects don’t “run out” of motion.'],
   steps: [<>First law: with no net force, velocity stays constant. No force is needed to keep moving, only to speed up, slow down, or turn.</>] },
  { text: <>A puck slides across nearly frictionless ice at a steady 8 m/s. Which is true about the net force on it?</>,
   options: ['It points forward, in the direction of motion.', 'It is zero.', 'It points forward and gets smaller as the puck goes.'], correct: 1,
   optionWhy: ['A forward net force would make it speed up. Its speed is steady.', '', 'There’s no forward force: once the stick leaves the puck, it stops pushing.'],
   steps: [<>Steady speed in a straight line means zero acceleration, so the net force is zero (first law). Gravity and the normal force balance, and friction is negligible.</>] }
 ] as Problem[])
];

const deal = (): Entry[] => shuffle(makers).slice(0, ROUND).map(m => ({ p: m(), misses: 0, shown: false, done: false }));
const close = (x: number, y: number) => Math.abs(x - y) <= Math.max(0.02 * Math.abs(y), 0.05);

export default function Practice() {
 const [round, setRound] = useState<Entry[]>(deal);
 const [k, setK] = useState(0);
 const [typed, setTyped] = useState('');
 const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null);
 const input = useRef<HTMLInputElement>(null);
 const e = round[k], p = e?.p;
 useEffect(() => { input.current?.focus({ preventScroll: true }); }, [k]);

 const update = (patch: Partial<Entry>) => setRound(r => r.map((x, i) => i === k ? { ...x, ...patch } : x));
 const miss = (text: string) => { setMsg({ good: false, text }); update({ misses: e.misses + 1 }); };
 const checkNumber = () => {
  const v = Number(typed.replace(/,/g, '').trim());
  if (!typed.trim() || Number.isNaN(v)) return setMsg({ good: false, text: 'Type a number (no units needed).' });
  if (close(v, p.answer!)) { setMsg({ good: true, text: `Correct: ${fmt(p.answer!, 2)} ${p.unit}.` }); update({ done: true }); return; }
  const slip = p.slips?.find(s => !close(s.v, p.answer!) && close(v, s.v));
  miss(slip ? slip.msg : Math.sign(v) !== Math.sign(p.answer!) && p.answer! !== 0 ? 'Check the sign. These problems ask for the size (magnitude) of the quantity.' : 'Not quite. Check which quantity the question asks for and redo the arithmetic, or open the solution.');
 };
 const choose = (j: number) => {
  if (j === p.correct) { setMsg({ good: true, text: 'Correct.' }); update({ done: true }); }
  else miss(p.optionWhy![j]);
 };
 const next = () => { setK(k + 1); setTyped(''); setMsg(null); };
 const again = (only?: boolean) => { setRound(only ? round.filter(x => x.misses || x.shown).map(x => ({ ...x, misses: 0, shown: false, done: false })) : deal()); setK(0); setTyped(''); setMsg(null); };

 if (!e) {
  const clean = round.filter(x => !x.misses && !x.shown).length;
  const slips = round.filter(x => x.misses || x.shown);
  return <div className="nl-panel">
   <h3>Round complete: {clean} of {round.length} right on the first try</h3>
   {slips.length > 0 && <p>You slipped on {slips.length === 1 ? 'one problem' : `${slips.length} problems`}. Redo just those with the same numbers, or deal a fresh round.</p>}
   <div className="nl-row">
    {slips.length > 0 && <button className="nl-primary" onClick={() => again(true)}>Redo the ones I slipped on</button>}
    <button className={slips.length ? '' : 'nl-primary'} onClick={() => again()}>New round</button>
   </div>
   <p className="nl-hint">Nothing is saved. Scores disappear when you leave the page.</p>
  </div>;
 }

 return <div className="nl-panel">
  <div className="nl-progress-bar" aria-hidden="true">{round.map((x, i) => <span key={i} className={i === k ? 'now' : x.done ? (x.misses || x.shown ? 'slip' : 'done') : ''} />)}</div>
  <p className="nl-eyebrow">PROBLEM {k + 1} OF {round.length}</p>
  <p className="nl-problem">{p.text}</p>

  {p.options ? <div className="nl-options" role="group" aria-label="Answer choices">
   {p.options.map((o, j) => <button key={j} disabled={e.done} className={e.done && j === p.correct ? 'right' : ''} onClick={() => choose(j)}>{o}</button>)}
  </div>
  : <form className="nl-row" onSubmit={ev => { ev.preventDefault(); if (!e.done) checkNumber(); }}>
   <label className="nl-label" htmlFor="nl-answer">Answer</label>
   <input id="nl-answer" ref={input} className="nl-input" inputMode="decimal" autoComplete="off" value={typed} disabled={e.done} onChange={ev => setTyped(ev.target.value)} />
   <span>{p.unit}</span>
   <button className="nl-primary" type="submit" disabled={e.done}>Check</button>
  </form>}

  <div aria-live="polite">{msg && <p className={`nl-feedback ${msg.good ? 'good' : 'bad'}`}>{msg.text}</p>}</div>
  {!e.done && e.misses >= 1 && !e.shown && <button className="nl-link" onClick={() => update({ shown: true })}>Show me the solution</button>}
  {(e.shown || e.done) && <div className="nl-explain"><p><strong>Solution</strong></p><ol>{p.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
  {(e.done || e.shown) && <div className="nl-row"><button className="nl-primary" onClick={next}>{k + 1 < round.length ? 'Next problem →' : 'See results'}</button></div>}
  <p className="nl-hint">Use <V>g</V> = 9.8 m/s². Answers within 2% count, so rounding is fine.</p>
 </div>;
}
