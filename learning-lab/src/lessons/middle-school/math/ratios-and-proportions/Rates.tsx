import { useEffect, useRef, useState } from 'react';
import { money, pick, q, rand, show, shuffle } from './ratio';

type Tab = 'race' | 'buy';
const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Rates() {
 const [tab, setTab] = useState<Tab>('race');
 return <div className="rp-panel">
  <p>A <strong>rate</strong> compares two different kinds of amounts, like meters and seconds or dollars and ounces. A <strong>unit rate</strong> tells you how much for <strong>one</strong>: meters in 1 second, or dollars for 1 ounce. Unit rates make unfair-looking comparisons fair.</p>
  <div className="rp-chips" role="group" aria-label="Choose a comparison">
   <button aria-pressed={tab === 'race'} onClick={() => setTab('race')}><span aria-hidden="true">🏃</span> Who is faster?</button>
   <button aria-pressed={tab === 'buy'} onClick={() => setTab('buy')}><span aria-hidden="true">🛒</span> Which is the better buy?</button>
  </div>
  {tab === 'race' ? <Race /> : <Buy />}
 </div>;
}

// ---------------- Race ----------------
type Runner = { name: string; speed: number; time: number; dist: number; color: string };
const names = ['Ana', 'Ben', 'Kai', 'Rosa', 'Dev', 'Mia', 'Leo', 'Zoe', 'Sam', 'Ivy'];
const times = [20, 30, 40, 50, 60, 80, 90, 100, 120];

// Most matchups are traps: the runner who went farther is the slower one.
function matchup(): [Runner, Runner] {
 const trap = Math.random() < 0.65;
 for (;;) {
  const [n1, n2] = shuffle(names);
  const s1 = rand(3, 8), s2 = rand(3, 8), t1 = pick(times), t2 = pick(times);
  if (s1 === s2 || t1 === t2) continue;
  const d1 = s1 * t1, d2 = s2 * t2;
  if (d1 === d2) continue;
  if (trap !== ((d1 > d2) !== (s1 > s2))) continue;
  return [{ name: n1, speed: s1, time: t1, dist: d1, color: '#147a83' }, { name: n2, speed: s2, time: t2, dist: d2, color: '#b55d12' }];
 }
}

function Race() {
 const [pair, setPair] = useState<[Runner, Runner]>(matchup);
 const [guess, setGuess] = useState<number | null>(null);
 const [t, setT] = useState(0);
 const [ran, setRan] = useState(false);
 const raf = useRef(0);
 const T = 10; // seconds of race time shown
 const fast = pair[0].speed > pair[1].speed ? 0 : 1;
 const farther = pair[0].dist > pair[1].dist ? 0 : 1;

 useEffect(() => () => cancelAnimationFrame(raf.current), []);

 function race(g: number) {
  setGuess(g); setRan(false);
  if (reduceMotion()) { setT(T); setRan(true); return; }
  const t0 = performance.now(), dur = 2600;
  const tick = (now: number) => {
   const p = Math.min(1, (now - t0) / dur);
   setT(p * T);
   if (p < 1) raf.current = requestAnimationFrame(tick); else setRan(true);
  };
  cancelAnimationFrame(raf.current);
  raf.current = requestAnimationFrame(tick);
 }
 function again() { cancelAnimationFrame(raf.current); setPair(matchup()); setGuess(null); setT(0); setRan(false); }

 const L = Math.max(pair[0].speed, pair[1].speed) * T;
 return <div className="rp-sub">
  <p className="rp-prompt">Two friends timed themselves running. Who runs faster? <span className="rp-muted">(Made-up runners and times.)</span></p>
  <div className="rp-cards2">
   {pair.map((r, i) => <div key={i} className="rp-fact" style={{ borderColor: r.color }}>
    <strong style={{ color: r.color }}>{r.name}</strong>
    <span>ran <strong>{r.dist} meters</strong> in <strong>{r.time} seconds</strong></span>
   </div>)}
  </div>
  {guess === null ? <div className="rp-row" role="group" aria-label="Who is faster?">
   <span>Predict:</span>
   {pair.map((r, i) => <button key={i} onClick={() => race(i)}>{r.name} is faster</button>)}
  </div> : <>
   <p className="rp-muted">Now they race side by side at their usual speeds for {T} seconds.</p>
   <div className="rp-track" role="img" aria-label={`Race after ${Math.round(t)} seconds: ${pair.map(r => `${r.name} has run ${Math.round(r.speed * t)} meters`).join(', ')}.`}>
    {pair.map((r, i) => <div key={i} className="rp-lane">
     <span className="rp-lane-name">{r.name}</span>
     <div className="rp-lane-run"><span className="rp-runner" style={{ left: `${(r.speed * t) / L * 100}%`, background: r.color }} aria-hidden="true">🏃</span></div>
     <span className="rp-lane-m">{Math.round(r.speed * t)} m</span>
    </div>)}
    <div className="rp-clock">⏱ {t.toFixed(1)} s</div>
   </div>
  </>}
  <div aria-live="polite">{ran && guess !== null && <div className={`rp-feedback ${guess === fast ? 'good' : 'bad'}`}>
   <p><strong>{guess === fast ? 'You called it.' : 'Not this time.'}</strong> {pair[fast].name} is faster.{farther !== fast && <> {pair[farther].name} ran farther, but also ran for longer, so the distance alone doesn't tell you who is faster.</>}</p>
   <table className="rp-table small">
    <thead><tr><th scope="col">Runner</th><th scope="col">Meters per second</th><th scope="col">Seconds per meter</th></tr></thead>
    <tbody>{pair.map((r, i) => <tr key={i} className={i === fast ? 'answer' : ''}><td>{r.name}</td><td>{r.dist} ÷ {r.time} = <strong>{r.speed}</strong></td><td>{r.time} ÷ {r.dist} = <strong>{show(q(r.time, r.dist))}</strong></td></tr>)}</tbody>
   </table>
   <p>Both unit rates work. In <strong>meters per second</strong>, the bigger number is faster. In <strong>seconds per meter</strong>, the smaller number is faster, because it takes less time to cover each meter. Always say which unit rate you mean.</p>
  </div>}</div>
  {ran && <div className="rp-row"><button className="rp-primary" onClick={again}>New race →</button></div>}
 </div>;
}

// ---------------- Better buy ----------------
type Box = { label: string; size: number; cents: number };
const products = [{ thing: 'cereal', unit: 'oz', icon: '🥣' }, { thing: 'juice', unit: 'fl oz', icon: '🧃' }, { thing: 'rice', unit: 'oz', icon: '🍚' }, { thing: 'trail mix', unit: 'oz', icon: '🥜' }];
const sizes = [8, 10, 12, 16, 18, 20, 24, 32];

function deal(): [Box, Box] {
 const bigBetter = Math.random() < 0.5;
 for (;;) {
  const [s1, s2] = shuffle(sizes);
  const c1 = rand(12, 40), c2 = rand(12, 40); // cents per unit
  if (c1 === c2 || Math.abs(c1 - c2) > 12) continue;
  if (bigBetter !== ((s1 > s2) === (c1 < c2))) continue;
  return [{ label: 'Box A', size: s1, cents: c1 * s1 }, { label: 'Box B', size: s2, cents: c2 * s2 }];
 }
}

function Buy() {
 const [prod, setProd] = useState(() => pick(products));
 const [pair, setPair] = useState<[Box, Box]>(deal);
 const [guess, setGuess] = useState<number | null>(null);
 const per = pair.map(b => b.cents / b.size / 100);
 const best = per[0] < per[1] ? 0 : 1;
 const cheaperTotal = pair[0].cents < pair[1].cents ? 0 : 1;
 const bigger = pair[0].size > pair[1].size ? 0 : 1;
 const maxPer = Math.max(...per);
 function again() { setProd(pick(products)); setPair(deal()); setGuess(null); }

 return <div className="rp-sub">
  <p className="rp-prompt">The store sells {prod.thing} in two sizes. Which is the better buy (the lower price for each {prod.unit})? <span className="rp-muted">(Made-up prices.)</span></p>
  <div className="rp-cards2">
   {pair.map((b, i) => <div key={i} className="rp-fact rp-box">
    <span className="rp-box-icon" aria-hidden="true" style={{ fontSize: `${1.6 + b.size / 20}rem` }}>{prod.icon}</span>
    <strong>{b.label}</strong>
    <span><strong>{b.size} {prod.unit}</strong> for <strong>{money(b.cents / 100)}</strong></span>
   </div>)}
  </div>
  {guess === null ? <div className="rp-row" role="group" aria-label="Which is the better buy?">
   <span>Predict:</span>
   {pair.map((b, i) => <button key={i} onClick={() => setGuess(i)}>{b.label}</button>)}
  </div> : <div aria-live="polite" className={`rp-feedback ${guess === best ? 'good' : 'bad'}`}>
   <p><strong>{guess === best ? 'Good shopping.' : 'Not this time.'}</strong> {pair[best].label} is the better buy.
    {guess !== best && guess === cheaperTotal && <> {pair[guess].label} costs less in total, but you also get less.</>}
    {guess !== best && guess === bigger && <> Bigger boxes are often cheaper per {prod.unit}, but not always. Check the unit price.</>}</p>
   <div className="rp-bars" role="img" aria-label={`Price per ${prod.unit}: ${pair.map((b, i) => `${b.label} ${money(per[i])}`).join(', ')}`}>
    {pair.map((b, i) => <div key={i} className={`rp-bar-row${i === best ? ' best' : ''}`}>
     <span>{b.label}</span>
     <div><span style={{ width: `${per[i] / maxPer * 100}%` }} /></div>
     <span>{money(per[i])} per {prod.unit}</span>
    </div>)}
   </div>
   <table className="rp-table small">
    <thead><tr><th scope="col"></th><th scope="col">Dollars per {prod.unit}</th><th scope="col">{prod.unit} per dollar</th></tr></thead>
    <tbody>{pair.map((b, i) => <tr key={i} className={i === best ? 'answer' : ''}><td>{b.label}</td><td>{money(b.cents / 100)} ÷ {b.size} = <strong>{money(per[i])}</strong></td><td>{b.size} ÷ {money(b.cents / 100)} ≈ <strong>{(b.size / (b.cents / 100)).toFixed(2)}</strong></td></tr>)}</tbody>
   </table>
   <p>The price for one {prod.unit} is the <strong>unit price</strong>; lower is better. Flip it and you get how many {prod.unit} one dollar buys; higher is better. Both point to the same box.</p>
  </div>}
  {guess !== null && <div className="rp-row"><button className="rp-primary" onClick={again}>New pair →</button></div>}
 </div>;
}
