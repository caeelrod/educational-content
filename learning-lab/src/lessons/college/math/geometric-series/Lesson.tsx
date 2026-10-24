import { useState } from 'react';
import Pictures from './Pictures';
import Watch from './Watch';
import Formula from './Formula';
import Uses from './Uses';
import Practice from './Practice';
import { V } from './MathText';
import './geometric-series.css';

type Mode = 'pictures' | 'watch' | 'formula' | 'uses' | 'practice';
const modes: { id: Mode; label: string }[] = [
 { id: 'pictures', label: '▦ 1. Picture it' },
 { id: 'watch', label: '📈 2. Watch it add up' },
 { id: 'formula', label: '✂ 3. Why the formula works' },
 { id: 'uses', label: '🔁 4. Where it shows up' },
 { id: 'practice', label: '🎯 5. Practice' }
];

export default function GeometricSeries() {
 const [mode, setMode] = useState<Mode>('pictures');
 return <div className="activity gs">
  <h2>How can infinitely many numbers add up to something finite?</h2>
  <p>A <strong>geometric series</strong> adds terms where each term is the one before it multiplied by the same number, the <strong>common ratio</strong> <V>r</V>:</p>
  <p className="gs-series big gs-center"><V>a</V> + <V>a</V><V>r</V> + <V>a</V><V>r</V><sup>2</sup> + <V>a</V><V>r</V><sup>3</sup> + ⋯</p>
  <p>Its sum is the limit of the running totals, the <strong>partial sums</strong> <V>S</V><sub>n</sub>. Start with two pictures, watch the running totals move, see where the formula comes from, then practice reading series the way exams write them.</p>
  <p className="gs-prereq"><strong>Prerequisites:</strong> algebra with exponents and fractions, sigma (∑) notation, and the idea of a limit. Usually taught in Calculus II alongside sequences and series.</p>
  <div className="gs-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'pictures' && <Pictures />}
  {mode === 'watch' && <Watch />}
  {mode === 'formula' && <Formula />}
  {mode === 'uses' && <Uses />}
  {mode === 'practice' && <Practice />}
  <div className="gs-modes-next">
   {mode !== 'practice' && <button onClick={() => { const k = modes.findIndex(m => m.id === mode); setMode(modes[k + 1].id); }}>Next: {modes[modes.findIndex(m => m.id === mode) + 1].label.replace(/^\S+ /, '')} →</button>}
  </div>
 </div>;
}
