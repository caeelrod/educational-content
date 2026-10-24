import { useState } from 'react';
import { claims, sup, type Choice, type Claim, type PictureKind } from './claims';
import { Expr, spoken } from './Expr';

// Stage 0 = base case, 1 = hypothesis, 2.. = algebra steps, then done.
export default function Workshop() {
 const [id, setId] = useState(claims[0].id);
 const claim = claims.find(c => c.id === id)!;
 return <div className="ind-ws">
  <p>Build three proofs one line at a time. At each step choose the line that comes next. Wrong choices explain what went wrong, and many of them are the mistakes students make most.</p>
  <div className="ind-seg" role="group" aria-label="Claim to prove">
   {claims.map(c => <button key={c.id} aria-pressed={c.id === id} onClick={() => setId(c.id)}>{c.tab}</button>)}
  </div>
  <Proof key={claim.id} claim={claim} />
 </div>;
}

function Proof({ claim }: { claim: Claim }) {
 const [stage, setStage] = useState(0);
 const [n, setN] = useState(3);
 const [picked, setPicked] = useState<Choice | null>(null);
 const [misses, setMisses] = useState(0);
 const last = 2 + claim.steps.length;
 const stepIx = stage - 2;
 const inStep = stage >= 2 && stage < last;
 const split = stage >= 1; // once the hypothesis is set up, draw P(k+1) as P(k) plus the new piece
 const shownN = split ? Math.max(n, claim.start + 1) : n;
 const c = claim.check(shownN);
 const correct = (ch: Choice) => !!ch.ok;
 const options = stage === 1 ? claim.hypothesis : inStep ? claim.steps[stepIx].choices : [];

 function pick(ch: Choice) {
  if (picked?.ok) return;
  setPicked(ch);
  if (!correct(ch)) setMisses(m => m + 1);
 }
 function next() { setStage(s => s + 1); setPicked(null); }
 function restart() { setStage(0); setPicked(null); setMisses(0); }

 const chooser = options.length > 0 && <>
  <div className="ind-choices" role="group" aria-label="Choose the next line">
   {options.map((ch, i) => <button key={i} aria-label={spoken(ch.text)} disabled={!!picked?.ok}
    className={picked === ch ? (ch.ok ? 'right' : 'wrong') : ''} onClick={() => pick(ch)}><Expr s={ch.text} /></button>)}
  </div>
  <div aria-live="polite">
   {picked && <div className={`ind-feedback ${picked.ok ? 'good' : 'bad'}`}>
    <strong>{picked.ok ? 'Yes.' : 'Not this one.'}</strong> {picked.why}
    {picked.ok && <div><button className="ind-primary" onClick={next}>{stage + 1 >= last ? 'Finish the proof' : 'Next line'}</button></div>}
   </div>}
  </div>
 </>;

 return <div className="ind-proof">
  <div className="ind-claim">
   <span className="ind-tag">Claim</span>
   <div className="ind-claim-math">For every n ≥ {claim.start}: <Expr s={claim.statement} /></div>
   <div className="ind-reading">{claim.reading}</div>
  </div>

  <div className="ind-ws-grid">
   <div className="ind-pic">
    <Picture kind={claim.picture} n={shownN} split={split} />
    <label className="ind-slider">
     <span>{split ? <>k + 1 = {shownN} <small>(so k = {shownN - 1})</small></> : <>n = {shownN}</>}</span>
     <input type="range" min={split ? claim.start + 1 : claim.start} max={claim.maxN} value={shownN} onChange={e => setN(+e.target.value)}
      aria-label={split ? 'Size k + 1' : 'Size n'} />
    </label>
    <div className="ind-check">
     <div><span>Left</span> {c.lhs}</div>
     <div><span>Right</span> {c.rhs}</div>
    </div>
    <p className="ind-help">{split ? 'The highlighted part is what P(k+1) adds to P(k).' : 'Checking examples builds belief, but no number of examples is a proof. That’s what induction is for.'}</p>
   </div>

   <div className="ind-lines">
    <ol className="ind-outline">
     <li className={stage === 0 ? 'now' : 'done'}>
      <span className="ind-tag">Base case · n = {claim.start}</span>
      {stage === 0 ? <div className="ind-ask"><p>Check the smallest case first.</p><button className="ind-primary" onClick={next}>Check n = {claim.start}</button></div>
       : <ul className="ind-base">{claim.base.map((b, i) => <li key={i}><Expr s={b} /></li>)}</ul>}
     </li>
     <li className={stage === 1 ? 'now' : stage > 1 ? 'done' : ''}>
      <span className="ind-tag">Inductive hypothesis</span>
      {stage === 1 && <><p>What do you get to assume?</p>{chooser}</>}
      {stage > 1 && <p><Expr s={claim.hypothesis.find(correct)!.text} /></p>}
     </li>
     <li className={stage >= 2 && stage < last ? 'now' : stage >= last ? 'done' : ''}>
      <span className="ind-tag">Inductive step</span>
      {stage >= 2 && <>
       <p className="ind-goal">Goal: show <Expr s={claim.goal} /></p>
       <div className="ind-algebra" aria-label="Work so far">
        <div><Expr s={claim.from} /></div>
        {claim.steps.slice(0, stepIx).map((s, i) => <div key={i} className={i === 1 ? 'uses' : ''}><Expr s={s.choices.find(correct)!.text} />{i === 1 && <span className="ind-ih">by the hypothesis</span>}</div>)}
        {inStep && <div className="ind-blank">?</div>}
       </div>
       {inStep && <><p>{claim.steps[stepIx].prompt}</p>{chooser}</>}
      </>}
     </li>
     <li className={stage >= last ? 'done' : ''}>
      <span className="ind-tag">Conclusion</span>
      {stage >= last && <p>P({claim.start}) is true, and P(k) ⇒ P(k+1) for every k ≥ {claim.start}. By induction, <Expr s={claim.statement} /> for every n ≥ {claim.start}.</p>}
     </li>
    </ol>

    <div aria-live="polite">
     {stage >= last && <div className="ind-feedback good">
      <strong>Proof complete{misses ? ` (${misses} wrong pick${misses === 1 ? '' : 's'} along the way)` : ', with no wrong picks'}.</strong> {claim.insight}
      <div><button onClick={restart}>Build it again</button></div>
     </div>}
    </div>
   </div>
  </div>
 </div>;
}

const CELL = 22;
function Picture({ kind, n, split }: { kind: PictureKind; n: number; split: boolean }) {
 const k = n - 1;
 if (kind === 'stairs') {
  const size = CELL * Math.max(n, 5) + 4;
  const cells = [];
  for (let col = 1; col <= n; col++) for (let h = 0; h < col; h++)
   cells.push(<rect key={`${col}-${h}`} x={2 + (col - 1) * CELL} y={size - 2 - (h + 1) * CELL} width={CELL - 2} height={CELL - 2} rx="3" className={split && col === n ? 'new' : 'old'} />);
  return <svg className="ind-grid" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={split ? `A staircase of ${k} columns plus a new column of ${n} squares` : `A staircase with columns of 1 to ${n} squares`}>{cells}</svg>;
 }
 if (kind === 'odds') {
  const size = CELL * Math.max(n, 5) + 4;
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
   const layer = Math.max(r, c);
   cells.push(<rect key={`${r}-${c}`} x={2 + c * CELL} y={2 + r * CELL} width={CELL - 2} height={CELL - 2} rx="3"
    className={split ? (layer === k ? 'new' : 'old') : layer % 2 ? 'old alt' : 'old'} />);
  }
  return <svg className="ind-grid" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={split ? `A ${k} by ${k} square wrapped by an L of ${2 * k + 1} squares` : `A ${n} by ${n} square built from L-shaped layers of odd sizes`}>{cells}</svg>;
 }
 const unit = 300 / Math.max(2 ** n, 8), row = (y: number, label: string, segs: { w: number; cls: string }[]) => {
  let x = 70;
  return <g key={label}><text x="62" y={y + 19} textAnchor="end" className="ind-bar-label">{label}</text>
   {segs.map((s, i) => { const r = <rect key={i} x={x} y={y} width={Math.max(s.w * unit - 1, 2)} height="24" rx="3" className={s.cls} />; x += s.w * unit; return r; })}
   <text x={x + 6} y={y + 18} className="ind-bar-val">{segs.reduce((a, s) => a + s.w, 0)}</text></g>;
 };
 return <svg className="ind-grid" viewBox="0 0 420 116" role="img" aria-label={split ? `2 to the ${n} drawn as two copies of 2 to the ${k}, compared with ${k} plus 1` : `Bars comparing 2 to the ${n} with ${n}`}>
  {split ? <>{row(18, `2${sup(n)}`, [{ w: 2 ** k, cls: 'old' }, { w: 2 ** k, cls: 'new' }])}{row(70, `${n}`, [{ w: k, cls: 'old' }, { w: 1, cls: 'new' }])}</>
   : <>{row(18, `2${sup(n)}`, [{ w: 2 ** n, cls: 'old' }])}{row(70, `${n}`, [{ w: n, cls: 'old' }])}</>}
 </svg>;
}
