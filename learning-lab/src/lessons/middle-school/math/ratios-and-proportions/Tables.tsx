import { useEffect, useRef, useState, type ReactNode } from 'react';
import { close, div, eq, mul, parse, q, show, sub, add, val, type Q } from './ratio';

type Ask = { give: 'a' | 'b'; value: Q };
type Ctx = { id: string; name: string; icon: string; a: string; b: string; oneA: string; oneB: string; ra: number; rb: number; asks: Ask[] };
type Row = { a: Q; b: Q; how: string; bad?: boolean; answer?: boolean };

const contexts: Ctx[] = [
 { id: 'lemonade', name: 'Lemonade', icon: '🍋', a: 'cups of lemon juice', b: 'cups of water', oneA: 'cup of lemon juice', oneB: 'cup of water', ra: 3, rb: 8,
  asks: [{ give: 'a', value: q(12) }, { give: 'b', value: q(40) }, { give: 'a', value: q(9, 2) }] },
 { id: 'trail', name: 'Trail mix', icon: '🥜', a: 'cups of peanuts', b: 'cups of raisins', oneA: 'cup of peanuts', oneB: 'cup of raisins', ra: 2, rb: 5,
  asks: [{ give: 'a', value: q(10) }, { give: 'b', value: q(35) }, { give: 'a', value: q(7) }] },
 { id: 'map', name: 'Map scale', icon: '🗺', a: 'cm on the map', b: 'km in real life', oneA: 'cm on the map', oneB: 'km in real life', ra: 2, rb: 15,
  asks: [{ give: 'a', value: q(8) }, { give: 'b', value: q(105) }, { give: 'a', value: q(5) }] },
 { id: 'pancakes', name: 'Pancakes', icon: '🥞', a: 'eggs', b: 'cups of flour', oneA: 'egg', oneB: 'cup of flour', ra: 2, rb: 3,
  asks: [{ give: 'a', value: q(6) }, { give: 'b', value: q(12) }, { give: 'a', value: q(5) }] }
];
const ops: { label: string; aria: string; f: (c: Ctx, r: Row) => Q | null }[] = [
 { label: '× 2', aria: 'Multiply the row by 2', f: () => q(2) },
 { label: '× 3', aria: 'Multiply the row by 3', f: () => q(3) },
 { label: '× 10', aria: 'Multiply the row by 10', f: () => q(10) },
 { label: '÷ 2', aria: 'Divide the row by 2', f: () => q(1, 2) },
 { label: 'Make it 1', aria: 'Divide the row so the first amount is 1', f: (_, r) => r.a.n === 0 ? null : div(q(1), r.a) }
];
const MAX_ROWS = 9;

function start(c: Ctx): Row[] { return [{ a: q(0), b: q(0), how: 'none of either' }, { a: q(c.ra), b: q(c.rb), how: 'the recipe' }]; }
const sorted = (rows: Row[]) => [...rows].sort((x, y) => (x.bad ? 1 : 0) - (y.bad ? 1 : 0) || val(x.a) - val(y.a));

export default function Tables() {
 const [ci, setCi] = useState(0);
 const c = contexts[ci];
 const [rows, setRows] = useState<Row[]>(() => start(contexts[0]));
 const [sel, setSel] = useState(1);
 const [note, setNote] = useState<ReactNode>(null);
 const [ai, setAi] = useState(0);
 const [text, setText] = useState('');
 const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; body: ReactNode } | null>(null);
 const [misses, setMisses] = useState(0);
 const [solved, setSolved] = useState(false);
 const input = useRef<HTMLInputElement>(null);
 const touched = useRef(false);
 const unit = q(c.rb, c.ra); // b per one a

 useEffect(() => { if (touched.current && !solved) input.current?.focus({ preventScroll: true }); }, [ai, solved]);

 function pickCtx(i: number) {
  touched.current = false;
  setCi(i); setRows(start(contexts[i])); setSel(1); setNote(null); setAi(0); setText(''); setMsg(null); setMisses(0); setSolved(false);
 }

 // Returns false when an equivalent row is already there.
 function addRow(r: Row) {
  if (!r.bad && rows.some(x => !x.bad && eq(x.a, r.a))) { setSel(rows.findIndex(x => !x.bad && eq(x.a, r.a))); return false; }
  let keep = rows;
  if (keep.length >= MAX_ROWS) {
   // Make room: drop a crossed-out row first, then the oldest row the student made.
   const drop = keep.findIndex(x => x.bad) >= 0 ? keep.findIndex(x => x.bad) : keep.findIndex(x => !x.answer && x.how !== 'the recipe' && x.how !== 'none of either');
   if (drop >= 0) keep = keep.filter((_, i) => i !== drop);
  }
  const next = sorted([...keep, r]);
  setRows(next);
  setSel(next.indexOf(r));
  return true;
 }

 function apply(o: typeof ops[number]) {
  const r = rows[sel];
  if (!r || r.bad) return;
  const f = o.f(c, r);
  if (!f) return;
  const a = mul(r.a, f), b = mul(r.b, f);
  if (!addRow({ a, b, how: o.label })) { setNote(<>{show(a)} : {show(b)} is already in the table. It's selected now.</>); return; }
  setNote(<>{o.label === 'Make it 1' ? <>Divided both by {show(r.a)}</> : <>{o.label.startsWith('÷') ? 'Divided' : 'Multiplied'} both by {o.label.replace(/[×÷] /, '')}</>}: {show(r.a)} : {show(r.b)} → <strong>{show(a)} : {show(b)}</strong>. The two marks line up on the number lines, so it's the same ratio.</>);
 }

 function addOne() {
  const r = rows[sel];
  if (!r || r.bad) return;
  const a = add(r.a, q(1)), b = add(r.b, q(1));
  addRow({ a, b, how: '+1 to both', bad: true });
  setNote(<>Added 1 to both: {show(r.a)} : {show(r.b)} → <strong>{show(a)} : {show(b)}</strong>. See the red line on the number lines? The marks don't line up, so this is <strong>not</strong> the same ratio. It goes in the table crossed out.</>);
 }

 // ---- Your turn ----
 const ask = c.asks[ai];
 const want = ask ? (ask.give === 'a' ? mul(ask.value, unit) : div(ask.value, unit)) : null;
 const givenUnit = ask?.give === 'a' ? c.a : c.b, wantUnit = ask?.give === 'a' ? c.b : c.a;
 const factor = ask ? div(ask.value, q(ask.give === 'a' ? c.ra : c.rb)) : null;
 const intFactor = factor?.d === 1;

 function strategies(): ReactNode {
  if (!ask || !want || !factor) return null;
  const [g0, w0] = ask.give === 'a' ? [c.ra, c.rb] : [c.rb, c.ra];
  const u = ask.give === 'a' ? unit : div(q(1), unit);
  return <ul className="rp-strategies">
   <li><strong>Scale factor:</strong> {show(ask.value)} ÷ {g0} = {show(factor)}, so multiply {w0} by {show(factor)} too: {w0} × {show(factor)} = <strong>{show(want)}</strong>.</li>
   <li><strong>Unit rate:</strong> {w0} ÷ {g0} = {show(u)} {wantUnit} for each {ask.give === 'a' ? c.oneA : c.oneB}. Then {show(ask.value)} × {show(u)} = <strong>{show(want)}</strong>.</li>
  </ul>;
 }

 function check() {
  if (!ask || !want) return;
  touched.current = true;
  const ans = parse(text);
  if (!ans) { setMsg({ tone: 'info', body: 'Type a number, such as 12, 7.5, or 13 1/3.' }); return; }
  if (close(ans, want, text)) {
   setSolved(true); setNote(null);
   setMsg({ tone: 'good', body: <>Yes, <strong>{show(want)} {wantUnit}</strong>. Two ways to see it:{strategies()}</> });
   addRow(ask.give === 'a' ? { a: ask.value, b: want, how: 'your answer', answer: true } : { a: want, b: ask.value, how: 'your answer', answer: true });
   return;
  }
  setMisses(m => m + 1);
  const diff = c.rb - c.ra;
  const additive = ask.give === 'a' ? add(ask.value, q(diff)) : sub(ask.value, q(diff));
  const inverted = ask.give === 'a' ? div(ask.value, unit) : mul(ask.value, unit);
  const g0 = ask.give === 'a' ? c.ra : c.rb;
  const body = eq(ans, additive)
   ? <>It looks like you added {Math.abs(diff)} {ask.give === 'a' ? 'to' : 'from'} {show(ask.value)} because the recipe has {Math.abs(diff)} more {c.b} than {c.a}. But ratios grow by <em>multiplying</em>, not adding. How many times bigger is {show(ask.value)} than {g0}?</>
   : eq(ans, inverted)
   ? <>Check which way you multiplied. There are <em>more</em> {c.rb > c.ra ? c.b : c.a} than {c.rb > c.ra ? c.a : c.b}, so your answer should be {ask.give === 'a' ? (c.rb > c.ra ? 'bigger' : 'smaller') : (c.rb > c.ra ? 'smaller' : 'bigger')} than {show(ask.value)}.</>
   : intFactor
   ? <>Not quite. {show(ask.value)} is {show(factor!)} times {g0}. Multiply the other amount by the same number.</>
   : <>Not quite. {show(ask.value)} isn't a whole-number multiple of {g0}, so try the unit rate: use <strong>Make it 1</strong> on the recipe row to see how many {wantUnit} go with 1, then multiply.</>;
  setMsg({ tone: 'bad', body });
 }

 function showMe() {
  if (!ask || !want) return;
  setSolved(true); setNote(null);
  setMsg({ tone: 'info', body: <>The answer is <strong>{show(want)} {wantUnit}</strong>.{strategies()}</> });
  addRow(ask.give === 'a' ? { a: ask.value, b: want, how: 'shown', answer: true } : { a: want, b: ask.value, how: 'shown', answer: true });
 }
 function nextAsk() { touched.current = true; setAi(ai + 1); setText(''); setMsg(null); setMisses(0); setSolved(false); }

 return <div className="rp-panel">
  <p>A <strong>ratio table</strong> lists equivalent ratios. A <strong>double number line</strong> shows the same pairs as marks that line up. Pick a recipe, then make new rows by multiplying or dividing a row.</p>
  <div className="rp-chips" role="group" aria-label="Choose a situation">
   {contexts.map((x, i) => <button key={x.id} aria-pressed={i === ci} onClick={() => pickCtx(i)}><span aria-hidden="true">{x.icon}</span> {x.name}</button>)}
  </div>
  <p className="rp-prompt"><strong>{c.name}:</strong> {c.ra} {c.a} for every {c.rb} {c.b}.</p>

  <div className="rp-two">
   <div>
    <table className="rp-table">
     <caption className="rp-sr">Ratio table for {c.name}. Select a row, then use the buttons to make a new row.</caption>
     <thead><tr><th scope="col">{c.a}</th><th scope="col">{c.b}</th><th scope="col"><span className="rp-sr">How it was made</span></th></tr></thead>
     <tbody>{rows.map((r, i) => <tr key={i} className={`${r.bad ? 'bad' : ''} ${r.answer ? 'answer' : ''} ${i === sel ? 'sel' : ''}`}>
      <td>{show(r.a)}</td><td>{show(r.b)}</td>
      <td>{r.bad ? <span className="rp-tag bad">✗ not equivalent</span>
       : i === 0 ? <span className="rp-muted">start</span>
       : <button className="rp-select" aria-pressed={i === sel} aria-label={`Select the row ${show(r.a)} ${c.a}, ${show(r.b)} ${c.b}`} onClick={() => { setSel(i); setNote(null); }}>{i === sel ? 'Selected' : 'Select'}</button>}</td>
     </tr>)}</tbody>
    </table>
   </div>
   <div>
    <p className="rp-label">Make a new row from the selected row ({show(rows[sel]?.a ?? q(0))} : {show(rows[sel]?.b ?? q(0))}):</p>
    <div className="rp-chips">
     {ops.map(o => <button key={o.label} aria-label={o.aria} disabled={!rows[sel] || rows[sel].bad || sel === 0} onClick={() => apply(o)}>{o.label}</button>)}
    </div>
    <div className="rp-chips rp-trap"><button disabled={!rows[sel] || rows[sel].bad} onClick={addOne}>+1 to both (try it)</button></div>
    <div aria-live="polite">{note && <p className="rp-note">{note}</p>}</div>
   </div>
  </div>

  <NumberLines c={c} rows={rows} sel={sel} />

  <div className="rp-turn">
   <h3>Your turn</h3>
   {ask ? <>
    <p className="rp-eyebrow">Question {ai + 1} of {c.asks.length}</p>
    <p className="rp-prompt">How many <strong>{wantUnit}</strong> go with <strong>{show(ask.value)} {givenUnit}</strong>?</p>
    {!solved && <form className="rp-row" onSubmit={e => { e.preventDefault(); check(); }}>
     <label className="rp-sr" htmlFor="rp-table-ans">{wantUnit}</label>
     <input id="rp-table-ans" ref={input} className="rp-input" value={text} autoComplete="off" inputMode="decimal" placeholder="e.g. 12" onChange={e => setText(e.target.value)} />
     <span className="rp-muted">{wantUnit}</span>
     <button className="rp-primary" type="submit">Check</button>
     {misses >= 2 && <button type="button" className="rp-link" onClick={showMe}>Show me</button>}
    </form>}
    <div aria-live="polite">{msg && <div className={`rp-feedback ${msg.tone}`}>{msg.body}</div>}</div>
    {solved && <div className="rp-row">{ai + 1 < c.asks.length
     ? <button className="rp-primary" onClick={nextAsk}>Next question →</button>
     : <><span>All three done.</span>{ci + 1 < contexts.length && <button className="rp-primary" onClick={() => pickCtx(ci + 1)}>Try {contexts[ci + 1].name} →</button>}</>}</div>}
   </> : null}
  </div>
 </div>;
}

// Two number lines drawn on the same scale, so equivalent pairs line up vertically.
function NumberLines({ c, rows, sel }: { c: Ctx; rows: Row[]; sel: number }) {
 const W = 640, X0 = 30, X1 = W - 30, TOP = 58, BOT = 138;
 const k = c.ra / c.rb; // bottom values drawn at b × k, so a proportional pair is vertical
 const maxA = Math.max(...rows.map(r => Math.max(val(r.a), val(r.b) * k)), c.ra) * 1.08;
 const x = (v: number) => X0 + v / maxA * (X1 - X0);
 const good = rows.filter(r => !r.bad);
 // Skip labels that would overlap the one before.
 const labelled = new Set<number>();
 let last = -Infinity;
 [...good].sort((p, r) => val(p.a) - val(r.a)).forEach(r => { const px = x(val(r.a)); if (px - last >= 30) { labelled.add(val(r.a)); last = px; } });
 const selRow = rows[sel];
 return <figure className="rp-figure">
  <svg viewBox={`0 0 ${W} 196`} role="img" aria-label={`Double number line. Top: ${c.a}. Bottom: ${c.b}. Pairs: ${good.map(r => `${show(r.a)} and ${show(r.b)}`).join('; ')}.`}>
   <text x={X0} y={18} className="rp-nl-title">{c.a}</text>
   <text x={X0} y={188} className="rp-nl-title">{c.b}</text>
   <line x1={X0} x2={X1 + 12} y1={TOP} y2={TOP} className="rp-nl-axis" markerEnd="url(#rp-arrow)" />
   <line x1={X0} x2={X1 + 12} y1={BOT} y2={BOT} className="rp-nl-axis" markerEnd="url(#rp-arrow)" />
   <defs><marker id="rp-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" className="rp-nl-arrowhead" /></marker></defs>
   {good.map((r, i) => { const px = x(val(r.a)), isSel = r === selRow, show2 = labelled.has(val(r.a)) || isSel || r.answer;
    return <g key={`g${i}`} className={`rp-nl-pair${isSel ? ' sel' : ''}${r.answer ? ' answer' : ''}`}>
     <line x1={px} x2={px} y1={TOP} y2={BOT} className="rp-nl-link" />
     <line x1={px} x2={px} y1={TOP - 8} y2={TOP + 8} className="rp-nl-tick" />
     <line x1={px} x2={px} y1={BOT - 8} y2={BOT + 8} className="rp-nl-tick" />
     {show2 && <><text x={px} y={TOP - 14} textAnchor="middle" className="rp-nl-num">{show(r.a)}</text>
      <text x={px} y={BOT + 24} textAnchor="middle" className="rp-nl-num">{show(r.b)}</text></>}
    </g>; })}
   {rows.filter(r => r.bad).map((r, i) => { const pa = x(val(r.a)), pb = x(val(r.b) * k);
    return <g key={`b${i}`} className="rp-nl-bad">
     <line x1={pa} x2={pb} y1={TOP} y2={BOT} />
     <circle cx={pa} cy={TOP} r={4} /><circle cx={pb} cy={BOT} r={4} />
     <text x={(pa + pb) / 2 + 8} y={(TOP + BOT) / 2 + 4}>✗ {show(r.a)} : {show(r.b)}</text>
    </g>; })}
  </svg>
  <figcaption>Equivalent pairs line up straight down. A pair that doesn't belong leans.</figcaption>
 </figure>;
}
