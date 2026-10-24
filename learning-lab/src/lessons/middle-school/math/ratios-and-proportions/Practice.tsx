import { useEffect, useRef, useState, type ReactNode } from 'react';
import { close, div, eq, gcd, money, mul, parse, pick, q, rand, show, shuffle, add, sub, val, type Q } from './ratio';

type Trap = { v: Q; body: ReactNode };
type Problem = {
 kind: string; text: ReactNode; label: string; answer: Q; unit: string; isMoney?: boolean;
 traps: Trap[]; hint: ReactNode; solution: ReactNode; table?: { heads: string[]; rows: string[][] };
 choices?: string[]; choice?: number; wrong?: Record<number, ReactNode>;
};
type Entry = { p: Problem; misses: number; shown: boolean };
const ROUND = 6;

const coprime = (lo: number, hi: number) => { for (;;) { const a = rand(lo, hi), b = rand(lo, hi); if (a !== b && gcd(a, b) === 1) return [a, b]; } };
const ans = (p: Problem) => p.isMoney ? money(p.answer) : show(p.answer);
// Only keep traps that differ from the answer and from each other.
const traps = (answer: Q, list: Trap[]) => list.filter((t, i) => t.v.n >= 0 && !eq(t.v, answer) && list.findIndex(u => eq(u.v, t.v)) === i);

const makers: (() => Problem)[] = [
 // Scale a recipe up by a whole-number factor.
 () => {
  const c = pick([{ lead: 'A pancake recipe uses', a: 'eggs', b: 'cups of flour' }, { lead: 'A sports drink uses', a: 'scoops of powder', b: 'cups of water' }, { lead: 'A bracelet pattern uses', a: 'red beads', b: 'blue beads' }]);
  const [ra, rb] = coprime(2, 5), k = rand(3, 6), given = ra * k, answer = q(rb * k);
  return { kind: 'Scale up', label: `${c.lead} ${ra} ${c.a} for every ${rb} ${c.b}. How many ${c.b} for ${given} ${c.a}?`,
   text: <>{c.lead} <strong>{ra} {c.a}</strong> for every <strong>{rb} {c.b}</strong>. How many {c.b} go with <strong>{given} {c.a}</strong>?</>, answer, unit: c.b,
   traps: traps(answer, [{ v: q(given + rb - ra), body: <>It looks like you added {Math.abs(rb - ra)} because the recipe has {Math.abs(rb - ra)} {rb > ra ? 'more' : 'fewer'} {c.b} than {c.a}. Ratios scale by <em>multiplying</em>. How many times bigger is {given} than {ra}?</> },
    { v: q(given * ra, rb), body: <>That's upside down: you used {c.a} per {c.b.replace(/s\b/, '')}. There are {rb > ra ? 'more' : 'fewer'} {c.b} than {c.a}, so the answer should be {rb > ra ? 'bigger' : 'smaller'} than {given}.</> }]),
   hint: <>How many times bigger is {given} than {ra}? Do the same to {rb}.</>,
   table: { heads: [c.a, c.b], rows: [[`${ra}`, `${rb}`], [`${given}`, '?']] },
   solution: <>{given} ÷ {ra} = {k}, so it's {k} copies of the recipe: {rb} × {k} = <strong>{rb * k} {c.b}</strong>.</> };
 },
 // Price of a different number of items: go through the unit price.
 () => {
  const thing = pick(['notebooks', 'pens', 'granola bars', 'bottles of water']);
  const u = pick([q(5, 4), q(3, 2), q(5, 2), q(3, 4), q(6, 5), q(4, 5), q(7, 2)]);
  const n1 = pick([4, 6, 8]), n2 = pick([3, 5, 7, 9, 10].filter(n => n % n1 !== 0 && n1 % n !== 0));
  const total = mul(u, q(n1)), answer = mul(u, q(n2));
  return { kind: 'Unit price', label: `${n1} ${thing} cost ${money(total)}. How much do ${n2} ${thing} cost?`, isMoney: true,
   text: <><strong>{n1} {thing}</strong> cost <strong>{money(total)}</strong>. At the same price each, how much do <strong>{n2} {thing}</strong> cost?</>, answer, unit: 'dollars',
   traps: traps(answer, [{ v: mul(total, q(n2)), body: <>You multiplied the whole {money(total)} by {n2}. That would be {n2} packs of {n1}. Find the price of <em>one</em> first.</> },
    { v: add(total, q(n2 - n1)), body: <>Adding or subtracting the difference in items doesn't keep the price per item the same. Find the price of one {thing.replace(/s$/, '').replace('bottle of water', 'bottle')} first.</> },
    { v: div(q(n2), u), body: <>Check the division: price ÷ items gives dollars for one item. Then multiply by {n2}.</> }]),
   hint: <>Find the price of one: {money(total)} ÷ {n1}.</>,
   table: { heads: [thing, 'cost ($)'], rows: [[`${n1}`, money(total)], ['1', '?'], [`${n2}`, '?']] },
   solution: <>One costs {money(total)} ÷ {n1} = {money(u)}. Then {n2} × {money(u)} = <strong>{money(answer)}</strong>.</> };
 },
 // Find a unit rate.
 () => {
  const c = pick([
   () => { const g = pick([4, 5, 6, 8, 12]), r = rand(22, 35); return { text: <>A car travels <strong>{g * r} miles</strong> on <strong>{g} gallons</strong> of gas. How many <strong>miles per gallon</strong> is that?</>, label: `A car travels ${g * r} miles on ${g} gallons. Miles per gallon?`, top: g * r, bot: g, unit: 'miles per gallon', flip: 'gallons per mile', heads: ['gallons', 'miles'] }; },
   () => { const m = pick([3, 4, 5, 6]), r = rand(30, 55); return { text: <>Kim types <strong>{m * r} words</strong> in <strong>{m} minutes</strong>. How many <strong>words per minute</strong> is that?</>, label: `Kim types ${m * r} words in ${m} minutes. Words per minute?`, top: m * r, bot: m, unit: 'words per minute', flip: 'minutes per word', heads: ['minutes', 'words'] }; },
   () => { const h = pick([2, 3, 4, 5]), r = pick([9, 11, 12, 13, 15]); return { text: <>Leo earns <strong>${h * r}</strong> for <strong>{h} hours</strong> of yard work. How many <strong>dollars per hour</strong> is that?</>, label: `Leo earns $${h * r} for ${h} hours. Dollars per hour?`, top: h * r, bot: h, unit: 'dollars per hour', flip: 'hours per dollar', heads: ['hours', 'dollars'] }; }
  ])();
  const answer = q(c.top, c.bot);
  return { kind: 'Unit rate', label: c.label, text: c.text, answer, unit: c.unit,
   traps: traps(answer, [{ v: q(c.bot, c.top), body: <>That's {c.flip}, the rate flipped over. "{c.unit}" means divide by the {c.heads[0]}: how much for <em>one</em> {c.heads[0].replace(/s$/, '')}?</> },
    { v: q(c.top * c.bot), body: <>You multiplied. A unit rate splits the total into equal shares, so divide.</> }]),
   hint: <>"Per" means "for each one." Divide so you get the amount for 1 {c.heads[0].replace(/s$/, '')}.</>,
   table: { heads: c.heads, rows: [[`${c.bot}`, `${c.top}`], ['1', '?']] },
   solution: <>{c.top} ÷ {c.bot} = <strong>{show(answer)} {c.unit}</strong>.</> };
 },
 // Part to whole.
 () => {
  const c = pick([{ x: 'cats', y: 'dogs', where: 'at an animal shelter', all: 'animals' }, { x: 'boys', y: 'girls', where: 'in the school band', all: 'students' }, { x: 'red tulips', y: 'yellow tulips', where: 'in a garden', all: 'tulips' }]);
  const [a, b] = coprime(2, 5), g = rand(3, 8), total = (a + b) * g, answer = q(b * g);
  return { kind: 'Part to whole', label: `The ratio of ${c.x} to ${c.y} ${c.where} is ${a} to ${b}. There are ${total} ${c.all}. How many ${c.y}?`,
   text: <>The ratio of {c.x} to {c.y} {c.where} is <strong>{a} : {b}</strong>. There are <strong>{total} {c.all}</strong> in all. How many are <strong>{c.y}</strong>?</>, answer, unit: c.y,
   traps: traps(answer, [{ v: q(a * g), body: <>That's the number of {c.x}. The question asks for {c.y}, the second number in the ratio.</> },
    { v: q(total * b, a), body: <>You treated {total} as the number of {c.x}. But {total} is <em>all</em> the {c.all}, {c.x} and {c.y} together.</> },
    { v: q(total - b), body: <>Subtracting doesn't work here. Think in groups of {a + b}.</> }]),
   hint: <>Each group has {a} {c.x} and {b} {c.y}, so {a + b} {c.all}. How many groups make {total}?</>,
   table: { heads: [c.x, c.y, 'total'], rows: [[`${a}`, `${b}`, `${a + b}`], ['?', '?', `${total}`]] },
   solution: <>Each group has {a + b} {c.all}, and {total} ÷ {a + b} = {g} groups. {c.y[0].toUpperCase() + c.y.slice(1)}: {b} × {g} = <strong>{b * g}</strong>.</> };
 },
 // Map scale with a non-whole scale factor.
 () => {
  const km = pick([5, 15, 25, 50]), d = pick([3, 5, 7, 9]), answer = q(d * km, 2);
  return { kind: 'Scale', label: `On a map, 2 cm stands for ${km} km. Two towns are ${d} cm apart on the map. How far apart are they really?`,
   text: <>On a map, <strong>2 cm</strong> stands for <strong>{km} km</strong>. Two towns are <strong>{d} cm</strong> apart on the map. How many kilometers apart are they really?</>, answer, unit: 'km',
   traps: traps(answer, [{ v: q(d + km - 2), body: <>Adding {km - 2} doesn't keep the scale. Each centimeter stands for the same number of kilometers, so multiply.</> },
    { v: q(d * 2, km), body: <>That's upside down. Real distances are much bigger than map distances.</> },
    { v: q(d * km), body: <>That treats 1 cm as {km} km, but it's <em>2</em> cm for {km} km.</> }]),
   hint: <>How many kilometers does 1 cm stand for? Then multiply by {d}.</>,
   table: { heads: ['map (cm)', 'real (km)'], rows: [['2', `${km}`], ['1', '?'], [`${d}`, '?']] },
   solution: <>1 cm stands for {km} ÷ 2 = {show(q(km, 2))} km, so {d} cm is {d} × {show(q(km, 2))} = <strong>{show(answer)} km</strong>.</> };
 },
 // Constant of proportionality from a table.
 () => {
  const k = pick([q(9), q(12), q(14), q(15, 2), q(17, 2)]), xs = shuffle([2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b);
  const ys = xs.map(x => mul(k, q(x)));
  return { kind: 'Constant of proportionality', label: `Hours ${xs.join(', ')}; pay ${ys.map(money).join(', ')}. What is k in y = kx?`, isMoney: false,
   text: <>The table shows hours worked (<i className="rp-var">x</i>) and pay in dollars (<i className="rp-var">y</i>). It's proportional. What is <i className="rp-var">k</i> in <i className="rp-var">y</i> = <i className="rp-var">k</i><i className="rp-var">x</i>?
    <table className="rp-table small inline"><thead><tr><th scope="col">Hours <i className="rp-var">x</i></th>{xs.map(x => <td key={x}>{x}</td>)}</tr></thead><tbody><tr><th scope="row">Pay <i className="rp-var">y</i></th>{ys.map((y, i) => <td key={i}>{money(y)}</td>)}</tr></tbody></table></>,
   answer: k, unit: 'dollars per hour',
   traps: traps(k, [{ v: div(q(1), k), body: <>That's <i className="rp-var">x</i> ÷ <i className="rp-var">y</i>. <i className="rp-var">k</i> is what you multiply <i className="rp-var">x</i> by to get <i className="rp-var">y</i>, so divide <i className="rp-var">y</i> by <i className="rp-var">x</i>.</> },
    { v: sub(ys[1], ys[0]), body: <>That's how much the pay jumped between two columns, but the hours jumped by {xs[1] - xs[0]}, not 1. Divide <i className="rp-var">y</i> by <i className="rp-var">x</i> in one column instead.</> }]),
   hint: <>Pick any column and divide pay by hours.</>,
   solution: <>{money(ys[0])} ÷ {xs[0]} = {show(k)}. Check another: {money(ys[2])} ÷ {xs[2]} = {show(k)}. So <strong><i className="rp-var">k</i> = {show(k)}</strong> and <i className="rp-var">y</i> = {show(k)}<i className="rp-var">x</i>.</> };
 },
 // Scale down: a rate with a big total.
 () => {
  const [a, b] = pick([[3, 20], [2, 15], [3, 25], [4, 30]]), g = rand(4, 9), B = b * g, answer = q(B * a, b);
  return { kind: 'Scale down', label: `A camp has ${a} counselors for every ${b} campers. There are ${B} campers. How many counselors?`,
   text: <>A summer camp has <strong>{a} counselors</strong> for every <strong>{b} campers</strong>. This week there are <strong>{B} campers</strong>. How many counselors does the camp need?</>, answer, unit: 'counselors',
   traps: traps(answer, [{ v: q(B - (b - a)), body: <>Subtracting {b - a} keeps the <em>difference</em> the same, not the ratio. How many groups of {b} campers are there?</> },
    { v: q(B * b, a), body: <>That's upside down. There are far fewer counselors than campers.</> }]),
   hint: <>How many groups of {b} campers are in {B}? Each group needs {a} counselors.</>,
   table: { heads: ['counselors', 'campers'], rows: [[`${a}`, `${b}`], ['?', `${B}`]] },
   solution: <>{B} ÷ {b} = {g} groups of campers, so {a} × {g} = <strong>{a * g} counselors</strong>.</> };
 },
 // Better buy (multiple choice).
 () => {
  const thing = pick(['apples', 'yogurt cups', 'muffins']);
  for (;;) {
   const n1 = pick([4, 5, 6, 8]), n2 = pick([10, 12, 15]), c1 = rand(40, 90), c2 = rand(40, 90);
   if (Math.abs(c1 - c2) < 4) continue;
   const p1 = q(n1 * c1, 100), p2 = q(n2 * c2, 100), best = c1 < c2 ? 0 : 1;
   return { kind: 'Better buy', label: `Store A: ${n1} ${thing} for ${money(p1)}. Store B: ${n2} ${thing} for ${money(p2)}. Which is the better buy?`,
    text: <>Store A sells <strong>{n1} {thing} for {money(p1)}</strong>. Store B sells <strong>{n2} {thing} for {money(p2)}</strong>. Which store has the lower price per item?</>,
    answer: q(best), unit: '', traps: [], choices: ['Store A', 'Store B'], choice: best,
    wrong: { 0: <>{val(p1) < val(p2) ? <>Store A costs less in total, but you get fewer {thing}. </> : null}Compare the price of one at each store.</>, 1: <>Store B gives you more {thing}, but more isn't always cheaper. Compare the price of one at each store.</> },
    hint: <>Divide each price by the number of {thing}.</>,
    solution: <>Store A: {money(p1)} ÷ {n1} = {money(q(c1, 100))} each. Store B: {money(p2)} ÷ {n2} = {money(q(c2, 100))} each. <strong>Store {best ? 'B' : 'A'}</strong> is cheaper per item.</> };
  }
 }
];

function deal(): Entry[] { return shuffle(makers).slice(0, ROUND).map(m => ({ p: m(), misses: 0, shown: false })); }

export default function Practice() {
 const [round, setRound] = useState<Entry[]>(deal);
 const [i, setI] = useState(0);
 const [text, setText] = useState('');
 const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; body: ReactNode } | null>(null);
 const [tries, setTries] = useState(0);
 const [solved, setSolved] = useState(false);
 const [showTable, setShowTable] = useState(false);
 const input = useRef<HTMLInputElement>(null);
 const nextRef = useRef<HTMLButtonElement>(null);
 const touched = useRef(false);
 const entry = round[i];
 const p = entry?.p as Problem;

 useEffect(() => {
  if (!touched.current) return;
  if (solved) nextRef.current?.focus({ preventScroll: true }); else input.current?.focus({ preventScroll: true });
 }, [solved, i]);

 function miss(body: ReactNode) {
  setTries(t => t + 1);
  setRound(rs => rs.map((e, k) => k === i ? { ...e, misses: e.misses + 1 } : e));
  setMsg({ tone: 'bad', body });
 }
 function win() { setSolved(true); setMsg({ tone: 'good', body: <><strong>Correct.</strong> {p.solution}</> }); }

 function check() {
  touched.current = true;
  const a = parse(text);
  if (!a) { setMsg({ tone: 'info', body: 'Type a number, such as 12, 7.5, $3.25, or 13 1/3.' }); return; }
  if (close(a, p.answer, text) || (p.isMoney && Math.abs(a.n / a.d - p.answer.n / p.answer.d) < 0.005)) return win();
  const trap = p.traps.find(t => eq(t.v, a));
  miss(trap ? trap.body : <>Not quite. {p.hint}</>);
 }
 function choose(k: number) {
  touched.current = true;
  if (k === p.choice) return win();
  miss(p.wrong?.[k] ?? p.hint);
 }
 function showMe() {
  touched.current = true;
  setRound(rs => rs.map((e, k) => k === i ? { ...e, shown: true } : e));
  setSolved(true); setMsg({ tone: 'info', body: <>The answer is <strong>{p.choices ? p.choices[p.choice!] : `${ans(p)}${p.isMoney ? '' : ` ${p.unit}`}`}</strong>. {p.solution}</> });
 }
 function next() { touched.current = true; setI(i + 1); setText(''); setMsg(null); setTries(0); setSolved(false); setShowTable(false); }
 function restart(rs = deal()) { touched.current = true; setRound(rs); setI(0); setText(''); setMsg(null); setTries(0); setSolved(false); setShowTable(false); }

 if (i >= round.length) {
  const clean = round.filter(e => e.misses === 0 && !e.shown).length;
  const missed = round.filter(e => e.misses > 0 || e.shown);
  return <div className="rp-panel">
   <h3>Round complete: {clean} of {round.length} on the first try</h3>
   <p>{clean === round.length ? 'Clean sweep. You can spot when to multiply, when to find a unit rate, and when to think in groups.' : 'The usual slips: adding instead of multiplying, flipping a rate upside down, and mixing up a part with the whole. A quick ratio table catches all three.'}</p>
   <ul className="rp-review">{round.map((e, k) => <li key={k} className={e.misses === 0 && !e.shown ? '' : 'slip'}><span aria-hidden="true">{e.misses === 0 && !e.shown ? '✓' : '↺'}</span> <span className="rp-muted">{e.p.kind}:</span> {e.p.label} <strong>{e.p.choices ? e.p.choices[e.p.choice!] : ans(e.p)}</strong></li>)}</ul>
   <div className="rp-row">
    <button className="rp-primary" onClick={() => restart()}>New round</button>
    {missed.length > 0 && <button onClick={() => restart(missed.map(e => ({ p: e.p, misses: 0, shown: false })))}>Redo the {missed.length} I slipped on</button>}
   </div>
  </div>;
 }

 return <div className="rp-panel">
  <div className="rp-progress" aria-label={`Problem ${i + 1} of ${round.length}`}>
   {round.map((e, k) => <span key={k} className={k < i ? (e.misses === 0 && !e.shown ? 'done' : 'slip') : k === i ? 'now' : ''} />)}
  </div>
  <p className="rp-eyebrow">Problem {i + 1} of {round.length} · {p.kind}</p>
  <div className="rp-problem">{p.text}</div>
  {p.table && <div className="rp-row">
   <button aria-expanded={showTable} onClick={() => setShowTable(s => !s)}>{showTable ? 'Hide the ratio table' : 'Set it up as a ratio table'}</button>
  </div>}
  {p.table && showTable && <table className="rp-table small inline">
   <thead><tr>{p.table.heads.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
   <tbody>{p.table.rows.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} className={c === '?' ? 'ask' : ''}>{c}</td>)}</tr>)}</tbody>
  </table>}

  {!solved && (p.choices
   ? <div className="rp-row" role="group" aria-label="Your answer">{p.choices.map((c, k) => <button key={c} onClick={() => choose(k)}>{c}</button>)}</div>
   : <form className="rp-row" onSubmit={e => { e.preventDefault(); check(); }}>
     <label className="rp-sr" htmlFor="rp-practice-ans">Your answer in {p.unit}</label>
     <input id="rp-practice-ans" ref={input} className="rp-input" value={text} autoComplete="off" inputMode="decimal" placeholder={p.isMoney ? 'e.g. 4.50' : 'e.g. 12'} onChange={e => setText(e.target.value)} />
     {!p.isMoney && <span className="rp-muted">{p.unit}</span>}
     <button className="rp-primary" type="submit">Check</button>
    </form>)}
  {!solved && tries >= 2 && <button className="rp-link" onClick={showMe}>Show me how</button>}

  <div aria-live="polite">{msg && <p className={`rp-feedback ${msg.tone}`}>{msg.body}</p>}</div>
  {solved && <div className="rp-row"><button ref={nextRef} className="rp-primary" onClick={next}>{i + 1 < round.length ? 'Next problem →' : 'See my round'}</button></div>}
 </div>;
}
