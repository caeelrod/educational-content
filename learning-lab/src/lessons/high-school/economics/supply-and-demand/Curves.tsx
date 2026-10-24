import { useState } from 'react';
import Chart, { PriceLine, type Scale } from './Chart';
import { money, sayMoney } from './market';

// Twelve buyers and twelve growers at a small farm stand. Each card is one box of strawberries.
// A buyer's number is the most they would pay for that box; a grower's is the least they would
// accept to pick, pack, and bring it. The two lists are set up so they match at $5 (7 boxes).
const buyers = [
 { top: 9.5, who: 'Bakery planning a strawberry shortcake special' },
 { top: 8.5, who: 'Smoothie stand that sells out every weekend' },
 { top: 8, who: 'Family baking a birthday cake' },
 { top: 7, who: 'Jam maker' },
 { top: 6.5, who: 'Café that tops its waffles with them' },
 { top: 6, who: 'Bakery again, for a second box' },
 { top: 5, who: 'Family of five, weekly fruit' },
 { top: 4.5, who: 'Student who likes apples almost as much' },
 { top: 4, who: 'Restaurant that could use frozen berries instead' },
 { top: 3, who: 'Shopper who only buys on sale' },
 { top: 2, who: 'Neighbor who would try them if they were cheap' },
 { top: 1.5, who: 'Party host who could skip the fruit salad' }
];
const growers = [
 { top: 1, who: 'Big farm just outside town' },
 { top: 1.5, who: 'Farm with a picking machine' },
 { top: 2.5, who: 'Family farm; the family does the picking' },
 { top: 3, who: 'Farm with a longer drive to town' },
 { top: 3.5, who: 'Farm that pays a crew to pick' },
 { top: 4, who: 'Big farm again, picking its slower rows' },
 { top: 5, who: 'Small farm that rents its land' },
 { top: 5.5, who: 'Farm two hours away with a refrigerated truck' },
 { top: 6.5, who: 'Greenhouse that has to be heated' },
 { top: 7, who: 'Grower who could pick blueberries instead' },
 { top: 8, who: 'Farm with hard-to-reach last rows' },
 { top: 9, who: 'Gardener who would rather eat them' }
];
const N = buyers.length;
const P_TOP = 10;
const EQ = 5;

type View = 'buyers' | 'growers' | 'both';

// A staircase: one step per card, a box wide, at that card's price.
function stairs(s: Scale, tops: number[], end: number) {
 let d = `M${s.x(0)},${s.y(tops[0])}`;
 tops.forEach((t, k) => { d += ` V${s.y(t)} H${s.x(k + 1)}`; });
 return d + ` V${s.y(end)}`;
}

const checks: Record<View, { q: string; options: { text: string; right?: boolean; why: string }[] }> = {
 buyers: { q: 'Suppose the price goes up from $4 to $7. How many boxes do buyers stop buying?', options: [
  { text: '2', why: 'Count again: every buyer whose top price is at least $4 but below $7 drops out.' },
  { text: '3', why: 'Count again: every buyer whose top price is at least $4 but below $7 drops out.' },
  { text: '5', right: true, why: 'Five boxes: the ones worth $4, $4.50, $5, $6, and $6.50 to their buyers. Nobody changed their mind about strawberries. The higher price just passed their limit.' },
  { text: 'None, they still want strawberries', why: 'They still like strawberries, but at $7 the box costs more than it is worth to them, so they spend the money on something else.' }
 ] },
 growers: { q: 'Why does the supply staircase climb up to the right?', options: [
  { text: 'A higher price covers the costs of more growers', right: true, why: 'Right. Each grower sells once the price reaches their cost. The cheapest boxes come first; a higher price pulls in growers with higher costs, like the greenhouse and the far-away farm.' },
  { text: 'Growers want to sell more so they raise the price', why: 'Here the price is what you set with the slider. The staircase answers a different question: at this price, how many boxes are worth bringing?' },
  { text: 'More expensive strawberries are better strawberries', why: 'Every box here is the same. What differs is what it costs each grower to bring one more box.' }
 ] },
 both: { q: 'Move the price until the boxes buyers want equal the boxes growers bring. What price is it?', options: [] }
};

export default function Curves() {
 const [view, setView] = useState<View>('buyers');
 const [p, setP] = useState(3);
 const [focus, setFocus] = useState<{ side: 'b' | 'g'; k: number } | null>(null);
 const [answer, setAnswer] = useState<Partial<Record<View, number>>>({});
 const qd = buyers.filter(b => b.top >= p).length;
 const qs = growers.filter(g => g.top <= p).length;
 const showB = view !== 'growers', showG = view !== 'buyers';
 const matched = view === 'both' && p === EQ;
 const set = (v: number) => setP(Math.min(P_TOP, Math.max(0.5, Math.round(v * 2) / 2)));
 const check = checks[view];
 const picked = answer[view];

 return <div className="sd-panel">
  <p>Before there are curves, there are people. Here are twelve buyers and twelve growers at a small farm stand. Each card is one box of strawberries. A buyer's number is the <strong>most they would pay</strong> for that box. A grower's number is the <strong>least they would accept</strong> to pick it, pack it, and bring it: what it costs them, including what else they could do with that time and land. (The people and numbers are made up for this lesson.)</p>
  <div className="sd-seg" role="group" aria-label="Who to show">
   <button aria-pressed={view === 'buyers'} onClick={() => setView('buyers')}>1. Buyers</button>
   <button aria-pressed={view === 'growers'} onClick={() => setView('growers')}>2. Growers</button>
   <button aria-pressed={view === 'both'} onClick={() => setView('both')}>3. Both together</button>
  </div>

  <div className="sd-controls">
   <div className="sd-grow">
    <label className="sd-label" htmlFor="sd-p1">Price of a box: <strong>{money(p)}</strong></label>
    <input id="sd-p1" type="range" min={0.5} max={P_TOP} step={0.5} value={p} aria-valuetext={sayMoney(p)} onChange={e => set(Number(e.target.value))} />
   </div>
  </div>

  <div className="sd-two">
   <Chart qMax={N} pMax={P_TOP} qStep={2} qTitle="Boxes" onPrice={set} compact
    label={`Staircase chart. At ${money(p)}, ${showB ? `buyers want ${qd} boxes` : ''}${showB && showG ? ' and ' : ''}${showG ? `growers bring ${qs} boxes` : ''}.`}
    caption={view === 'buyers' ? 'Each step is one buyer’s top price. Darker steps are boxes bought at this price.' : view === 'growers' ? 'Each step is one grower’s cost. Darker steps are boxes brought at this price.' : 'Demand (blue) and supply (orange) staircases.'}>
    {s => <>
     {showB && <path className="sd-stair d faint" d={stairs(s, buyers.map(b => b.top), 0)} />}
     {showB && qd > 0 && <path className="sd-stair d" d={stairs(s, buyers.slice(0, qd).map(b => b.top), buyers[qd - 1].top)} />}
     {showG && <path className="sd-stair s faint" d={stairs(s, growers.map(g => g.top), P_TOP)} />}
     {showG && qs > 0 && <path className="sd-stair s" d={stairs(s, growers.slice(0, qs).map(g => g.top), growers[qs - 1].top)} />}
     {focus && (focus.side === 'b' ? showB : showG) && <rect className={`sd-stair-focus ${focus.side === 'b' ? 'd' : 's'}`} x={s.x(focus.k)} width={s.x(1) - s.x(0)}
      y={s.y((focus.side === 'b' ? buyers : growers)[focus.k].top) - 3} height={6} rx={3} />}
     <PriceLine s={s} p={p} qd={view === 'both' ? qd : undefined} qs={view === 'both' ? qs : undefined} label={money(p)} />
     {showB && <text className="sd-curve-label d" x={s.x(N) - 4} y={s.y(1)} textAnchor="end">demand</text>}
     {showG && <text className="sd-curve-label s" x={s.x(N) - 4} y={s.y(9.6)} textAnchor="end">supply</text>}
    </>}
   </Chart>

   <div className="sd-side">
    <div className="sd-readout" aria-live="polite">
     {showB && <div><span>Boxes buyers want</span><strong>{qd}</strong></div>}
     {showG && <div><span>Boxes growers bring</span><strong>{qs}</strong></div>}
     {view === 'both' && <div><span>{qd > qs ? 'Short by' : qd < qs ? 'Left over' : 'Match'}</span><strong>{qd === qs ? '✓' : Math.abs(qd - qs)}</strong></div>}
    </div>
    {view === 'buyers' && <p><strong>The law of demand.</strong> Raise the price and watch buyers drop out one by one, starting with those who value a box least. A buyer who wants several boxes shows up more than once (the bakery), and each extra box is worth a bit less to them. Either way, <em>a higher price means fewer boxes demanded</em>.</p>}
    {view === 'growers' && <p><strong>The law of supply.</strong> Growers with low costs will sell even at a low price. As the price climbs it becomes worth it for the heated greenhouse and the far-away farm to bring boxes too. So <em>a higher price means more boxes supplied</em>.</p>}
    {view === 'both' && !matched && <p>{qd > qs ? <>At {money(p)}, {qd} boxes are wanted but only {qs} are brought. Some buyers who would happily pay more go home empty-handed.</> : qd < qs ? <>At {money(p)}, growers bring {qs} boxes but buyers want only {qd}. Boxes are left over at the end of the day.</> : <>At {money(p)} the counts match, but try nearby prices: is this the only one?</>}</p>}
    {matched && <div className="sd-takeaway"><p><strong>$5 is the price where they match: 7 boxes.</strong> Every buyer willing to pay $5 gets a box, and every grower whose cost is $5 or less sells one. No other price does both. This is the <strong>equilibrium</strong>, and part 2 shows how a market finds it without anyone calculating it.</p></div>}
   </div>
  </div>

  {check.options.length > 0 && <div className="sd-check">
   <p className="sd-label">{check.q}</p>
   <div className="sd-row">{check.options.map((o, k) => <button key={k} aria-pressed={picked === k} onClick={() => setAnswer(a => ({ ...a, [view]: k }))}>{o.text}</button>)}</div>
   <div aria-live="polite">{picked !== undefined && <p className={`sd-feedback ${check.options[picked].right ? 'good' : 'bad'}`}>{check.options[picked].why}</p>}</div>
  </div>}
  {view === 'both' && !matched && <p className="sd-check sd-label">{check.q}</p>}

  <div className={`sd-cards ${view}`}>
   {showB && <div>
    <h3>Buyers <span className="sd-aside">most they would pay</span></h3>
    <ul className="sd-people">{buyers.map((b, k) => { const yes = b.top >= p; return <li key={k} className={yes ? 'yes d' : 'no'} tabIndex={0}
     onMouseEnter={() => setFocus({ side: 'b', k })} onFocus={() => setFocus({ side: 'b', k })} onMouseLeave={() => setFocus(null)} onBlur={() => setFocus(null)}>
     <strong>{money(b.top)}</strong><span>{b.who}</span><em>{yes ? 'buys' : 'too pricey'}</em></li>; })}</ul>
   </div>}
   {showG && <div>
    <h3>Growers <span className="sd-aside">least they would accept</span></h3>
    <ul className="sd-people">{growers.map((g, k) => { const yes = g.top <= p; return <li key={k} className={yes ? 'yes s' : 'no'} tabIndex={0}
     onMouseEnter={() => setFocus({ side: 'g', k })} onFocus={() => setFocus({ side: 'g', k })} onMouseLeave={() => setFocus(null)} onBlur={() => setFocus(null)}>
     <strong>{money(g.top)}</strong><span>{g.who}</span><em>{yes ? 'sells' : 'not worth it'}</em></li>; })}</ul>
   </div>}
  </div>

  <div className="sd-takeaway">
   <p><strong>From staircases to curves.</strong> A whole town has thousands of buyers and growers, so each step becomes tiny and the staircases blur into smooth lines: the <strong>demand curve</strong> and the <strong>supply curve</strong>. Every point on the demand curve answers "how much would buyers take at this price?", and every point on the supply curve answers "how much would sellers bring?"</p>
   <Smooth />
  </div>
 </div>;
}

// Small picture: the same demand line drawn as 6, 24, and 96 steps.
function Smooth() {
 const W = 300, H = 110, pad = 8;
 const draw = (n: number, ox: number) => {
  const w = (W / 3 - 2 * pad), h = H - 2 * pad - 18;
  let d = `M${ox + pad},${pad}`;
  for (let k = 0; k < n; k++) { const top = 1 - (k + 0.5) / n; d += ` V${pad + (1 - top) * h} H${ox + pad + (k + 1) / n * w}`; }
  return <g key={n}><path className="sd-stair d" d={d + ` V${pad + h}`} /><text className="sd-tick-text" x={ox + W / 6} y={H - 4} textAnchor="middle">{n} buyers</text></g>;
 };
 return <svg className="sd-smooth" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The same demand drawn with 6, 24, and 96 buyers. With more buyers the staircase looks like a straight line.">
  {[6, 24, 96].map((n, i) => draw(n, i * W / 3))}
 </svg>;
}
