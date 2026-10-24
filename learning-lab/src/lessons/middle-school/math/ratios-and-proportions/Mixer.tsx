import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bucket, Cans, ShareBar, simplest } from './Paint';
import { pct } from './ratio';

type Pair = [number, number];
type Verdict = { ok: boolean; body: ReactNode };
type Match = { kind: 'match'; title: string; prompt: ReactNode; target: Pair; targetLabel: string; check: (b: number, y: number) => Verdict; after: ReactNode };
type Predict = { kind: 'predict'; title: string; prompt: ReactNode; a: Pair; b?: Pair; names?: [string, string]; options: { id: string; label: ReactNode }[]; answer: string; wrong: Record<string, ReactNode>; after: ReactNode; fix?: Pair };
type Mission = Match | Predict;

const MAX = 15;
const same = (b: number, y: number, [tb, ty]: Pair) => b + y > 0 && b * ty === y * tb;
const share = ([b, y]: Pair) => b / (b + y);
const recipe = ([b, y]: Pair) => `${b} blue : ${y} yellow`;

// Feedback for a mix that is the wrong color, worded around which paint there is too much of.
function offBy(b: number, y: number, t: Pair): ReactNode {
 if (b + y === 0) return <>The bucket is empty. Add some cans with the + buttons.</>;
 if (b === 0) return <>There's no blue yet, so it's plain yellow.</>;
 if (y === 0) return <>There's no yellow yet, so it's plain blue.</>;
 const blueish = share([b, y]) > share(t);
 return <>Not quite: your mix is <strong>{blueish ? 'too blue' : 'too yellow'}</strong>. Look at the blue-share bar: the line shows where the target is. You have {b} blue for {y} yellow, but the recipe has {t[0]} blue for every {t[1]} yellow.</>;
}

const missions: Mission[] = [
 { kind: 'match', title: 'Match the swatch', target: [1, 2], targetLabel: 'Recipe: 1 blue : 2 yellow',
  prompt: <>A ratio compares two amounts. This green is made with <strong>1 can of blue for every 2 cans of yellow</strong>. Use the + and − buttons to mix it, then check.</>,
  check: (b, y) => same(b, y, [1, 2]) ? { ok: true, body: <>That's the color. Your mix has {b} blue : {y} yellow, and {y} is twice {b}, just like 1 : 2.</> } : { ok: false, body: offBy(b, y, [1, 2]) },
  after: <>Any mix where yellow is <strong>twice</strong> blue makes this green: 1 : 2, 2 : 4, 3 : 6, 5 : 10. Ratios that describe the same mix are called <strong>equivalent ratios</strong>.</> },
 { kind: 'match', title: 'Make a bigger batch', target: [1, 2], targetLabel: 'Recipe: 1 blue : 2 yellow',
  prompt: <>You need more of the same green. Make it using <strong>exactly 4 cans of blue</strong>.</>,
  check: (b, y) => {
   if (b === 4 && y === 8) return { ok: true, body: <>Yes: 4 is 1 × 4, so you need 2 × 4 = 8 yellow. Multiplying <em>both</em> parts by the same number keeps the color.</> };
   if (b === 4 && y === 5) return { ok: false, body: <>You added 3 more cans to <em>each</em> color (1 + 3 = 4 and 2 + 3 = 5). Look at the color: it's bluer. Adding the same amount to both parts changes the mix. How many times bigger is 4 than 1? Do the same to the yellow.</> };
   if (b !== 4 && same(b, y, [1, 2])) return { ok: false, body: <>Right color, but use exactly 4 cans of blue.</> };
   if (b !== 4) return { ok: false, body: <>Set blue to 4 cans first, then figure out the yellow.</> };
   return { ok: false, body: offBy(b, y, [1, 2]) };
  },
  after: <>Look at the cans: the batch is just <strong>4 copies</strong> of the 1 : 2 recipe. That's why the color is the same. Each copy has 1 blue and 2 yellow.</> },
 { kind: 'predict', title: 'Sam’s shortcut', a: [2, 3], b: [4, 5], names: ['Sam’s first batch', 'After adding 2 of each'],
  prompt: <>Sam mixed <strong>2 blue : 3 yellow</strong>. He wants more, so he pours in 2 more cans of each color and gets <strong>4 blue : 5 yellow</strong>. Will the color stay the same?</>,
  options: [{ id: 'same', label: 'Same color' }, { id: 'blue', label: 'Bluer' }, { id: 'yellow', label: 'More yellow' }], answer: 'blue',
  wrong: { same: <>It looks close, but it's not the same. Check the blue share: it went from {pct(2 / 5)} to {pct(4 / 9)}.</>, yellow: <>Check the blue share: it went <em>up</em>, from {pct(2 / 5)} to {pct(4 / 9)}. The new mix is bluer.</> },
  after: <>Adding 2 to each part doesn't keep the ratio. Blue went from 2 to 4 (doubled), but yellow only went from 3 to 5. To keep the color, Sam should <strong>double both</strong>: 4 blue : 6 yellow.</>, fix: [4, 6] },
 { kind: 'match', title: 'Fewest cans', target: [6, 4], targetLabel: 'Recipe: 6 blue : 4 yellow',
  prompt: <>This swatch was made with 6 blue : 4 yellow. Make the <strong>same color with as few cans as possible</strong>.</>,
  check: (b, y) => {
   if (b === 3 && y === 2) return { ok: true, body: <>Right: 6 : 4 is two copies of 3 : 2. You divided both parts by 2. A ratio that can't be divided down any further is in <strong>simplest form</strong>.</> };
   if (same(b, y, [6, 4])) return { ok: false, body: <>Same color! But you can use fewer cans. What number divides both {b} and {y}?</> };
   if (b === 4 && y === 2) return { ok: false, body: <>You took 2 away from each part. That changes the mix: 4 : 2 has twice as much blue as yellow, but 6 : 4 doesn't. Divide both parts by the same number instead.</> };
   return { ok: false, body: offBy(b, y, [6, 4]) };
  },
  after: <>6 : 4, 3 : 2, 9 : 6, and 12 : 8 are all equivalent. 3 : 2 is the simplest form, because 3 and 2 have no common factor except 1.</> },
 { kind: 'predict', title: 'Which is bluer?', a: [3, 4], b: [5, 8], names: ['Mix A', 'Mix B'],
  prompt: <>Mix A is <strong>3 blue : 4 yellow</strong>. Mix B is <strong>5 blue : 8 yellow</strong>. Which one is bluer?</>,
  options: [{ id: 'a', label: 'Mix A' }, { id: 'b', label: 'Mix B' }, { id: 'same', label: 'Same color' }], answer: 'a',
  wrong: { b: <>Mix B has more blue cans (5), but it has a lot more yellow too. More of something doesn't mean a bigger share of it.</>, same: <>They're close, but not equal. Try making the blue the same in both.</> },
  after: <>One way to compare: make the blue the same. Multiply A by 5 and B by 3: A is <strong>15 : 20</strong> and B is <strong>15 : 24</strong>. Same blue, but B has more yellow, so A is bluer. Blue share: A is {pct(3 / 7)}, B is {pct(5 / 13)}.</> },
 { kind: 'predict', title: 'Does order matter?', a: [2, 5], b: [5, 2], names: ['2 blue : 5 yellow', '5 blue : 2 yellow'],
  prompt: <>Is <strong>2 : 5</strong> the same mix as <strong>5 : 2</strong>? Both use 2 cans of one color and 5 of the other.</>,
  options: [{ id: 'yes', label: 'Same mix' }, { id: 'no', label: 'Different mix' }], answer: 'no',
  wrong: { yes: <>Look at the buckets: one is mostly yellow and one is mostly blue. The order in a ratio tells you which amount goes with which thing.</> },
  after: <>Order matters. "Blue to yellow is 2 : 5" means 2 blue for every 5 yellow. Always check which quantity comes first.</> },
 { kind: 'predict', title: 'Part of the whole', a: [2, 3], names: ['2 blue : 3 yellow', ''],
  prompt: <>In a <strong>2 blue : 3 yellow</strong> mix, what fraction of all the paint is blue?</>,
  options: [{ id: '2/3', label: '2/3' }, { id: '2/5', label: '2/5' }, { id: '3/5', label: '3/5' }], answer: '2/5',
  wrong: { '2/3': <>2/3 compares blue to <em>yellow</em>. The question asks about blue out of <em>all</em> the paint. Count every can.</>, '3/5': <>3/5 is the yellow part. Which cans are blue?</> },
  after: <>Each copy of the recipe has 2 + 3 = <strong>5 cans</strong>, and 2 of them are blue, so blue is 2/5 of the paint. The ratio 2 : 3 compares <em>part to part</em>; the fraction 2/5 compares <em>part to whole</em>.</> },
 { kind: 'match', title: 'Fill the order', target: [2, 3], targetLabel: 'Recipe: 2 blue : 3 yellow',
  prompt: <>A customer wants <strong>15 cans in all</strong> of the 2 blue : 3 yellow green. How many of each?</>,
  check: (b, y) => {
   if (b === 6 && y === 9) return { ok: true, body: <>Yes. Each copy of the recipe is 5 cans, and 15 ÷ 5 = 3 copies: 3 × 2 = 6 blue and 3 × 3 = 9 yellow.</> };
   if (same(b, y, [2, 3])) return { ok: false, body: <>Right color, but that's {b + y} cans. You need 15 in all.</> };
   if (b + y === 15) return { ok: false, body: <>That's 15 cans, but the color is off. Each copy of 2 : 3 has 5 cans. How many copies make 15?</> };
   return { ok: false, body: offBy(b, y, [2, 3]) };
  },
  after: <>Thinking in groups works for any total: the recipe is a group of 5 cans, so 15 cans is 3 groups. That idea comes back in practice.</> }
];

export default function Mixer() {
 const [k, setK] = useState(0);
 const [blue, setBlue] = useState(0);
 const [yellow, setYellow] = useState(0);
 const [verdict, setVerdict] = useState<Verdict | null>(null);
 const [choice, setChoice] = useState<string | null>(null);
 const [done, setDone] = useState(false);
 const nextRef = useRef<HTMLButtonElement>(null);
 const m = missions[k];
 const solved = m.kind === 'match' ? !!verdict?.ok : choice === m.answer;
 const touched = useRef(false);

 useEffect(() => { if (solved && touched.current) nextRef.current?.focus({ preventScroll: true }); }, [solved]);

 function go(i: number) {
  touched.current = true;
  setK(i); setVerdict(null); setChoice(null); setDone(false);
  const nm = missions[i];
  if (nm.kind === 'match') { setBlue(nm.title === 'Make a bigger batch' ? 4 : 0); setYellow(0); }
 }
 function step(color: 'b' | 'y', d: number) {
  const set = color === 'b' ? setBlue : setYellow;
  set(v => Math.max(0, Math.min(MAX, v + d)));
  setVerdict(v => v?.ok ? v : null);
 }

 if (done) return <div className="rp-panel">
  <h3>Paint shop complete</h3>
  <ul className="rp-big-ideas">
   <li><strong>Equivalent ratios make the same mix.</strong> Multiply or divide both parts by the same number: 1 : 2 = 4 : 8.</li>
   <li><strong>Adding the same amount to both parts changes the mix.</strong> 2 : 3 is not the same as 4 : 5.</li>
   <li><strong>Order matters.</strong> 2 : 5 and 5 : 2 are different.</li>
   <li><strong>Part to part vs part to whole.</strong> In 2 : 3, blue is 2/5 of the paint.</li>
  </ul>
  <div className="rp-row"><button onClick={() => go(0)}>Start the missions again</button></div>
 </div>;

 const [sb, sy] = simplest(blue, yellow);

 return <div className="rp-panel">
  <div className="rp-progress" aria-label={`Mission ${k + 1} of ${missions.length}`}>
   {missions.map((_, i) => <span key={i} className={i < k ? 'done' : i === k ? 'now' : ''} />)}
  </div>
  <p className="rp-eyebrow">Mission {k + 1} of {missions.length} · {m.title}</p>
  <p className="rp-prompt">{m.prompt}</p>

  {m.kind === 'match' ? <>
   <div className="rp-buckets">
    <Bucket blue={m.target[0]} yellow={m.target[1]} label="Target" sub={m.targetLabel.replace('Recipe: ', '')} big />
    <span className="rp-vs" aria-hidden="true">{solved ? '=' : '?'}</span>
    <Bucket blue={blue} yellow={yellow} label="Your bucket" sub={`${blue} blue : ${yellow} yellow`} big />
   </div>
   <div className="rp-steppers">
    {(['b', 'y'] as const).map(c => { const v = c === 'b' ? blue : yellow, name = c === 'b' ? 'blue' : 'yellow';
     return <div key={c} className={`rp-stepper ${c}`} role="group" aria-label={`${name} cans`}>
      <span className="rp-label"><i className={`rp-dot ${c}`} aria-hidden="true" /> {c === 'b' ? 'Blue' : 'Yellow'}</span>
      <button aria-label={`Remove a ${name} can`} disabled={v === 0} onClick={() => step(c, -1)}>−</button>
      <output aria-live="polite" aria-label={`${v} ${name} cans`}>{v}</output>
      <button aria-label={`Add a ${name} can`} disabled={v === MAX} onClick={() => step(c, 1)}>+</button>
     </div>; })}
   </div>
   <Cans blue={blue} yellow={yellow} />
   <div className="rp-readout">
    <span>Blue : yellow = <strong>{blue} : {yellow}</strong>{blue && yellow && (sb !== blue) ? <> = <strong>{sb} : {sy}</strong> in simplest form</> : null}</span>
   </div>
   <ShareBar blue={blue} yellow={yellow} target={share(m.target)} />
   {!solved && <div className="rp-row rp-center"><button className="rp-primary" onClick={() => { touched.current = true; setVerdict(m.check(blue, yellow)); }}>Check my mix</button></div>}
  </> : <>
   <div className="rp-buckets">
    <div className="rp-compare">
     <Bucket blue={m.a[0]} yellow={m.a[1]} label={m.names?.[0] ?? recipe(m.a)} sub={m.b ? recipe(m.a) : undefined} big={!m.b} />
     <Cans blue={m.a[0]} yellow={m.a[1]} group={false} />
     {choice && m.b && <ShareBar blue={m.a[0]} yellow={m.a[1]} />}
    </div>
    {m.b && <div className="rp-compare">
     <Bucket blue={m.b[0]} yellow={m.b[1]} label={m.names?.[1] ?? recipe(m.b)} sub={recipe(m.b)} />
     <Cans blue={m.b[0]} yellow={m.b[1]} group={false} />
     {choice && <ShareBar blue={m.b[0]} yellow={m.b[1]} />}
    </div>}
   </div>
   <div className="rp-row" role="group" aria-label="Your answer">
    {m.options.map(o => <button key={o.id} aria-pressed={choice === o.id} disabled={solved} className={choice === o.id ? (o.id === m.answer ? 'right' : 'wrong') : ''}
     onClick={() => { touched.current = true; setChoice(o.id); }}>{o.label}</button>)}
   </div>
  </>}

  <div aria-live="polite">
   {m.kind === 'match' && verdict && <p className={`rp-feedback ${verdict.ok ? 'good' : 'bad'}`}>{verdict.body}</p>}
   {m.kind === 'predict' && choice && (choice === m.answer
    ? <p className="rp-feedback good"><strong>Right.</strong> {m.after}</p>
    : <p className="rp-feedback bad">{m.wrong[choice]} Try again.</p>)}
   {m.kind === 'match' && solved && <p className="rp-takeaway">{m.after}</p>}
  </div>
  {m.kind === 'predict' && solved && m.fix && <div className="rp-fix">
   <Bucket blue={m.fix[0]} yellow={m.fix[1]} label="What Sam should mix" sub={recipe(m.fix)} />
   <div><Cans blue={m.fix[0]} yellow={m.fix[1]} /><ShareBar blue={m.fix[0]} yellow={m.fix[1]} /><p className="rp-muted">Two copies of 2 : 3, so the blue share stays at {pct(0.4)}.</p></div>
  </div>}

  <div className="rp-row rp-nav">
   {k > 0 && <button onClick={() => go(k - 1)}>← Back</button>}
   {solved && <button ref={nextRef} className="rp-primary" onClick={() => k + 1 < missions.length ? go(k + 1) : setDone(true)}>{k + 1 < missions.length ? 'Next mission →' : 'Finish'}</button>}
   {!solved && <button className="rp-link" onClick={() => go(Math.min(k + 1, missions.length - 1))} disabled={k + 1 >= missions.length}>Skip</button>}
  </div>
 </div>;
}
