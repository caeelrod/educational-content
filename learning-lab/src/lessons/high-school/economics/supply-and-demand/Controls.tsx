import { useState } from 'react';
import Chart, { Dot, Line, PriceLine } from './Chart';
import { D0, S0, boxes, equilibrium, money, pAt, qAt, sayMoney } from './market';

type Kind = 'ceiling' | 'floor';
type Result = 'shortage' | 'surplus' | 'none';
const E = equilibrium(D0, S0);
const scenarios: { kind: Kind; level: number; text: string }[] = [
 { kind: 'ceiling', level: 3, text: 'The town council caps strawberries at $3 a box so every family can afford them.' },
 { kind: 'ceiling', level: 5, text: 'Another town caps strawberries at $5 a box.' },
 { kind: 'floor', level: 5, text: 'To protect local farms, the state guarantees growers at least $5 a box.' },
 { kind: 'floor', level: 3, text: 'A different state guarantees growers at least $3 a box.' }
];
const resultName: Record<Result, string> = { shortage: 'A shortage', surplus: 'A surplus', none: 'No effect' };

// Price paid, quantities, and the surplus areas when the price is held at `price`.
function outcome(kind: Kind, level: number) {
 const binds = kind === 'ceiling' ? level < E.p : level > E.p;
 const price = binds ? level : E.p;
 const qd = qAt(D0, price), qs = qAt(S0, price), sold = Math.min(qd, qs);
 const result: Result = !binds ? 'none' : qd > qs ? 'shortage' : 'surplus';
 const pd = (q: number) => pAt(D0, q), ps = (q: number) => pAt(S0, q);
 // Areas between the curves and the price line, in thousands of dollars per week.
 // Consumer surplus assumes the boxes go to the buyers who value them most.
 const cs = (pd(0) + pd(sold)) / 2 * sold - price * sold;
 const ps_ = price * sold - (ps(0) + ps(sold)) / 2 * sold;
 const dwl = (pd(sold) - ps(sold)) * (E.q - sold) / 2;
 return { binds, price, qd, qs, sold, result, cs, prod: ps_, dwl, pd, ps };
}
const dollars = (v: number) => `$${Math.round(v * 1000).toLocaleString('en-US')}`;

export default function Controls() {
 const [kind, setKind] = useState<Kind>('ceiling');
 const [level, setLevel] = useState(3);
 const [scene, setScene] = useState<number | null>(0);
 const [guesses, setGuesses] = useState<Record<number, Result>>({});
 const [areas, setAreas] = useState(false);
 const o = outcome(kind, level);
 const free = outcome(kind, E.p);
 const hidden = scene !== null && guesses[scene] === undefined;
 const sc = scene !== null ? scenarios[scene] : null;

 function pickScene(k: number) { setScene(k); setKind(scenarios[k].kind); setLevel(scenarios[k].level); }
 function setFree(v: number) { setScene(null); setLevel(Math.round(Math.min(9, Math.max(0.5, v)) * 4) / 4); }

 const label = hidden ? 'Supply and demand for strawberries, before the price rule is shown.'
  : `A price ${kind} at ${money(level)}. ${o.binds ? `It binds: buyers want ${boxes(o.qd)}, growers bring ${boxes(o.qs)}, a ${o.result} of ${boxes(Math.abs(o.qd - o.qs))}.` : `It does not bind, because the market price ${money(E.p)} is already ${kind === 'ceiling' ? 'below' : 'above'} it.`}`;

 return <div className="sd-panel">
  <p>Sometimes a government decides the market price is too high or too low and sets a legal limit. A <strong>price ceiling</strong> is a legal <em>maximum</em>: sellers may not charge more. A <strong>price floor</strong> is a legal <em>minimum</em>: buyers may not pay less. Predict first, then see what the model says.</p>

  <div className="sd-chips" role="group" aria-label="Scenarios">
   {scenarios.map((s, k) => <button key={k} aria-pressed={scene === k} onClick={() => pickScene(k)}>{guesses[k] ? '✓ ' : ''}{s.kind === 'ceiling' ? 'Ceiling' : 'Floor'} {money(s.level)}</button>)}
   <button aria-pressed={scene === null} onClick={() => setScene(null)}>Set your own</button>
  </div>

  {sc && <div className="sd-event"><span className="sd-eyebrow">The market price is {money(E.p)}</span><p>{sc.text}</p></div>}
  {scene === null && <div className="sd-controls">
   <div><span className="sd-label">Rule</span>
    <div className="sd-seg" role="group" aria-label="Kind of rule">
     <button aria-pressed={kind === 'ceiling'} onClick={() => setKind('ceiling')}>Price ceiling (maximum)</button>
     <button aria-pressed={kind === 'floor'} onClick={() => setKind('floor')}>Price floor (minimum)</button>
    </div></div>
   <div className="sd-grow"><label className="sd-label" htmlFor="sd-lim">Legal {kind === 'ceiling' ? 'maximum' : 'minimum'}: <strong>{money(level)}</strong></label>
    <input id="sd-lim" type="range" min={0.5} max={9} step={0.25} value={level} aria-valuetext={sayMoney(level)} onChange={e => setFree(Number(e.target.value))} /></div>
  </div>}

  {hidden && scene !== null && <div className="sd-predict">
   <span>Predict: what happens in this market?</span>
   <div className="sd-row">{(['shortage', 'surplus', 'none'] as Result[]).map(r => <button key={r} onClick={() => setGuesses(g => ({ ...g, [scene]: r }))}>{resultName[r]}</button>)}</div>
  </div>}
  {!hidden && scene !== null && <p className={`sd-feedback ${guesses[scene] === o.result ? 'good' : 'bad'}`} aria-live="polite">
   {guesses[scene] === o.result ? 'Your prediction holds. ' : `You predicted ${resultName[guesses[scene]].toLowerCase()}. `}
   {o.result === 'none' ? `The market price of ${money(E.p)} is already ${kind === 'ceiling' ? 'under the maximum' : 'over the minimum'}, so this rule changes nothing.` : `${o.result === 'shortage' ? 'A shortage' : 'A surplus'} of ${boxes(Math.abs(o.qd - o.qs))}.`}
   {guesses[scene] !== o.result && o.result === 'none' && ` A ${kind} only matters when it is set on the "wrong" side of equilibrium: ${kind === 'ceiling' ? 'below' : 'above'} it.`}
   {guesses[scene] !== o.result && o.result !== 'none' && (kind === 'ceiling' ? ' Holding the price down makes more buyers want boxes and fewer growers bring them.' : ' Holding the price up makes growers bring more boxes and buyers want fewer.')}
  </p>}

  <Chart label={label} onPrice={scene === null ? setFree : undefined} caption={scene === null ? 'Tap or drag on the chart to move the legal limit.' : undefined}>
   {s => <>
    {!hidden && areas && <>
     <polygon className="sd-area cs" points={[[0, o.pd(0)], [o.sold, o.pd(o.sold)], [o.sold, o.price], [0, o.price]].map(([q, p]) => `${s.x(q)},${s.y(p)}`).join(' ')} />
     <polygon className="sd-area ps" points={[[0, o.price], [o.sold, o.price], [o.sold, o.ps(o.sold)], [0, o.ps(0)]].map(([q, p]) => `${s.x(q)},${s.y(p)}`).join(' ')} />
     {o.binds && <polygon className="sd-area dwl" points={[[o.sold, o.pd(o.sold)], [E.q, E.p], [o.sold, o.ps(o.sold)]].map(([q, p]) => `${s.x(q)},${s.y(p)}`).join(' ')} />}
    </>}
    <Line s={s} c={D0} kind="d" name="Demand" />
    <Line s={s} c={S0} kind="s" name="Supply" />
    {!hidden && <PriceLine s={s} p={level} cls={`control ${o.binds ? '' : 'loose'}`} qd={o.binds ? o.qd : undefined} qs={o.binds ? o.qs : undefined} label={`${kind} ${money(level)}`} />}
    <Dot s={s} q={E.q} p={E.p} cls={!hidden && o.binds ? 'old' : 'eq'} label={`market ${money(E.p)}`} side="right" />
    {!hidden && o.binds && <Dot s={s} q={o.sold} p={o.price} cls="sold" guides />}
   </>}
  </Chart>

  {!hidden && <>
   <div className="sd-readout" aria-live="polite">
    <div><span>Price paid</span><strong>{money(o.price)}</strong></div>
    <div><span>Quantity demanded</span><strong>{boxes(o.qd)}</strong></div>
    <div><span>Quantity supplied</span><strong>{boxes(o.qs)}</strong></div>
    <div className={o.result === 'none' ? 'ok' : o.result}><span>{o.result === 'surplus' ? 'Surplus' : o.result === 'shortage' ? 'Shortage' : 'Shortage or surplus'}</span><strong>{o.result === 'none' ? 'None' : boxes(Math.abs(o.qd - o.qs))}</strong></div>
    <div><span>Boxes actually sold</span><strong>{boxes(o.sold)}</strong></div>
   </div>

   <div className="sd-explain">
    {o.result === 'shortage' && <p><strong>A binding ceiling causes a shortage.</strong> At {money(level)}, buyers want {boxes(o.qd)} but growers bring only {boxes(o.qs)}. The price isn't allowed to rise and close the gap, so something else decides who gets a box: showing up early, waiting in line, knowing the grower, or paying extra under the table. Growers may also cut back on quality. Notice the surprise: <em>fewer</em> boxes change hands than at the market price ({boxes(o.sold)} instead of {boxes(E.q)}). Buyers who still get a box are better off; growers and the buyers who go without are worse off.</p>}
    {o.result === 'surplus' && <p><strong>A binding floor causes a surplus.</strong> At {money(level)}, growers bring {boxes(o.qs)} but buyers want only {boxes(o.qd)}. The price isn't allowed to fall and clear the leftovers, so boxes go unsold unless someone else buys them. In real farm price-support programs the government often buys the surplus, which taxpayers pay for. Again <em>fewer</em> boxes are bought than at the market price ({boxes(o.sold)} instead of {boxes(E.q)}). Growers who still sell get more per box; buyers pay more.</p>}
    {o.result === 'none' && <p><strong>This {kind} doesn't bind.</strong> A {kind === 'ceiling' ? 'ceiling is a maximum' : 'floor is a minimum'}, and the market price of {money(E.p)} is already {kind === 'ceiling' ? 'below' : 'above'} {money(level)}, so the market ends up exactly where it would without the rule. Try {kind === 'ceiling' ? 'lowering it below' : 'raising it above'} {money(E.p)}.</p>}
    <p className="sd-aside">Rent control is a well-known price ceiling, and the minimum wage is a well-known price floor. Real housing and job markets are more complicated than one pair of straight lines, and economists study and debate how large these effects are in practice.</p>
   </div>

   <label className="sd-toggle"><input type="checkbox" checked={areas} onChange={e => setAreas(e.target.checked)} /> Go further: show who gains and who loses</label>
   {areas && <div className="sd-extension">
    <p><strong>Consumer surplus</strong> (<span className="sd-key cs">blue area</span>) adds up, over every box bought, how much more the buyer would have paid than they did. <strong>Producer surplus</strong> (<span className="sd-key ps">orange area</span>) adds up how much more each grower got than their cost. {o.binds && <><strong>Deadweight loss</strong> (<span className="sd-key dwl">gray triangle</span>) is the value of the trades that would have happened at the market price but now don't: boxes some buyer valued more than they cost to grow.</>}</p>
    <div className="sd-readout">
     <div><span>Consumer surplus</span><strong>{dollars(o.cs)}</strong><small>{o.binds ? `${dollars(free.cs)} without the rule` : 'per week'}</small></div>
     <div><span>Producer surplus</span><strong>{dollars(o.prod)}</strong><small>{o.binds ? `${dollars(free.prod)} without the rule` : 'per week'}</small></div>
     <div><span>Deadweight loss</span><strong>{dollars(o.binds ? o.dwl : 0)}</strong><small>per week</small></div>
    </div>
    <p className="sd-aside">{kind === 'ceiling' && o.binds ? 'This picture assumes the scarce boxes go to the buyers who value them most. When they go to whoever waits in line longest instead, buyers do worse than the blue area shows, and time spent waiting is a cost too.' : 'Areas are measured from the straight-line model curves, in dollars per week.'}</p>
   </div>}
  </>}
 </div>;
}
