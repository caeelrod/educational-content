import { useState } from 'react';
import Dominoes from './Dominoes';
import Flaws from './Flaws';
import Tiling from './Tiling';
import Workshop from './Workshop';
import './induction.css';

type Mode = 'dominoes' | 'workshop' | 'tiling' | 'flaws';
const modes: { id: Mode; label: string }[] = [
 { id: 'dominoes', label: '① Why it works' },
 { id: 'workshop', label: '② Proof workshop' },
 { id: 'tiling', label: '③ Tiling puzzle' },
 { id: 'flaws', label: '④ Spot the flaw' }
];

export default function Induction() {
 const [mode, setMode] = useState<Mode>('dominoes');
 return <div className="activity ind">
  <h2>Proof by induction</h2>
  <p>Induction proves that a statement P(n) is true for every whole number n from some starting point on, infinitely many cases, with just two finite checks. It often feels like a trick or like circular reasoning. It is neither, and once you see why, writing the proofs becomes routine.</p>
  <p className="ind-small"><strong>Prerequisites:</strong> high-school algebra and the idea of an if-then statement. This lesson starts at n = 1; some courses start the natural numbers at 0, and the method is the same.</p>
  <div className="ind-modes" role="group" aria-label="Activity">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'dominoes' && <Dominoes />}
  {mode === 'workshop' && <Workshop />}
  {mode === 'tiling' && <Tiling />}
  {mode === 'flaws' && <Flaws />}
  <details className="ind-why ind-template">
   <summary>The proof template</summary>
   <ol>
    <li><strong>Claim.</strong> State P(n) and the starting value: “For every n ≥ n₀, …”.</li>
    <li><strong>Base case.</strong> Check P(n₀) directly.</li>
    <li><strong>Inductive hypothesis.</strong> “Assume P(k) for some particular k ≥ n₀.”</li>
    <li><strong>Inductive step.</strong> Start from P(k+1)’s left side (or whatever P(k+1) is about), find P(k) inside it, use the hypothesis, and arrive at P(k+1).</li>
    <li><strong>Conclusion.</strong> “By induction, P(n) holds for every n ≥ n₀.”</li>
   </ol>
   <p className="ind-small">Strong induction is the same idea with a bigger hypothesis: assume P(n₀), …, P(k) all hold, not just P(k). It’s useful when P(k+1) depends on a case further back, as in “every n ≥ 2 is a product of primes.”</p>
  </details>
 </div>;
}
