import { useState, type ReactNode } from 'react';
import { ONE, add, dec, div, eq, mul, pow, q, say, sub, val, type Q } from './frac';
import { Frac, Num, V } from './MathText';

const ratios: Q[] = [q(1, 2), q(1, 3), q(2, 3), q(-1, 2), q(2)];
const steps = ['Write it out', 'Multiply by r', 'Subtract', 'Solve for Sₙ', 'Let n grow', 'A shortcut, and its trap'];

// "a", "ar", "ar²", … as typeset text.
const sym = (k: number, times?: boolean): ReactNode => <>{times && <><V>r</V>·</>}<V>a</V>{k >= 1 && <V>r</V>}{k >= 2 && <sup>{k}</sup>}</>;

export default function Formula() {
 const [step, setStep] = useState(0);
 const [a, setA] = useState(3);
 const [r, setR] = useState<Q>(q(1, 2));
 const [n, setN] = useState(5);
 const A = q(a);
 const term = (k: number) => mul(A, pow(r, k));
 const cols = n + 1;
 const direct = Array.from({ length: n }, (_, k) => term(k)).reduce(add, q(0));
 const formula = div(mul(A, sub(ONE, pow(r, n))), sub(ONE, r));
 const rv = val(r);
 const cancel = step >= 2;

 const cell = (k: number, row: 'S' | 'rS') => <div key={`${row}${k}`} className={`gs-cell ${cancel && k >= 1 && k <= n - 1 ? 'gs-cancel' : ''} ${cancel && (row === 'S' ? k === 0 : k === n) ? 'gs-keep' : ''}`} style={{ gridColumn: k + 2 }}>
  <span className="gs-cell-sym">{row === 'S' && k > 0 && '+ '}{row === 'rS' && k > 1 && '+ '}{sym(k)}</span>
  <span className="gs-cell-val"><Num v={term(k)} /></span>
 </div>;

 return <div className="gs-panel">
  <p>The pictures worked for ½ and ¼. To handle <em>any</em> ratio, you need the formula for a partial sum, and there is one trick that gets it in three lines. Follow it with real numbers, then watch the same moves with letters.</p>
  <div className="gs-controls">
   <div><span className="gs-label">First term <V>a</V></span>
    <div className="gs-seg" role="group" aria-label="First term a">{[1, 3].map(v => <button key={v} aria-pressed={a === v} onClick={() => setA(v)}>{v}</button>)}</div></div>
   <div><span className="gs-label">Ratio <V>r</V></span>
    <div className="gs-seg" role="group" aria-label="Ratio r">{ratios.map(v => <button key={say(v)} aria-pressed={eq(v, r)} onClick={() => setR(v)}>{say(v)}</button>)}</div></div>
   <div><label className="gs-label" htmlFor="gs-n">Number of terms <V>n</V> = {n}</label>
    <input id="gs-n" type="range" min={3} max={6} value={n} onChange={e => setN(Number(e.target.value))} /></div>
  </div>

  <div className="step-dots" role="group" aria-label="Steps">
   {steps.map((s, i) => <button key={s} className={i === step ? 'active' : ''} aria-current={i === step ? 'step' : undefined} aria-label={`Step ${i + 1}: ${s}`} onClick={() => setStep(i)}>{i + 1}</button>)}
  </div>
  <h3 className="gs-step-title">Step {step + 1}. {steps[step]}</h3>

  {step <= 3 && <div className="gs-grid" style={{ gridTemplateColumns: `auto repeat(${cols}, minmax(3.6em, 1fr))` }} role="group" aria-label="Rows of terms lined up by power of r">
   <div className="gs-rowlabel" style={{ gridColumn: 1 }}><V>S</V><sub>{n}</sub> =</div>
   {Array.from({ length: n }, (_, k) => cell(k, 'S'))}
   {step >= 1 && <>
    <div className="gs-rowlabel" style={{ gridColumn: 1 }}><V>r</V><V>S</V><sub>{n}</sub> =</div>
    {Array.from({ length: n }, (_, k) => cell(k + 1, 'rS'))}
   </>}
   {step >= 2 && <>
    <div className="gs-rowlabel gs-diff" style={{ gridColumn: 1 }} ><V>S</V><sub>{n}</sub> − <V>r</V><V>S</V><sub>{n}</sub> =</div>
    <div className="gs-cell gs-keep gs-diff" style={{ gridColumn: 2 }}><span className="gs-cell-sym"><V>a</V></span><span className="gs-cell-val"><Num v={A} /></span></div>
    {Array.from({ length: n - 1 }, (_, k) => <div key={k} className="gs-cell gs-zero gs-diff" style={{ gridColumn: k + 3 }}>0</div>)}
    <div className="gs-cell gs-keep gs-diff" style={{ gridColumn: n + 2 }}><span className="gs-cell-sym">− {sym(n)}</span><span className="gs-cell-val">−<Num v={term(n)} paren /></span></div>
   </>}
  </div>}

  <div className="gs-explain">
   {step === 0 && <p>Here are the first {n} terms. Each one is the previous one times <V>r</V> = {say(r)}. Adding them directly gives <V>S</V><sub>{n}</sub> = <Num v={direct} />. That works for {n} terms, but nobody wants to add 50 of them, let alone infinitely many. We need a shortcut.</p>}
   {step === 1 && <p>Multiply the whole sum by <V>r</V>. Every term moves one place up the chain: <V>a</V> becomes <V>a</V><V>r</V>, <V>a</V><V>r</V> becomes <V>a</V><V>r</V><sup>2</sup>, and so on. Lined up by power of <V>r</V>, the new row is the old row <strong>shifted one column to the right</strong>. Almost every column now holds the same number twice.</p>}
   {step === 2 && <p>Subtract the second row from the first. Every column with a match cancels to 0. Only two terms survive: the very first term <V>a</V>, which has no partner above it in the shifted row, and the very last term <V>a</V><V>r</V><sup>{n}</sup>, which stuck out past the end. However many terms you start with, the middle all cancels. That is the whole trick.</p>}
   {step === 3 && <>
    <p className="gs-formula"><V>S</V><sub>n</sub> − <V>r</V><V>S</V><sub>n</sub> = <V>a</V> − <V>a</V><V>r</V><sup>n</sup>
     <br />so <V>S</V><sub>n</sub>(1 − <V>r</V>) = <V>a</V>(1 − <V>r</V><sup>n</sup>)
     <br />so <V>S</V><sub>n</sub> = <Frac top={<><V>a</V>(1 − <V>r</V><sup>n</sup>)</>} bottom={<>1 − <V>r</V></>} label="S sub n equals a times 1 minus r to the n, over 1 minus r" /> &nbsp;(when <V>r</V> ≠ 1)</p>
    <p>Check it with your numbers: <Frac top={<>{a}(1 − <Num v={pow(r, n)} paren />)</>} bottom={<>1 − <Num v={r} paren /></>} /> = <Num v={formula} />, and adding the terms one by one gave <Num v={direct} />. {eq(formula, direct) ? 'They match.' : ''}</p>
    <p className="gs-aside">Why exclude <V>r</V> = 1? Then 1 − <V>r</V> = 0, and you can't divide by it. You don't need to: every term is <V>a</V>, so <V>S</V><sub>n</sub> = <V>n</V><V>a</V>.</p>
   </>}
   {step === 4 && <>
    <p>The formula <V>S</V><sub>n</sub> = <Frac top={<><V>a</V>(1 − <V>r</V><sup>n</sup>)</>} bottom={<>1 − <V>r</V></>} /> has exactly one piece that depends on <V>n</V>: the <V>r</V><sup>n</sup>. So the infinite sum, which is the limit of <V>S</V><sub>n</sub>, comes down to one question: <strong>what does <V>r</V><sup>n</sup> do as <V>n</V> grows?</strong></p>
    <table className="gs-table narrow">
     <caption><V>r</V><sup>n</sup> for <V>r</V> = {say(r)}</caption>
     <thead><tr><th scope="col"><V>n</V></th>{[1, 2, 5, 10, 20, 50].map(k => <th key={k} scope="col">{k}</th>)}</tr></thead>
     <tbody><tr><th scope="row"><V>r</V><sup>n</sup></th>{[1, 2, 5, 10, 20, 50].map(k => <td key={k}>{dec(rv ** k, 3)}</td>)}</tr></tbody>
    </table>
    {Math.abs(rv) < 1
     ? <p>Here |<V>r</V>| &lt; 1, so <V>r</V><sup>n</sup> → 0{rv < 0 ? ' (flipping sign as it goes)' : ''}, the 1 − <V>r</V><sup>n</sup> becomes 1, and the formula settles on <span className="gs-boxed"><V>S</V> = <Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} /> = <Frac top={a} bottom={<>1 − <Num v={r} paren /></>} /> = <Num v={div(A, sub(ONE, r))} /></span></p>
     : <p>Here |<V>r</V>| ≥ 1, so <V>r</V><sup>n</sup> blows up instead of settling, and so does <V>S</V><sub>n</sub>. The series <strong>diverges</strong>. That is the whole convergence test for geometric series: <strong>converges exactly when |<V>r</V>| &lt; 1</strong>, and then the sum is <Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} />. Try a ratio between −1 and 1.</p>}
   </>}
   {step === 5 && <>
    <p>Once you <em>know</em> a geometric series converges, there is a faster route. Write <V>S</V> = <V>a</V> + <V>a</V><V>r</V> + <V>a</V><V>r</V><sup>2</sup> + ⋯ and factor <V>r</V> out of everything after the first term:</p>
    <p className="gs-formula"><V>S</V> = <V>a</V> + <V>r</V>(<V>a</V> + <V>a</V><V>r</V> + <V>a</V><V>r</V><sup>2</sup> + ⋯) = <V>a</V> + <V>r</V><V>S</V>, &nbsp;so&nbsp; <V>S</V> = <Frac top={<V>a</V>} bottom={<>1 − <V>r</V></>} /></p>
    <p>The series contains a shrunken copy of itself. That is exactly what the first picture showed: after the first half, the rest of the square is a half-size copy of the whole picture.</p>
    <div className="gs-trap">
     <p><strong>The trap.</strong> Run the same algebra on <V>S</V> = 1 + 2 + 4 + 8 + ⋯: then <V>S</V> = 1 + 2<V>S</V>, so <V>S</V> = −1. A sum of positive numbers equal to −1? The algebra assumed <V>S</V> was a real number, and here it isn't: the partial sums 1, 3, 7, 15, … run off to infinity. The shortcut is only valid after you have checked |<V>r</V>| &lt; 1.</p>
    </div>
   </>}
  </div>

  <div className="gs-row gs-nav">
   <button disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
   <button className="gs-primary" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next step →</button>
  </div>
  {step <= 3 && <p className="gs-note-small">With letters, the same columns read <V>a</V>, <V>a</V><V>r</V>, <V>a</V><V>r</V><sup>2</sup>, …, and the cancellation works for every <V>n</V>, not just {n}. Value check: <V>S</V><sub>{n}</sub> ≈ {dec(val(direct))}.</p>}
 </div>;
}
