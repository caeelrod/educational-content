import { useState } from 'react';
import Curves from './Curves';
import Equilibrium from './Equilibrium';
import Shifts from './Shifts';
import Controls from './Controls';
import Practice from './Practice';
import './supply-and-demand.css';

type Mode = 'curves' | 'equilibrium' | 'shifts' | 'controls' | 'practice';
const modes: { id: Mode; label: string }[] = [
 { id: 'curves', label: '🧺 1. Buyers and growers' },
 { id: 'equilibrium', label: '⚖ 2. Find the price' },
 { id: 'shifts', label: '↔ 3. Shift or slide?' },
 { id: 'controls', label: '⛔ 4. Ceilings and floors' },
 { id: 'practice', label: '📰 5. Read the news' }
];

export default function SupplyAndDemand() {
 const [mode, setMode] = useState<Mode>('curves');
 const k = modes.findIndex(m => m.id === mode);
 return <div className="activity sd">
  <h2>Why do strawberries cost more after a frost?</h2>
  <p>No one in town sets the price of strawberries, yet every week the stands settle on one. That price comes from two groups making their own choices: <strong>buyers</strong> deciding how much they want at each price (<span className="sd-key d">demand</span>) and <strong>sellers</strong> deciding how much to bring at each price (<span className="sd-key s">supply</span>).</p>
  <p>Build the curves from real-looking buyers and growers, watch a market find its price, predict what news does to it, test what happens when the law sets the price, then practice on headlines from other markets.</p>
  <p className="sd-prereq"><strong>Before you start:</strong> you should be comfortable reading a graph with two axes. No economics background needed. Usually taught in a high school economics course.</p>
  <div className="sd-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'curves' && <Curves />}
  {mode === 'equilibrium' && <Equilibrium />}
  {mode === 'shifts' && <Shifts />}
  {mode === 'controls' && <Controls />}
  {mode === 'practice' && <Practice />}
  <div className="sd-modes-next">
   {k + 1 < modes.length && <button onClick={() => setMode(modes[k + 1].id)}>Next: {modes[k + 1].label.replace(/^\S+ /, '')} →</button>}
  </div>
 </div>;
}
