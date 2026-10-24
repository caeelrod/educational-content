import { useState, type ReactNode } from 'react';
import Chart, { Dot, Line, PriceLine } from './Chart';
import { D0, S0, SHIFT, boxes, equilibrium, money, qAt, shifted, sign, word, type Dir } from './market';

type Which = 'd' | 's' | 'none';
type Event = { text: string; curve: Which; dir: 1 | -1; factor: string; why: string; slide?: 'd' | 's' };

// The strawberry town again. Each event changes one thing; the student decides what it moves.
const events: Event[] = [
 { text: 'A late frost kills a third of the blossoms on local farms.', curve: 's', dir: -1, factor: 'weather',
  why: 'Frost leaves growers with fewer berries to pick, so at every price they can bring fewer boxes.' },
 { text: 'A strawberry-lemonade recipe goes viral online.', curve: 'd', dir: 1, factor: 'tastes',
  why: 'More people want strawberries at every price. Nothing about growing them changed.' },
 { text: 'Blueberries go on sale at half price.', curve: 'd', dir: -1, factor: 'the price of a substitute',
  why: 'Blueberries can replace strawberries in a lot of recipes. When the substitute gets cheaper, some buyers switch, so fewer boxes of strawberries are wanted at every strawberry price.' },
 { text: 'A new picking machine lets farms harvest faster for less money.', curve: 's', dir: 1, factor: 'technology',
  why: 'Lower cost per box means it is worth bringing more boxes at every price.' },
 { text: 'The price of strawberries goes up, and shoppers buy fewer boxes.', curve: 'none', dir: 1, factor: 'the strawberry price itself', slide: 'd',
  why: 'Price is on the axis of the chart. A change in the strawberry price moves buyers along the demand curve to a smaller quantity demanded. The curve itself stays put.' },
 { text: 'Farmworkers’ wages rise across the region.', curve: 's', dir: -1, factor: 'input costs',
  why: 'Picking costs more, so some boxes that used to be worth bringing at a given price no longer are.' },
 { text: 'A new factory opens and incomes in town rise.', curve: 'd', dir: 1, factor: 'income',
  why: 'With more to spend, people buy more strawberries at every price. (That is true for most goods, called normal goods. For a few, like the cheapest store brands, demand falls when incomes rise.)' },
 { text: 'Strawberry prices rise, and growers pick rows they would normally skip.', curve: 'none', dir: 1, factor: 'the strawberry price itself', slide: 's',
  why: 'A higher strawberry price moves growers along the supply curve to a larger quantity supplied. That is a slide along supply, not a shift of it.' },
 { text: 'Shoppers hear prices will jump next week, so they stock up now.', curve: 'd', dir: 1, factor: 'buyers’ expectations',
  why: 'Expecting a higher price later makes buyers want more boxes now, at every price.' },
 { text: 'The price of whipped cream doubles.', curve: 'd', dir: -1, factor: 'the price of a complement',
  why: 'Strawberries and whipped cream go together. When the complement costs more, people make fewer strawberry desserts and want fewer boxes at every price.' },
 { text: 'Three new farms in the county plant strawberries.', curve: 's', dir: 1, factor: 'the number of sellers',
  why: 'More growers means more boxes offered at every price.' },
 { text: 'The town starts charging growers a 50¢ fee on every box they sell.', curve: 's', dir: -1, factor: 'a tax on sellers',
  why: 'The fee works like a higher cost per box, so growers bring fewer boxes at every price.' }
];

const E1 = equilibrium(D0, S0);
const name = (w: Which) => w === 'd' ? 'demand' : w === 's' ? 'supply' : 'neither';
type Stage = 'curve' | 'dir' | 'predict' | 'done';

function curveHint(ev: Event, chose: Which): ReactNode {
 if (ev.curve === 'none') return <>Careful: the event is a change in the <em>strawberry price itself</em>. Price is on the chart's axis, so a change in it never shifts the strawberry curves. It moves buyers or sellers <em>along</em> a curve.</>;
 if (chose === 'none') return <>Something other than the strawberry price changed here ({ev.factor}). When that happens, the amount wanted or offered changes <em>at every price</em>, so a whole curve moves.</>;
 if (ev.curve === 's') return <>Ask whose plans change first. This is about {ev.factor}, which changes what it takes to grow and sell a box, not how much buyers want one. Supply shifts with costs, technology, weather, the number of sellers, taxes, and sellers' other options.</>;
 return <>Ask whose plans change first. Growers' costs didn't change; this is about {ev.factor}, which changes how many boxes buyers want. Demand shifts with tastes, incomes, prices of substitutes and complements, the number of buyers, and expectations.</>;
}

export default function Shifts() {
 const [mode, setMode] = useState<'events' | 'both'>('events');
 return <div className="sd-panel">
  <p>The equilibrium only stays put while nothing else changes. When something does, ask in order (this is the four-step process in many textbooks):</p>
  <ol className="sd-steps">
   <li>Start at the old equilibrium.</li>
   <li>Does this change <strong>demand</strong> (buyers' plans) or <strong>supply</strong> (sellers' plans)? Or is it only a change in this good's own price?</li>
   <li>Does that curve shift <strong>right</strong> (more at every price) or <strong>left</strong> (less at every price)?</li>
   <li>Find the new equilibrium and compare price and quantity.</li>
  </ol>
  <div className="sd-seg" role="group" aria-label="Activity">
   <button aria-pressed={mode === 'events'} onClick={() => setMode('events')}>What happened in town?</button>
   <button aria-pressed={mode === 'both'} onClick={() => setMode('both')}>Shift both curves yourself</button>
  </div>
  {mode === 'events' ? <Events /> : <Both />}
 </div>;
}

function Events() {
 const [i, setI] = useState(0);
 const [stage, setStage] = useState<Stage>('curve');
 const [msg, setMsg] = useState<{ good: boolean; body: ReactNode } | null>(null);
 const [pg, setPg] = useState<Dir>(0);
 const [qg, setQg] = useState<Dir>(0);
 const [done, setDone] = useState<Set<number>>(new Set());
 const ev = events[i];
 const moved = stage === 'predict' || stage === 'done';
 const dD = moved && ev.curve === 'd' ? ev.dir * SHIFT : 0;
 const dS = moved && ev.curve === 's' ? ev.dir * SHIFT : 0;
 const D = shifted(D0, dD), S = shifted(S0, dS);
 const E2 = equilibrium(D, S);
 const pDir = sign(E1.p, E2.p), qDir = sign(E1.q, E2.q);
 // For a price-only event, show the slide from $4 to $5 along one curve.
 const slideP = 5, slideQ = ev.slide === 'd' ? qAt(D0, slideP) : qAt(S0, slideP);

 function go(k: number) { setI(k); setStage('curve'); setMsg(null); setPg(0); setQg(0); }
 function chooseCurve(w: Which) {
  if (w !== ev.curve) { setMsg({ good: false, body: curveHint(ev, w) }); return; }
  if (w === 'none') { setStage('done'); setDone(d => new Set(d).add(i)); setMsg({ good: true, body: <>Right, neither curve shifts. {ev.why}</> }); return; }
  setStage('dir'); setMsg({ good: true, body: <>Yes, {name(w)}. This is about {ev.factor}.</> });
 }
 function chooseDir(d: 1 | -1) {
  const who = ev.curve === 'd' ? 'buyers want' : 'growers bring';
  if (d !== ev.dir) {
   setMsg({ good: false, body: <>Hold the price fixed at {money(E1.p)} and ask: after this, will {who} more boxes or fewer? More at every price is a shift right; fewer is a shift left.{ev.curve === 's' && ev.dir < 0 ? ' (A supply curve that shifts left also looks higher on the chart, which is why "left" and "right" are safer words than "up" and "down".)' : ''}</> });
   return;
  }
  setStage('predict');
  // The curves only move on the next render, so work out the gap at the old price from the event itself.
  const short = ev.curve === 'd' ? d > 0 : d < 0;
  setMsg({ good: true, body: <>Right: {ev.why} Now look at the old price, {money(E1.p)}, on the chart. There is a {short ? 'shortage' : 'surplus'} there now.</> });
 }
 function checkPredict() {
  if (!pg || !qg) { setMsg({ good: false, body: 'Choose a direction for both price and quantity.' }); return; }
  const gapShort = qAt(D, E1.p) > qAt(S, E1.p);
  if (pg === pDir && qg === qDir) {
   setStage('done'); setDone(d => new Set(d).add(i));
   setMsg({ good: true, body: <>Exactly. At the old price of {money(E1.p)} there was a {gapShort ? 'shortage' : 'surplus'} of {boxes(Math.abs(qAt(D, E1.p) - qAt(S, E1.p)))}, which pushed the price {pDir > 0 ? 'up' : 'down'} until the market cleared again at {money(E2.p)} and {boxes(E2.q)}.</> });
   return;
  }
  const body = pg !== pDir
   ? <>Check the price. At the old price of {money(E1.p)} there is now a {gapShort ? 'shortage' : 'surplus'}, and a {gapShort ? 'shortage pushes the price up' : 'surplus pushes the price down'}.</>
   : <>Price {word(pDir)}, good. For quantity, follow the curve that did <em>not</em> move: the new equilibrium slides along {ev.curve === 'd' ? 'supply' : 'demand'} {pDir > 0 ? 'up' : 'down'} to {ev.curve === 'd' ? (pDir > 0 ? 'more' : 'fewer') : (pDir > 0 ? 'fewer' : 'more')} boxes.</>;
  setMsg({ good: false, body });
 }

 const label = ev.curve === 'none' && stage === 'done'
  ? `The curves stay where they were. ${ev.slide === 'd' ? 'Buyers' : 'Growers'} move along the ${name(ev.slide!)} curve from ${money(E1.p)} to ${money(slideP)}.`
  : `Supply and demand for strawberries.${dD ? ` Demand has shifted ${dD > 0 ? 'right' : 'left'}.` : ''}${dS ? ` Supply has shifted ${dS > 0 ? 'right' : 'left'}.` : ''}${stage === 'done' ? ` New equilibrium ${money(E2.p)} and ${boxes(E2.q)}.` : ''}`;

 return <div>
  <div className="sd-chips sd-events" role="group" aria-label="Events">
   {events.map((_, k) => <button key={k} aria-pressed={k === i} onClick={() => go(k)} aria-label={`Event ${k + 1}${done.has(k) ? ', done' : ''}`}>{done.has(k) ? '✓' : k + 1}</button>)}
  </div>
  <div className="sd-event"><span className="sd-eyebrow">Event {i + 1} of {events.length}</span><p>{ev.text}</p></div>

  <div className="sd-two">
   <Chart label={label} compact>
    {s => <>
     {dD !== 0 && <Line s={s} c={D0} kind="d" ghost />}
     {dS !== 0 && <Line s={s} c={S0} kind="s" ghost />}
     <Line s={s} c={D0} kind="d" shift={dD} name={dD ? 'D₂' : 'D'} />
     <Line s={s} c={S0} kind="s" shift={dS} name={dS ? 'S₂' : 'S'} />
     {stage === 'predict' && <PriceLine s={s} p={E1.p} qd={qAt(D, E1.p)} qs={qAt(S, E1.p)} label={`old price ${money(E1.p)}`} />}
     <Dot s={s} q={E1.q} p={E1.p} cls={stage === 'done' && ev.curve !== 'none' ? 'old' : 'eq'} label="E₁" side="left" guides={stage !== 'done' || ev.curve === 'none'} />
     {stage === 'done' && ev.curve !== 'none' && <Dot s={s} q={E2.q} p={E2.p} cls="eq" label="E₂" guides side={E2.q > E1.q ? 'right' : 'left'} />}
     {stage === 'done' && ev.curve === 'none' && <>
      <line className={`sd-arrow ${ev.slide}`} x1={s.x(E1.q)} y1={s.y(E1.p)} x2={s.x(slideQ)} y2={s.y(slideP)} />
      <Dot s={s} q={slideQ} p={slideP} cls={ev.slide} label={`${money(slideP)}: ${boxes(slideQ)}`} side={ev.slide === 'd' ? 'left' : 'right'} />
     </>}
    </>}
   </Chart>

   <div className="sd-side">
    {stage === 'curve' && <div><p className="sd-label">Which curve does this shift?</p>
     <div className="sd-row"><button onClick={() => chooseCurve('d')}>Demand</button><button onClick={() => chooseCurve('s')}>Supply</button><button onClick={() => chooseCurve('none')}>Neither: it's a slide along a curve</button></div></div>}
    {stage === 'dir' && <div><p className="sd-label">Which way does {name(ev.curve)} shift?</p>
     <div className="sd-row"><button onClick={() => chooseDir(-1)}>← Left: less at every price</button><button onClick={() => chooseDir(1)}>Right: more at every price →</button></div></div>}
    {stage === 'predict' && <div><p className="sd-label">Predict the new equilibrium.</p>
     <div className="sd-predict-grid">
      <span>Price</span><div className="sd-seg" role="group" aria-label="Price prediction"><button aria-pressed={pg === 1} onClick={() => setPg(1)}>Rises</button><button aria-pressed={pg === -1} onClick={() => setPg(-1)}>Falls</button></div>
      <span>Quantity</span><div className="sd-seg" role="group" aria-label="Quantity prediction"><button aria-pressed={qg === 1} onClick={() => setQg(1)}>Rises</button><button aria-pressed={qg === -1} onClick={() => setQg(-1)}>Falls</button></div>
     </div>
     <div className="sd-row"><button className="sd-primary" onClick={checkPredict}>Check</button></div></div>}
    <div aria-live="polite">{msg && <p className={`sd-feedback ${msg.good ? 'good' : 'bad'}`}>{msg.body}</p>}</div>
    {stage === 'done' && ev.curve !== 'none' && <div className="sd-readout">
     <div><span>Price</span><strong>{money(E1.p)} → {money(E2.p)}</strong></div>
     <div><span>Quantity</span><strong>{boxes(E1.q)} → {boxes(E2.q)}</strong></div>
    </div>}
    {stage === 'done' && ev.curve === 'none' && <p className="sd-aside">Economists say "a change in <em>quantity</em> {ev.slide === 'd' ? 'demanded' : 'supplied'}" for a slide along the curve, and "a change in {ev.slide === 'd' ? 'demand' : 'supply'}" only when the whole curve shifts.</p>}
    {stage === 'done' && i + 1 < events.length && <div className="sd-row"><button className="sd-primary" onClick={() => go(i + 1)}>Next event →</button></div>}
    {stage === 'done' && done.size === events.length && <div className="sd-takeaway"><p><strong>The pattern.</strong> Demand right: price and quantity both rise. Demand left: both fall. Supply right: price falls, quantity rises. Supply left: price rises, quantity falls. You don't need to memorize it; the shortage or surplus at the old price tells you every time.</p></div>}
   </div>
  </div>
 </div>;
}

function Both() {
 const [dD, setDD] = useState(4);
 const [dS, setDS] = useState(2);
 const D = shifted(D0, dD), S = shifted(S0, dS), E2 = equilibrium(D, S);
 const pDir = sign(E1.p, E2.p), qDir = sign(E1.q, E2.q);
 const same = Math.sign(dD) === Math.sign(dS) && dD !== 0;
 const opposite = Math.sign(dD) === -Math.sign(dS) && dD !== 0;
 const dirName = (d: number) => d > 0 ? 'right' : 'left';
 const slider = (id: string, label: string, v: number, set: (v: number) => void) => <div className="sd-grow">
  <label className="sd-label" htmlFor={id}>{label}: <strong>{v === 0 ? 'no shift' : `${Math.abs(v)},000 boxes ${dirName(v)}`}</strong></label>
  <input id={id} type="range" min={-6} max={6} step={1} value={v} aria-valuetext={v === 0 ? 'no shift' : `${Math.abs(v)} thousand boxes ${dirName(v)}`} onChange={e => set(Number(e.target.value))} />
 </div>;

 return <div>
  <p>Real news rarely comes one item at a time. Shift both curves and watch which result you can be sure of.</p>
  <div className="sd-controls">
   {slider('sd-dd', 'Demand shift', dD, setDD)}
   {slider('sd-ds', 'Supply shift', dS, setDS)}
  </div>
  <div className="sd-chips" role="group" aria-label="Examples">
   <button onClick={() => { setDD(4); setDS(2); }}>Both right, demand bigger</button>
   <button onClick={() => { setDD(2); setDS(5); }}>Both right, supply bigger</button>
   <button onClick={() => { setDD(3); setDS(-3); }}>Demand right, supply left</button>
   <button onClick={() => { setDD(-2); setDS(-5); }}>Both left</button>
  </div>
  <Chart label={`Demand shifted ${dD === 0 ? 'not at all' : dirName(dD)}, supply shifted ${dS === 0 ? 'not at all' : dirName(dS)}. New equilibrium ${money(E2.p)} and ${boxes(E2.q)}, compared with ${money(E1.p)} and ${boxes(E1.q)}.`}>
   {s => <>
    {dD !== 0 && <Line s={s} c={D0} kind="d" ghost />}
    {dS !== 0 && <Line s={s} c={S0} kind="s" ghost />}
    <Line s={s} c={D0} kind="d" shift={dD} name="D" />
    <Line s={s} c={S0} kind="s" shift={dS} name="S" />
    {(dD !== 0 || dS !== 0) && <Dot s={s} q={E1.q} p={E1.p} cls="old" label="E₁" side="left" />}
    <Dot s={s} q={E2.q} p={E2.p} cls="eq" label={dD || dS ? 'E₂' : 'E'} guides side={E2.q >= E1.q ? 'right' : 'left'} />
   </>}
  </Chart>
  <div className="sd-readout" aria-live="polite">
   <div><span>Price</span><strong>{money(E1.p)} → {money(E2.p)}</strong></div>
   <div><span>Quantity</span><strong>{boxes(E1.q)} → {boxes(E2.q)}</strong></div>
  </div>
  <div className="sd-explain">
   {same && <p><strong>Both shifted {dirName(dD)}, so quantity {dD > 0 ? 'rises' : 'falls'} for sure:</strong> both shifts push it the same way. Price is a tug of war: the demand shift pushes it {dD > 0 ? 'up' : 'down'} and the supply shift pushes it {dS > 0 ? 'down' : 'up'}. Here price {word(pDir)}, but change the sizes and it can go the other way.</p>}
   {opposite && <p><strong>Demand shifted {dirName(dD)} and supply {dirName(dS)}, so price {dD > 0 ? 'rises' : 'falls'} for sure:</strong> both shifts push it the same way. Quantity is the tug of war, and here it {word(qDir)}. Make one shift bigger and see it flip.</p>}
   {!dD && !dS && <p>Neither curve has moved yet. Use the sliders or pick an example.</p>}
   {!same && !opposite && (dD !== 0 || dS !== 0) && <p>Only one curve has moved, so both results are certain: price {word(pDir)} and quantity {word(qDir)}. Move the other slider too.</p>}
   <p className="sd-aside">When two curves shift, one of price or quantity is certain and the other depends on how big each shift is (and how steep the curves are). On a test, "can't tell without more information" is often the right answer for that one.</p>
  </div>
 </div>;
}
