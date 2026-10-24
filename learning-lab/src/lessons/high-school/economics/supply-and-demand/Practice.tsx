import { useState, type ReactNode } from 'react';
import Chart, { Dot, Line } from './Chart';
import { D0, S0, SHIFT, equilibrium, shifted, type Dir } from './market';
import { doubles, effects, singles, traps, type Headline } from './headlines';

type Kind = 'single' | 'trap' | 'double';
type Entry = { h: Headline; kind: Kind; misses: number; shown: boolean };
type Stage = 'shifts' | 'effects' | 'done';
type Answer = Dir | null | undefined; // undefined: not chosen yet; null: "can't tell"
const ROUND = 6;

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// Four single shifts (at least one of each curve), one price-only trap, and one double shift.
function deal(): Entry[] {
 const ds = shuffle(singles.filter(h => h.d)), ss = shuffle(singles.filter(h => h.s));
 const rest = shuffle([...ds.slice(1), ...ss.slice(1)]).slice(0, ROUND - 4);
 const list: Entry[] = [ds[0], ss[0], ...rest].map(h => ({ h, kind: 'single' as Kind, misses: 0, shown: false }));
 list.push({ h: pick(traps), kind: 'trap', misses: 0, shown: false }, { h: pick(doubles), kind: 'double', misses: 0, shown: false });
 return shuffle(list);
}

const shiftWord = (d: Dir) => d > 0 ? 'shifts right' : d < 0 ? 'shifts left' : 'does not shift';
const moveWord = (d: Answer) => d === null ? 'can’t tell' : d! > 0 ? 'rises' : d! < 0 ? 'falls' : 'no change';
// "Price rises" or "price could go either way".
const outcome = (what: string, d: Dir | null) => `${what} ${d === null ? 'could go either way' : moveWord(d)}`;

function Seg({ label, value, options, set }: { label: string; value: Answer; options: { v: Dir | null; text: string }[]; set: (v: Dir | null) => void }) {
 return <div className="sd-seg" role="group" aria-label={label}>
  {options.map(o => <button key={String(o.v)} aria-pressed={value === o.v} onClick={() => set(o.v)}>{o.text}</button>)}
 </div>;
}
const shiftOptions = [{ v: -1 as Dir, text: '← Left' }, { v: 0 as Dir, text: 'No shift' }, { v: 1 as Dir, text: 'Right →' }];
const moveOptions = [{ v: 1 as Dir, text: 'Rises' }, { v: -1 as Dir, text: 'Falls' }, { v: null, text: 'Can’t tell' }];

export default function Practice() {
 const [round, setRound] = useState<Entry[]>(deal);
 const [i, setI] = useState(0);
 const [stage, setStage] = useState<Stage>('shifts');
 const [d, setD] = useState<Answer>(undefined);
 const [s, setS] = useState<Answer>(undefined);
 const [p, setP] = useState<Answer>(undefined);
 const [q, setQ] = useState<Answer>(undefined);
 const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; body: ReactNode } | null>(null);
 const [stageMisses, setStageMisses] = useState(0);
 const entry = round[i];
 const finished = i >= round.length;
 const h = entry?.h;
 const fx = h ? effects(h) : null;

 function miss() {
  setStageMisses(m => m + 1);
  setRound(rs => rs.map((e, k) => k === i ? { ...e, misses: e.misses + 1 } : e));
 }
 function finish(body: ReactNode) { setStage('done'); setMsg({ tone: 'good', body }); setStageMisses(0); }

 function curveNote(curve: 'd' | 's', want: Dir, got: Dir): ReactNode {
  const who = curve === 'd' ? 'buyers' : 'sellers', Name = curve === 'd' ? 'Demand' : 'Supply';
  if (want === got) return null;
  if (want === 0 && entry.kind === 'trap') return <>{Name}: the headline only describes a change in this good's own price. That moves {who} along the curve; it doesn't shift it.</>;
  if (want === 0) return <>{Name}: nothing in the headline changes what {who} {curve === 'd' ? 'want' : 'offer'} at a given price.</>;
  if (got === 0) return <>{Name}: something here does change {who}' plans at every price. {curve === 'd' ? 'Demand moves with tastes, incomes, prices of substitutes and complements, the number of buyers, and expectations.' : 'Supply moves with input costs, technology, weather, the number of sellers, taxes and subsidies, and sellers’ other options.'}</>;
  return <>{Name}: right curve, wrong way. Hold the price fixed. After this news, will {who} {curve === 'd' ? 'want' : 'offer'} more or less? More at every price is a shift right.</>;
 }

 function checkShifts() {
  if (!h || !fx) return;
  if (d === undefined || s === undefined) { setMsg({ tone: 'info', body: 'Choose an answer for both demand and supply.' }); return; }
  if (d === h.d && s === h.s) {
   setStageMisses(0);
   if (entry.kind === 'trap') return finish(<>Right: neither curve shifts. {h.why}</>);
   setStage('effects'); setMsg({ tone: 'good', body: <>Yes. {h.why} Now, what happens to the equilibrium?</> });
   return;
  }
  miss();
  setMsg({ tone: 'bad', body: <>{[curveNote('d', h.d, d as Dir), curveNote('s', h.s, s as Dir)].filter(Boolean).map((n, k) => <span key={k} className="sd-block">{n}</span>)}</> });
 }

 function moveNote(what: 'price' | 'quantity', want: Dir | null, got: Answer): ReactNode {
  if (want === got) return null;
  const pushes = what === 'price'
   ? [h!.d ? `demand ${h!.d > 0 ? 'right pushes price up' : 'left pushes price down'}` : '', h!.s ? `supply ${h!.s > 0 ? 'right pushes price down' : 'left pushes price up'}` : '']
   : [h!.d ? `demand ${h!.d > 0 ? 'right pushes quantity up' : 'left pushes quantity down'}` : '', h!.s ? `supply ${h!.s > 0 ? 'right pushes quantity up' : 'left pushes quantity down'}` : ''];
  const list = pushes.filter(Boolean).join(' and ');
  const cap = list[0].toUpperCase() + list.slice(1);
  if (want === null) return <>{cap}. They pull in opposite directions, so the {what} change depends on which shift is bigger: you can't tell from the headline.</>;
  if (got === null) return entry.kind === 'double' ? <>{cap}, so both push the same way. That makes the {what} change certain.</> : <>Only one curve shifts, so the {what} change is certain: {list}.</>;
  return <>{cap}. Think about the shortage or surplus at the old price.</>;
 }

 function checkEffects() {
  if (!fx) return;
  if (p === undefined || q === undefined) { setMsg({ tone: 'info', body: 'Choose an answer for both price and quantity.' }); return; }
  if (p === fx.p && q === fx.q) return finish(<>Correct: {outcome('price', fx.p)} and {outcome('quantity', fx.q)}.{entry.kind === 'double' ? ' With two shifts, one result is certain and the other depends on the sizes.' : ''}</>);
  miss();
  setMsg({ tone: 'bad', body: <>{[moveNote('price', fx.p, p), moveNote('quantity', fx.q, q)].filter(Boolean).map((n, k) => <span key={k} className="sd-block">{n}</span>)}</> });
 }

 function showMe() {
  if (!h || !fx) return;
  setRound(rs => rs.map((e, k) => k === i ? { ...e, shown: true } : e));
  setStageMisses(0);
  if (stage === 'shifts') {
   setD(h.d); setS(h.s);
   if (entry.kind === 'trap') return finish(<>Neither curve shifts. {h.why}</>);
   setStage('effects'); setMsg({ tone: 'info', body: <>Demand {shiftWord(h.d)} and supply {shiftWord(h.s)}. {h.why}</> });
  } else { setP(fx.p); setQ(fx.q); finish(<>{outcome('Price', fx.p)} and {outcome('quantity', fx.q)}.</>); }
 }

 function reset() { setStage('shifts'); setD(undefined); setS(undefined); setP(undefined); setQ(undefined); setMsg(null); setStageMisses(0); }
 function next() { setI(i + 1); reset(); }
 function restart(rs = deal()) { setRound(rs); setI(0); reset(); }

 if (finished) {
  const clean = round.filter(e => e.misses === 0 && !e.shown).length;
  const missed = round.filter(e => e.misses > 0 || e.shown);
  return <div className="sd-panel">
   <h3>Round complete: {clean} of {round.length} without a slip</h3>
   <p>{clean === round.length ? 'Clean sweep. You can read a headline and see which curve moves, which way, and what follows.' : 'The usual slips: treating a price change as a shift, mixing up who is affected (buyers or sellers), and forgetting that two shifts can leave one result uncertain.'}</p>
   <ul className="sd-review">{round.map((e, k) => { const f = effects(e.h); return <li key={k}>
    <span aria-hidden="true">{e.misses === 0 && !e.shown ? '✓' : '↺'}</span> <strong>{e.h.market}:</strong> {e.h.text}
    <span className="sd-aside sd-block">{e.kind === 'trap' ? 'No shift: a slide along a curve.' : `Demand ${shiftWord(e.h.d)}, supply ${shiftWord(e.h.s)}. ${outcome('Price', f.p)}, ${outcome('quantity', f.q)}.`}</span>
   </li>; })}</ul>
   <div className="sd-row">
    <button className="sd-primary" onClick={() => restart()}>New round</button>
    {missed.length > 0 && <button onClick={() => restart(missed.map(e => ({ ...e, misses: 0, shown: false })))}>Redo the {missed.length} I slipped on</button>}
   </div>
  </div>;
 }

 const dShow = stage === 'shifts' ? 0 : h.d * SHIFT, sShow = stage === 'shifts' ? 0 : h.s * SHIFT;
 const E1 = equilibrium(D0, S0), E2 = equilibrium(shifted(D0, dShow), shifted(S0, sShow));

 return <div className="sd-panel">
  <div className="sd-progress" aria-label={`Headline ${i + 1} of ${round.length}`}>
   {round.map((e, k) => <span key={k} className={k < i ? (e.misses === 0 && !e.shown ? 'done' : 'slip') : k === i ? 'now' : ''} />)}
  </div>
  <p className="sd-eyebrow">Headline {i + 1} of {round.length} · Market for {h.market.toLowerCase()}</p>
  <blockquote className="sd-headline">{h.text}</blockquote>
  {i === 0 && stage === 'shifts' && !msg && <p className="sd-aside">These headlines are made-up examples, not real news.</p>}

  <div className="sd-two">
   <div>
    <p className="sd-label">1. What happens to each curve in the market for {h.market.toLowerCase()}?</p>
    <div className="sd-predict-grid">
     <span>Demand</span><Seg label="Demand" value={d} options={shiftOptions} set={v => stage === 'shifts' && setD(v)} />
     <span>Supply</span><Seg label="Supply" value={s} options={shiftOptions} set={v => stage === 'shifts' && setS(v)} />
    </div>
    {stage === 'shifts' && <div className="sd-row"><button className="sd-primary" onClick={checkShifts}>Check</button>{stageMisses >= 2 && <button className="sd-link" onClick={showMe}>Show me</button>}</div>}

    {entry.kind !== 'trap' && stage !== 'shifts' && <>
     <p className="sd-label">2. What happens to the equilibrium?</p>
     <div className="sd-predict-grid">
      <span>Price</span><Seg label="Price" value={p} options={moveOptions} set={v => stage === 'effects' && setP(v)} />
      <span>Quantity</span><Seg label="Quantity" value={q} options={moveOptions} set={v => stage === 'effects' && setQ(v)} />
     </div>
     {stage === 'effects' && <div className="sd-row"><button className="sd-primary" onClick={checkEffects}>Check</button>{stageMisses >= 2 && <button className="sd-link" onClick={showMe}>Show me</button>}</div>}
    </>}
    <div aria-live="polite">{msg && <p className={`sd-feedback ${msg.tone}`}>{msg.body}</p>}</div>
    {stage === 'done' && <div className="sd-row"><button className="sd-primary" onClick={next}>{i + 1 < round.length ? 'Next headline →' : 'See my round'}</button></div>}
   </div>

   {stage === 'done' && entry.kind !== 'trap' ? <Chart numbers={false} qTitle="Quantity" pTitle="Price" compact
    label={`Sketch: demand ${shiftWord(h.d)}, supply ${shiftWord(h.s)}. ${outcome('Price', fx!.p)}, ${outcome('quantity', fx!.q)}.`}
    caption={entry.kind === 'double' ? 'Drawn with equal-sized shifts. Make either shift bigger and the uncertain result could go either way.' : 'A sketch of the shift. The size is made up; the directions are what matter.'}>
    {sc => <>
     {h.d !== 0 && <Line s={sc} c={D0} kind="d" ghost />}
     {h.s !== 0 && <Line s={sc} c={S0} kind="s" ghost />}
     <Line s={sc} c={D0} kind="d" shift={dShow} name={h.d ? 'D₂' : 'D'} />
     <Line s={sc} c={S0} kind="s" shift={sShow} name={h.s ? 'S₂' : 'S'} />
     <Dot s={sc} q={E1.q} p={E1.p} cls="old" label="E₁" side="left" />
     <Dot s={sc} q={E2.q} p={E2.p} cls="eq" label="E₂" guides side={E2.q >= E1.q ? 'right' : 'left'} />
    </>}
   </Chart> : <div className="sd-tipbox">
    <p><strong>Tips</strong></p>
    <ul>
     <li>Ask <em>whose</em> plans change first: buyers (demand) or sellers (supply).</li>
     <li>A change in <em>this good's own price</em> never shifts its curves.</li>
     <li>Right means more at every price; left means less.</li>
     <li>Two shifts: one result is certain; the other may be "can't tell".</li>
    </ul>
   </div>}
  </div>
 </div>;
}
