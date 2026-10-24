import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

const N = 10;
const W = 14, H = 80, GAP = 30, FAR = 96, FLOOR = 132;
const LEAN = Math.asin((GAP + 2) / H) * 180 / Math.PI;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

type Guess = 'all' | 'none' | 'some';
type Setup = { start: number; far: boolean[] }; // start 0 = nobody pushes; far[i] = gap after domino i+1 is too wide
const presets: { label: string; setup: Setup }[] = [
 { label: 'Full proof', setup: { start: 1, far: Array(N - 1).fill(false) } },
 { label: 'No base case', setup: { start: 0, far: Array(N - 1).fill(false) } },
 { label: 'A broken link', setup: { start: 1, far: Array.from({ length: N - 1 }, (_, i) => i === 4) } },
 { label: 'Start later', setup: { start: 3, far: Array(N - 1).fill(false) } }
];

// Which dominoes fall: from start until the first gap that is too wide.
function outcome({ start, far }: Setup) {
 if (!start) return { last: 0, forever: false };
 let last = start;
 while (last < N && !far[last - 1]) last++;
 return { last, forever: last === N };
}

export default function Dominoes() {
 const [setup, setSetup] = useState<Setup>(presets[0].setup);
 const [guess, setGuess] = useState<Guess | null>(null);
 const [shown, setShown] = useState(-1); // -1 = not run yet; otherwise number of dominoes knocked over so far
 const timer = useRef<number>(undefined);
 const { start, far } = setup;
 const { last, forever } = outcome(setup);
 const count = start ? last - start + 1 : 0;
 const done = shown >= count;
 const truth: Guess = !start ? 'none' : start === 1 && forever ? 'all' : 'some';

 useEffect(() => () => window.clearInterval(timer.current), []);

 function change(next: Setup) { window.clearInterval(timer.current); setSetup(next); setShown(-1); setGuess(null); }
 function toggleGap(i: number) { change({ start, far: far.map((f, j) => j === i ? !f : f) }); }

 function run() {
  window.clearInterval(timer.current);
  if (reduced() || !count) { setShown(count); return; }
  setShown(0);
  timer.current = window.setInterval(() => setShown(s => {
   if (s + 1 >= count) window.clearInterval(timer.current);
   return Math.min(s + 1, count);
  }), 230);
 }

 const xs: number[] = [];
 let x = 46;
 for (let i = 0; i < N; i++) { xs.push(x); x += W + (far[i] ? FAR : GAP); }
 const width = x + 60;
 const fallen = (n: number) => start > 0 && n >= start && n <= last && n - start < shown;

 function gapKey(e: KeyboardEvent, i: number) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGap(i); } }

 return <div className="ind-dom">
  <p>Let <strong>P(n)</strong> be the statement “domino <em>n</em> falls.” An induction proof has two parts, and each one is something you can see in the line of dominoes:</p>
  <div className="ind-two">
   <div className="ind-part"><span className="ind-tag">Base case</span><strong>P(1)</strong><span>Someone pushes the first domino.</span></div>
   <div className="ind-part"><span className="ind-tag">Inductive step</span><strong>P(k) ⇒ P(k+1), for every k ≥ 1</strong><span>Every domino stands close enough to knock over the next one.</span></div>
  </div>

  <div className="ind-presets" role="group" aria-label="Example setups">
   {presets.map(p => <button key={p.label} onClick={() => change(p.setup)}>{p.label}</button>)}
  </div>

  <div className="ind-dom-stage">
   <svg viewBox={`0 0 ${width} 196`} className="ind-dom-svg" role="group" aria-label="A line of ten dominoes that continues forever to the right">
    <line x1="0" x2={width} y1={FLOOR} y2={FLOOR} className="ind-floor" />
    {start > 0 && <g className="ind-push" transform={`translate(${xs[start - 1] - 34} ${FLOOR - H + 6})`} aria-hidden="true">
     <path d="M0 10 h18 v-7 l12 12 l-12 12 v-7 h-18 z" />
     <text x="15" y="-6" textAnchor="middle">push</text>
    </g>}
    {xs.map((dx, i) => {
     const n = i + 1, f = fallen(n), leanOnNext = n < last || (n === N && forever);
     return <g key={n}>
      <rect x={dx} y={FLOOR - H} width={W} height={H} rx="2"
       className={`ind-domino${f ? ' down' : ''}${n === start ? ' first' : ''}`}
       style={{ transform: f ? `rotate(${leanOnNext ? LEAN : 90}deg)` : undefined }} />
      <text x={dx + W / 2} y={FLOOR + 22} textAnchor="middle" className="ind-dom-num">{n}</text>
     </g>;
    })}
    {far.map((wide, i) => {
     const gx = xs[i] + W, gw = (wide ? FAR : GAP);
     return <g key={i} role="button" tabIndex={0} className={`ind-gap${wide ? ' wide' : ''}`}
      aria-label={`Gap between domino ${i + 1} and ${i + 2}: ${wide ? 'too far apart. Press to move them closer.' : 'close enough. Press to move them apart.'}`}
      aria-pressed={wide} onClick={() => toggleGap(i)} onKeyDown={e => gapKey(e, i)}>
      <rect x={gx + 2} y={FLOOR + 30} width={gw - 4} height="26" rx="8" />
      <text x={gx + gw / 2} y={FLOOR + 48} textAnchor="middle">{wide ? '↔' : '·'}</text>
     </g>;
    })}
    <text x={x + 4} y={FLOOR - 30} className="ind-dom-more">…</text>
   </svg>
  </div>
  <p className="ind-help">Tap a gap marker under the dominoes (or Tab to it and press Enter) to move two dominoes apart or back together. The line goes on forever past the right edge, and every gap out there is close enough.</p>

  <div className="ind-row">
   <label className="ind-field">Base case: push domino
    <select value={start} onChange={e => change({ start: +e.target.value, far })}>
     <option value={0}>no domino</option>
     {Array.from({ length: N }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
    </select>
   </label>
  </div>

  <div className="ind-predict">
   <strong>Predict first.</strong> When you push, which dominoes fall?
   <div className="ind-opts" role="radiogroup" aria-label="Prediction">
    {([['all', 'Every domino, forever'], ['some', 'Some fall, some stay standing'], ['none', 'None of them']] as const).map(([g, label]) =>
     <button key={g} role="radio" aria-checked={guess === g} disabled={shown >= 0} onClick={() => setGuess(g)}>{label}</button>)}
   </div>
   <button className="ind-primary" disabled={!guess || shown >= 0} onClick={run}>Push</button>
   {shown >= 0 && <button onClick={() => { setShown(-1); setGuess(null); }}>Reset</button>}
  </div>

  <div className="ind-chain" aria-hidden="true">
   {Array.from({ length: N }, (_, i) => <span key={i} className={fallen(i + 1) ? 'on' : ''}>P({i + 1})</span>)}
   <span className={done && forever ? 'on' : ''}>P(11), P(12), …</span>
  </div>

  <div aria-live="polite">
   {done && guess && <div className={`ind-feedback${guess === truth ? ' good' : ' bad'}`}>
    <strong>{guess === truth ? 'Your prediction was right.' : 'Not quite.'}</strong>{' '}
    <Explain setup={setup} last={last} forever={forever} />
   </div>}
  </div>

  <details className="ind-why" open>
   <summary>Why isn’t assuming P(k) circular?</summary>
   <p>The inductive step proves an <em>if-then</em>: <strong>if</strong> domino k falls, <strong>then</strong> domino k+1 falls. You can check an if-then without knowing whether the “if” ever happens. You check the dominoes’ spacing; you don’t need to watch any of them fall.</p>
   <p>So “assume P(k)” doesn’t claim P(k) is true. It means: “Pick any one k. Suppose that domino has fallen. Show that it takes the next one with it.” The circular move would be assuming P(n) for <em>every</em> n, which is the conclusion itself. A correct proof never does that.</p>
   <p>Why do the two parts reach every domino? Suppose some domino stayed standing, and take the first one that did. It isn’t domino 1, which was pushed. So the domino just before it fell, and by the step it knocked this one over. That contradiction means no domino is left standing.</p>
  </details>
 </div>;
}

function Explain({ setup: { start, far }, last, forever }: { setup: Setup; last: number; forever: boolean }) {
 if (!start) return <>Nobody pushed a domino, so nothing falls, even though every domino is still close enough to knock over the next. In proof terms the step P(k) ⇒ P(k+1) is true for every k, but without a base case it proves nothing. The false claim “n = n + 1 for every n” has a perfectly good inductive step (add 1 to both sides); only its base case fails.</>;
 const before = start > 1 ? ` Dominoes 1 to ${start - 1} stay standing because the proof starts at n = ${start}.` : '';
 const ignored = far.slice(0, start - 1).some(Boolean) ? ' Gaps before the starting domino don’t matter, because nothing needs to cross them.' : '';
 if (forever) return <>{start === 1
  ? 'The base case starts the chain and the step carries it through every domino, including the millionth one past the edge. You never check them one at a time: the step handles every k at once.'
  : `A base case at n = ${start} proves P(n) for every n ≥ ${start}, and says nothing about smaller n. That is exactly what you want for a claim like “2ⁿ > n² for every n ≥ 5.”`}{before}{ignored}</>;
 return <>Dominoes {start} to {last} fall, then the chain stops: domino {last} is too far from domino {last + 1}. One failed link is enough to sink the proof for everything after it, which is why the step has to hold for <em>every</em> k, not just most of them. (The famous “all horses are the same color” proof fails at exactly one link, k = 1.) A gap doesn’t prove that domino {last + 1} can’t fall. It only means this argument doesn’t show that it does.{before}{ignored}</>;
}
