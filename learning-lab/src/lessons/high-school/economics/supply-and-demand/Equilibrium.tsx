import { useEffect, useRef, useState } from 'react';
import Chart, { Dot, Line, PriceLine } from './Chart';
import { D0, S0, boxes, equilibrium, money, qAt, reducedMotion, sayMoney } from './market';

const E = equilibrium(D0, S0);
const starts = [2, 3, 5.5, 7.5];
type Guess = 'up' | 'down' | null;

export default function Equilibrium() {
 const [p, setP] = useState(2);
 const [guess, setGuess] = useState<Guess>(null);
 const [from, setFrom] = useState<number | null>(null);
 const [found, setFound] = useState(false);
 const [running, setRunning] = useState(false);
 const timer = useRef<number>(undefined);
 const qd = qAt(D0, p), qs = qAt(S0, p), gap = qd - qs;
 const at = Math.abs(p - E.p) < 0.005;
 const state = at ? 'eq' : gap > 0 ? 'short' : 'surplus';

 useEffect(() => { if (at) setFound(true); }, [at]);
 useEffect(() => () => window.clearInterval(timer.current), []);

 const set = (v: number) => { stop(); setP(Math.round(Math.min(9, Math.max(0.5, v)) * 4) / 4); setGuess(null); setFrom(null); };
 function stop() { window.clearInterval(timer.current); setRunning(false); }
 // Each tick closes 30% of the distance to equilibrium. Real prices move by haggling, sales,
 // and sold-out signs, not by a formula; the animation only shows the direction of the pressure.
 function adjust() {
  setFrom(p);
  if (reducedMotion()) { setP(E.p); return; }
  setRunning(true);
  timer.current = window.setInterval(() => setP(v => v + 0.3 * (E.p - v)), 320);
 }
 useEffect(() => { if (running && Math.abs(p - E.p) < 0.02) { stop(); setP(E.p); } }, [p, running]);

 const guessRight = from !== null && guess === (from < E.p ? 'up' : 'down');

 return <div className="sd-panel">
  <p>Now the whole town. The smooth curves below are this week's strawberry market. Pick a price by dragging the slider or tapping the chart. At each price, read off how many boxes buyers want (<span className="sd-key d">demand</span>) and how many growers bring (<span className="sd-key s">supply</span>).</p>
  <div className="sd-controls">
   <div className="sd-grow">
    <label className="sd-label" htmlFor="sd-p2">Price: <strong>{money(p)}</strong> a box</label>
    <input id="sd-p2" type="range" min={0.5} max={9} step={0.25} value={p} aria-valuetext={sayMoney(p)} onChange={e => set(Number(e.target.value))} />
    <div className="sd-chips" role="group" aria-label="Starting prices">{starts.map(v => <button key={v} aria-pressed={p === v} onClick={() => set(v)}>Start at {money(v)}</button>)}</div>
   </div>
  </div>

  <Chart onPrice={set} label={`Supply and demand for strawberries. At ${money(p)}, buyers want ${boxes(qd)} and growers bring ${boxes(qs)}.${found ? ` Equilibrium is ${money(E.p)} and ${boxes(E.q)}.` : ''}`}
   caption={<>Tap or drag on the chart to set the price. The bar shows the {state === 'short' ? 'shortage' : state === 'surplus' ? 'surplus' : 'gap'} at that price.</>}>
   {s => <>
    <Line s={s} c={D0} kind="d" name="Demand" />
    <Line s={s} c={S0} kind="s" name="Supply" />
    <PriceLine s={s} p={p} qd={qd} qs={qs} label={money(p)} />
    <Dot s={s} q={qd} p={p} cls="d small" />
    <Dot s={s} q={qs} p={p} cls="s small" />
    {found && <Dot s={s} q={E.q} p={E.p} cls="eq" guides label="equilibrium" side={s.narrow ? 'left' : 'right'} />}
   </>}
  </Chart>

  <div className="sd-readout" aria-live="polite">
   <div><span>Quantity demanded</span><strong>{boxes(qd)}</strong></div>
   <div><span>Quantity supplied</span><strong>{boxes(qs)}</strong></div>
   <div className={state === 'eq' ? 'ok' : state}><span>{state === 'short' ? 'Shortage' : state === 'surplus' ? 'Surplus' : 'Shortage or surplus'}</span><strong>{state === 'eq' ? 'None' : boxes(Math.abs(gap))}</strong></div>
   <div><span>Boxes actually sold</span><strong>{boxes(Math.min(qd, qs))}</strong></div>
  </div>

  {!at && !running && from === null && <div className="sd-predict">
   <span>Predict: if nobody sets the price, which way will it move from {money(p)}?</span>
   <div className="sd-row">
    <button aria-pressed={guess === 'up'} onClick={() => setGuess('up')}>Up</button>
    <button aria-pressed={guess === 'down'} onClick={() => setGuess('down')}>Down</button>
    <button className="sd-primary" disabled={!guess} onClick={adjust}>Let the market adjust</button>
   </div>
  </div>}
  {from !== null && guess && !running && <p className={`sd-feedback ${guessRight ? 'good' : 'bad'}`}>
   {guessRight ? 'Your prediction holds. ' : 'Not what you predicted. '}
   {from < E.p ? `At ${money(from)} there was a shortage, so the price was pushed up.` : `At ${money(from)} there was a surplus, so the price was pushed down.`} It stopped at {money(E.p)}, where there is no shortage and no surplus left to push it.
  </p>}

  <div className="sd-explain" aria-live="polite">
   {state === 'short' && <p><strong>Shortage: price gets pushed up.</strong> At {money(p)} buyers want {boxes(qd)} but growers bring only {boxes(qs)}. Boxes sell out by mid-morning. Buyers who missed out would pay more, and growers notice they could charge more and still sell everything. Each step up in price makes some buyers drop out <em>and</em> pulls in more boxes, so the shortage shrinks.</p>}
   {state === 'surplus' && <p><strong>Surplus: price gets pushed down.</strong> At {money(p)} growers bring {boxes(qs)} but buyers want only {boxes(qd)}. Unsold strawberries start to spoil, so growers cut prices to move them. Each step down brings in more buyers <em>and</em> makes some growers stop picking, so the surplus shrinks.</p>}
   {state === 'eq' && <p><strong>Equilibrium: {money(E.p)} a box, {boxes(E.q)} a week.</strong> Quantity demanded equals quantity supplied, so there is no shortage to push the price up and no surplus to push it down. Nobody in town sets this price. It is where buyers' and sellers' choices balance.</p>}
  </div>

  {found && <div className="sd-takeaway">
   <p><strong>What equilibrium does not mean</strong></p>
   <ul>
    <li><strong>Not "everyone gets strawberries."</strong> Buyers who value a box at less than {money(E.p)} don't buy, and growers whose costs are above {money(E.p)} don't sell. Equilibrium means everyone <em>willing</em> to trade at that price can.</li>
    <li><strong>Not "fair" or "the best price."</strong> It describes what a market tends to do. Whether that outcome is good is a separate question people can disagree about.</li>
    <li><strong>Not fixed forever.</strong> When something changes buyers' or growers' plans, the curves move and so does the equilibrium. That's part 3.</li>
   </ul>
  </div>}
  <p className="sd-aside">Model: straight-line curves, one kind of box, and a price everyone can see. Quantity demanded = 18,000 − 2,000 × price and quantity supplied = 3,000 × price − 2,000, made up for this lesson.</p>
 </div>;
}
