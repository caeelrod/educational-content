import { useState } from 'react';
import Mixer from './Mixer';
import Tables from './Tables';
import Rates from './Rates';
import Proportional from './Proportional';
import Practice from './Practice';
import './ratios.css';

type Mode = 'mix' | 'tables' | 'rates' | 'prop' | 'practice';
const modes: { id: Mode; label: string }[] = [
 { id: 'mix', label: '🎨 1. Mix it' },
 { id: 'tables', label: '📋 2. Tables and number lines' },
 { id: 'rates', label: '🏃 3. Unit rates' },
 { id: 'prop', label: '📈 4. Proportional or not?' },
 { id: 'practice', label: '🎯 5. Practice' }
];

export default function RatiosAndProportions() {
 const [mode, setMode] = useState<Mode>('mix');
 const k = modes.findIndex(m => m.id === mode);
 return <div className="activity rp">
  <h2>Same recipe, bigger batch: what has to stay the same?</h2>
  <p>A <strong>ratio</strong> compares two amounts, like <strong>2 cans of blue for every 3 cans of yellow</strong>, written 2 : 3. Make a bigger batch the right way and the color stays the same. Make it the wrong way and it changes. Start in the paint shop, then use tables, number lines, unit rates, and graphs to solve problems with ratios.</p>
  <p className="rp-prereq"><strong>You should already know:</strong> multiplying and dividing whole numbers and decimals, simple fractions, and reading a table. Usually taught in grades 6 and 7. The people, recipes, stores, and prices in this lesson are made up for practice.</p>
  <div className="rp-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'mix' && <Mixer />}
  {mode === 'tables' && <Tables />}
  {mode === 'rates' && <Rates />}
  {mode === 'prop' && <Proportional />}
  {mode === 'practice' && <Practice />}
  <div className="rp-modes-next">
   {k + 1 < modes.length && <button onClick={() => { setMode(modes[k + 1].id); }}>Next: {modes[k + 1].label.replace(/^\S+ /, '')} →</button>}
  </div>
 </div>;
}
