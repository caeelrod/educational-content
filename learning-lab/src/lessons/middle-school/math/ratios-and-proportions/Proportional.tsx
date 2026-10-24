import { useEffect, useRef, useState, type ReactNode } from 'react';
import { close, parse, q, show, shuffle, ticks, val, type Q } from './ratio';

type Scenario = { id: string; text: ReactNode; x: string; y: string; xs: number[]; f: (x: number) => number; prop: boolean; k?: Q; curve?: boolean; why: ReactNode; money?: boolean };

const scenarios: Scenario[] = [
 { id: 'bananas', text: <>Bananas cost <strong>$0.60 per pound</strong>.</>, x: 'Pounds', y: 'Cost ($)', xs: [1, 2, 4, 5], f: x => 0.6 * x, prop: true, k: q(3, 5), money: true,
  why: <>Every cost ÷ pounds is 0.6, and 0 pounds costs $0. The points sit on a straight line through (0, 0).</> },
 { id: 'taxi', text: <>A taxi charges <strong>$3 to get in</strong>, plus <strong>$2 for each mile</strong>.</>, x: 'Miles', y: 'Fare ($)', xs: [1, 2, 3, 5], f: x => 3 + 2 * x, prop: false, money: true,
  why: <>The graph is a straight line, but it doesn't go through (0, 0): a 0-mile ride still costs $3. Check the ratios: 5 ÷ 1 = 5, but 7 ÷ 2 = 3.5. They aren't the same, so it isn't proportional.</> },
 { id: 'bike', text: <>A cyclist rides at a steady <strong>12 km each hour</strong>.</>, x: 'Hours', y: 'Distance (km)', xs: [1, 2, 3, 4], f: x => 12 * x, prop: true, k: q(12),
  why: <>Distance ÷ hours is always 12, and the line goes through (0, 0).</> },
 { id: 'square', text: <>A square's <strong>area</strong> depends on its <strong>side length</strong>.</>, x: 'Side (cm)', y: 'Area (cm²)', xs: [1, 2, 3, 4], f: x => x * x, prop: false, curve: true,
  why: <>Starting at (0, 0) isn't enough. The points curve upward: 1 ÷ 1 = 1, 4 ÷ 2 = 2, 9 ÷ 3 = 3. The ratio keeps changing, so area is not proportional to side length.</> },
 { id: 'ages', text: <>Maya is always <strong>3 years older</strong> than her brother.</>, x: "Brother's age", y: "Maya's age", xs: [2, 5, 8, 10], f: x => x + 3, prop: false,
  why: <>This is an <em>adding</em> relationship, not a multiplying one. 5 ÷ 2 = 2.5 but 13 ÷ 10 = 1.3. The line would cross the y-axis at 3, not 0.</> },
 { id: 'cookies', text: <>Each batch of cookies uses <strong>2.5 cups of flour</strong>.</>, x: 'Batches', y: 'Flour (cups)', xs: [2, 4, 6, 8], f: x => 2.5 * x, prop: true, k: q(5, 2),
  why: <>Flour ÷ batches is always 2.5, and 0 batches need 0 flour.</> },
 { id: 'candle', text: <>A <strong>20 cm</strong> candle burns down <strong>2 cm each hour</strong>.</>, x: 'Hours burned', y: 'Height left (cm)', xs: [1, 2, 3, 4], f: x => 20 - 2 * x, prop: false,
  why: <>The height goes <em>down</em> as time goes up, and at 0 hours it's 20 cm, not 0. 18 ÷ 1 = 18 but 16 ÷ 2 = 8, so the ratio isn't constant.</> },
 { id: 'babysit', text: <>Jordan earns <strong>$11 per hour</strong> babysitting.</>, x: 'Hours', y: 'Earnings ($)', xs: [2, 3, 5, 8], f: x => 11 * x, prop: true, k: q(11), money: true,
  why: <>Earnings ÷ hours is always 11, and the line goes through (0, 0).</> }
];

const fmt = (v: number, m?: boolean) => m ? `$${v.toFixed(2)}` : String(Number(v.toFixed(2)));

export default function Proportional() {
 return <div className="rp-panel">
  <p>Two quantities are <strong>proportional</strong> when one is always the other times the same number. That number is the <strong>constant of proportionality</strong>, often called <i className="rp-var">k</i>, and the equation is <i className="rp-var">y</i> = <i className="rp-var">k</i><i className="rp-var">x</i>. Equivalent ratios are proportional: every row of a ratio table has the same <i className="rp-var">y</i> ÷ <i className="rp-var">x</i>.</p>
  <Explorer />
  <Sort />
 </div>;
}

// ---- Explorer: ticket price k plus an optional booking fee b ----
function Explorer() {
 const [k, setK] = useState(4);
 const [fee, setFee] = useState(0);
 const xs = [0, 1, 2, 3, 4, 5];
 const ys = xs.map(x => k * x + fee);
 const ratios = xs.slice(1).map((x, i) => ys[i + 1] / x);
 const constant = ratios.every(r => Math.abs(r - ratios[0]) < 1e-9);
 return <div className="rp-explore">
  <h3>Explore: tickets to the science museum</h3>
  <div className="rp-controls">
   <label className="rp-grow"><span className="rp-label">Price per ticket: ${k.toFixed(2)}</span>
    <input type="range" min={1} max={8} step={0.5} value={k} onChange={e => setK(Number(e.target.value))} aria-valuetext={`$${k.toFixed(2)} per ticket`} /></label>
   <label className="rp-grow"><span className="rp-label">Booking fee for the whole order: ${fee.toFixed(2)}</span>
    <input type="range" min={0} max={10} step={1} value={fee} onChange={e => setFee(Number(e.target.value))} aria-valuetext={`$${fee} booking fee`} /></label>
  </div>
  <div className="rp-two">
   <table className="rp-table small">
    <thead><tr><th scope="col">Tickets <i className="rp-var">x</i></th><th scope="col">Cost <i className="rp-var">y</i></th><th scope="col"><i className="rp-var">y</i> ÷ <i className="rp-var">x</i></th></tr></thead>
    <tbody>{xs.map((x, i) => <tr key={x}><td>{x}</td><td>${ys[i].toFixed(2)}</td><td className={x && !constant ? 'off' : ''}>{x ? fmt(ys[i] / x) : '—'}</td></tr>)}</tbody>
   </table>
   <Graph xs={xs.slice(1)} ys={ys.slice(1)} xMax={5} yMax={8 * 5 + 10} xLabel="Tickets" yLabel="Cost ($)" line={x => k * x + fee} through0={fee === 0} />
  </div>
  <p aria-live="polite" className={`rp-feedback ${constant ? 'good' : 'info'}`}>{constant
   ? <>Proportional: every cost ÷ tickets is {fmt(k)}, so <i className="rp-var">k</i> = {fmt(k)} and <strong><i className="rp-var">y</i> = {fmt(k)}<i className="rp-var">x</i></strong>. The line goes through (0, 0), and <i className="rp-var">k</i> is the cost of 1 ticket, the unit rate.</>
   : <>Not proportional: with the ${fee} fee, cost ÷ tickets changes from row to row, and 0 tickets still costs ${fee}. The graph is a straight line, but it misses (0, 0). Set the fee back to $0 to make it proportional again.</>}</p>
 </div>;
}

function Graph({ xs, ys, xMax, yMax, xLabel, yLabel, line, through0, curve, label }: { xs: number[]; ys: number[]; xMax: number; yMax: number; xLabel: string; yLabel: string; line?: (x: number) => number; through0?: boolean; curve?: boolean; label?: string }) {
 const W = 360, H = 260, L = 50, R = 14, T = 14, B = 44;
 const X = (v: number) => L + v / xMax * (W - L - R), Y = (v: number) => H - B - v / yMax * (H - T - B);
 const xt = ticks(xMax, 5), yt = ticks(yMax, 5);
 const path = line ? (curve
  ? Array.from({ length: 41 }, (_, i) => { const x = i / 40 * xMax; return `${i ? 'L' : 'M'}${X(x)},${Y(Math.min(yMax, line(x)))}`; }).join(' ')
  : `M${X(0)},${Y(line(0))} L${X(xMax)},${Y(Math.min(yMax, line(xMax)))}`) : '';
 return <figure className="rp-figure rp-graph">
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label ?? `Graph of ${yLabel} against ${xLabel}: points ${xs.map((x, i) => `(${x}, ${fmt(ys[i])})`).join(', ')}. ${through0 ? 'The line goes through the origin.' : 'The line does not go through the origin.'}`}>
   {yt.map(v => <g key={`y${v}`}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="rp-grid" /><text x={L - 6} y={Y(v) + 4} textAnchor="end" className="rp-tick">{fmt(v)}</text></g>)}
   {xt.map(v => <g key={`x${v}`}><line x1={X(v)} x2={X(v)} y1={T} y2={H - B} className="rp-grid" /><text x={X(v)} y={H - B + 16} textAnchor="middle" className="rp-tick">{fmt(v)}</text></g>)}
   <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="rp-axis" />
   <line x1={L} x2={L} y1={T} y2={H - B} className="rp-axis" />
   <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="rp-axis-title">{xLabel}</text>
   <text x={14} y={(T + H - B) / 2} textAnchor="middle" className="rp-axis-title" transform={`rotate(-90 14 ${(T + H - B) / 2})`}>{yLabel}</text>
   {path && <path d={path} className="rp-line" />}
   <circle cx={X(0)} cy={Y(0)} r={6} className={through0 ? 'rp-origin hit' : 'rp-origin'} />
   {xs.map((x, i) => <circle key={x} cx={X(x)} cy={Y(ys[i])} r={5} className="rp-pt" />)}
  </svg>
 </figure>;
}

// ---- Sort: is each situation proportional? ----
function Sort() {
 const [order, setOrder] = useState(() => shuffle(scenarios));
 const [i, setI] = useState(0);
 const [choice, setChoice] = useState<boolean | null>(null);
 const [kText, setKText] = useState('');
 const [kMsg, setKMsg] = useState<{ ok: boolean; body: ReactNode } | null>(null);
 const [kMisses, setKMisses] = useState(0);
 const [score, setScore] = useState<boolean[]>([]);
 const kRef = useRef<HTMLInputElement>(null);
 const s = order[i];
 const done = i >= order.length;
 const right = choice !== null && s && choice === s.prop;
 const needK = !!s?.prop && right;
 const kDone = !needK || !!kMsg?.ok;

 useEffect(() => { if (needK) kRef.current?.focus({ preventScroll: true }); }, [needK]);

 function decide(v: boolean) {
  if (choice !== null && choice === s.prop) return;
  const first = choice === null;
  setChoice(v);
  if (first) setScore(sc => [...sc, v === s.prop]);
 }
 function checkK() {
  if (!s.k) return;
  const ans = parse(kText);
  if (!ans) { setKMsg({ ok: false, body: 'Type a number, such as 4 or 0.75.' }); return; }
  if (close(ans, s.k, kText)) { setKMsg({ ok: true, body: <>Yes: <strong><i className="rp-var">y</i> = {show(s.k)}<i className="rp-var">x</i></strong>. Check a row: {s.xs[1]} × {show(s.k)} = {fmt(s.f(s.xs[1]), s.money)}.</> }); return; }
  setKMisses(m => m + 1);
  const inv = Math.abs(1 / val(s.k) - val(ans)) < 0.01;
  setKMsg({ ok: false, body: inv ? <>That's <i className="rp-var">x</i> ÷ <i className="rp-var">y</i>, upside down. <i className="rp-var">k</i> is what you multiply <i className="rp-var">x</i> by to get <i className="rp-var">y</i>, so divide <i className="rp-var">y</i> by <i className="rp-var">x</i>.</> : <>Pick any row and divide <i className="rp-var">y</i> by <i className="rp-var">x</i>: {fmt(s.f(s.xs[0]), s.money)} ÷ {s.xs[0]}.</> });
 }
 function next() { setI(i + 1); setChoice(null); setKText(''); setKMsg(null); setKMisses(0); }

 if (done) return <div className="rp-sort">
  <h3>Sorted all {order.length}</h3>
  <p>{score.filter(Boolean).length} of {order.length} right on the first try. The two tests: <strong>is <i className="rp-var">y</i> ÷ <i className="rp-var">x</i> the same in every row?</strong> and <strong>is the graph a straight line through (0, 0)?</strong> A proportional relationship passes both.</p>
  <div className="rp-row"><button className="rp-primary" onClick={() => { setOrder(shuffle(scenarios)); setI(0); setScore([]); setChoice(null); }}>Sort them again</button></div>
 </div>;

 const ys = s.xs.map(s.f);
 const yMax = Math.max(...ys, s.f(0)) * 1.15;
 const xMax = Math.max(...s.xs) * 1.1;
 return <div className="rp-sort">
  <h3>Proportional or not?</h3>
  <div className="rp-progress" aria-label={`Situation ${i + 1} of ${order.length}`}>{order.map((_, k) => <span key={k} className={k < i ? (score[k] ? 'done' : 'slip') : k === i ? 'now' : ''} />)}</div>
  <p className="rp-prompt">{s.text}</p>
  <div className="rp-two">
   <table className="rp-table small">
    <thead><tr><th scope="col">{s.x}</th><th scope="col">{s.y}</th>{choice !== null && <th scope="col"><i className="rp-var">y</i> ÷ <i className="rp-var">x</i></th>}</tr></thead>
    <tbody>{s.xs.map((x, k) => <tr key={x}><td>{x}</td><td>{fmt(ys[k], s.money)}</td>{choice !== null && <td className={s.prop ? '' : 'off'}>{fmt(ys[k] / x)}</td>}</tr>)}</tbody>
   </table>
   {choice !== null ? <Graph xs={s.xs} ys={ys} xMax={xMax} yMax={yMax} xLabel={s.x} yLabel={s.y} line={s.f} curve={s.curve} through0={Math.abs(s.f(0)) < 1e-9} />
    : <p className="rp-muted rp-graph-wait">Decide from the table first. The graph appears after you answer.</p>}
  </div>
  <div className="rp-row" role="group" aria-label="Is it proportional?">
   <button aria-pressed={choice === true} className={choice === true ? (s.prop ? 'right' : 'wrong') : ''} disabled={!!right} onClick={() => decide(true)}>Proportional</button>
   <button aria-pressed={choice === false} className={choice === false ? (!s.prop ? 'right' : 'wrong') : ''} disabled={!!right} onClick={() => decide(false)}>Not proportional</button>
  </div>
  <div aria-live="polite">{choice !== null && <p className={`rp-feedback ${right ? 'good' : 'bad'}`}><strong>{right ? 'Right.' : s.prop ? 'Look again: it is proportional.' : 'Look again: it is not proportional.'}</strong> {s.why}</p>}</div>
  {needK && <div className="rp-k">
   <form className="rp-row" onSubmit={e => { e.preventDefault(); checkK(); }}>
    <label htmlFor="rp-k">What is the constant of proportionality <i className="rp-var">k</i>?</label>
    <input id="rp-k" ref={kRef} className="rp-input" value={kText} disabled={!!kMsg?.ok} inputMode="decimal" autoComplete="off" onChange={e => setKText(e.target.value)} />
    {!kMsg?.ok && <button className="rp-primary" type="submit">Check</button>}
    {!kMsg?.ok && kMisses >= 2 && <button type="button" className="rp-link" onClick={() => { setKText(show(s.k!)); setKMsg({ ok: true, body: <><i className="rp-var">k</i> = {fmt(s.f(s.xs[0]), s.money)} ÷ {s.xs[0]} = {show(s.k!)}, so <strong><i className="rp-var">y</i> = {show(s.k!)}<i className="rp-var">x</i></strong>.</> }); }}>Show me</button>}
   </form>
   <div aria-live="polite">{kMsg && <p className={`rp-feedback ${kMsg.ok ? 'good' : 'bad'}`}>{kMsg.body}</p>}</div>
  </div>}
  {right && kDone && <div className="rp-row"><button className="rp-primary" onClick={next}>{i + 1 < order.length ? 'Next situation →' : 'See how I did'}</button></div>}
 </div>;
}
