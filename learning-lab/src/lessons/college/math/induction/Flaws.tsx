import { useState } from 'react';
import { Expr } from './Expr';
import { proofs } from './flaws';

type Pick = number | 'none';

export default function Flaws() {
 const [at, setAt] = useState(0);
 const [picks, setPicks] = useState<Pick[]>([]); // every pick for the current proof
 const [firstTry, setFirstTry] = useState<boolean[]>([]);
 const finished = at >= proofs.length;
 const p = proofs[Math.min(at, proofs.length - 1)];
 const answer: Pick = p.flaw ?? 'none';
 const solved = picks.includes(answer);
 const lastPick = picks[picks.length - 1];

 function pick(x: Pick) {
  if (solved) return;
  if (!picks.length) setFirstTry(f => [...f, x === answer]);
  setPicks(ps => [...ps, x]);
 }
 function next() { setAt(a => a + 1); setPicks([]); }
 function restart() { setAt(0); setPicks([]); setFirstTry([]); }

 if (finished) {
  const right = firstTry.filter(Boolean).length;
  return <div className="ind-flaws">
   <div className="ind-feedback good">
    <strong>You found {right} of {proofs.length} on the first try.</strong> Each broken proof failed in a different place: a step that breaks at one k, a missing base case, a hypothesis that assumes the goal, and a step that only works once k is big enough. Two of the proofs had nothing wrong.
   </div>
   <ul className="ind-review">{proofs.map((q, i) => <li key={i}><span className={firstTry[i] ? 'ok' : 'miss'}>{firstTry[i] ? '✓' : '○'}</span> <strong>{q.title}:</strong> {q.flaw === null ? 'correct proof' : `flaw in the ${q.parts[q.flaw].label.toLowerCase()}`}</li>)}</ul>
   <button className="ind-primary" onClick={restart}>Start over</button>
  </div>;
 }

 return <div className="ind-flaws">
  <p>Each “proof” below either has one broken part or is completely correct. Click the part that fails, or say there’s nothing wrong.</p>
  <div className="ind-progress" aria-label={`Proof ${at + 1} of ${proofs.length}`}>
   {proofs.map((_, i) => <span key={i} className={i < at ? (firstTry[i] ? 'ok' : 'miss') : i === at ? 'now' : ''} />)}
  </div>
  <h3>{at + 1}. {p.title}</h3>
  <ol className="ind-parts">
   {p.parts.map((part, i) => {
    const state = picks.includes(i) ? (i === answer ? 'right' : 'wrong') : solved && i === answer ? 'right' : '';
    return <li key={i}><button className={state} disabled={solved} onClick={() => pick(i)}>
     <span className="ind-tag">{part.label}</span><Expr s={part.text} />
    </button></li>;
   })}
  </ol>
  <button className={`ind-none${picks.includes('none') ? (answer === 'none' ? ' right' : ' wrong') : ''}`} disabled={solved} onClick={() => pick('none')}>Nothing is wrong: it’s a valid proof</button>

  <div aria-live="polite">
   {solved ? <div className="ind-feedback good">
    <strong>{picks.length === 1 ? 'Yes.' : 'That’s it.'}</strong> {p.explain}
    {p.fix && <p><strong>Fix:</strong> {p.fix}</p>}
    <div><button className="ind-primary" onClick={next}>{at + 1 < proofs.length ? 'Next proof' : 'See results'}</button></div>
   </div> : lastPick !== undefined && <div className="ind-feedback bad">
    <strong>Not that.</strong> {lastPick === 'none'
     ? 'Something here really is broken. Check each part against the template: base case checked, hypothesis about one k, step proves P(k+1) for every k in range.'
     : p.parts[lastPick].ok || 'This part holds up. Look again, and remember a proof can also be completely correct.'}
   </div>}
  </div>
 </div>;
}
