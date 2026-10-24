import { useState } from 'react';
import SpotParts from './SpotParts';
import Claims from './Claims';
import BackItUp from './BackItUp';
import OtherSide from './OtherSide';
import Build from './Build';
import { partInfo, partOrder } from './content';
import { Tag } from './ui';
import './persuasive-writing.css';

type Mode = 'spot' | 'claims' | 'back' | 'other' | 'build';
const modes: { id: Mode; label: string }[] = [
 { id: 'spot', label: '🔍 1. Spot the parts' },
 { id: 'claims', label: '🎯 2. Sharpen the claim' },
 { id: 'back', label: '🔗 3. Back it up' },
 { id: 'other', label: '⚖ 4. Answer the other side' },
 { id: 'build', label: '✍ 5. Build your own' }
];

export default function PersuasiveWriting() {
 const [mode, setMode] = useState<Mode>('spot');
 const k = modes.findIndex(m => m.id === mode);
 return <div className="activity pw">
  <h2>How do you change someone’s mind with writing?</h2>
  <p>Persuasive writing tries to get a reader to believe something or do something. The most convincing writing doesn’t just say it louder. It gives the reader good reasons, and it takes the other side seriously. (Many classes call this <strong>argument writing</strong>.)</p>
  <dl className="pw-legend">
   {partOrder.map(p => <div key={p}><dt><Tag part={p} /></dt><dd>{partInfo[p].job}</dd></div>)}
  </dl>
  <p>Find the five parts in real arguments, learn what makes each one strong, then build an argument of your own.</p>
  <div className="pw-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'spot' && <SpotParts />}
  {mode === 'claims' && <Claims />}
  {mode === 'back' && <BackItUp />}
  {mode === 'other' && <OtherSide />}
  {mode === 'build' && <Build />}
  {k < modes.length - 1 && <div className="pw-modes-next">
   <button onClick={() => { setMode(modes[k + 1].id); }}>Next: {modes[k + 1].label.replace(/^\S+ /, '')} →</button>
  </div>}
  <p className="note">Ridgeview Middle School is made up, and so are its people, surveys, and numbers. They are here for practice, so don’t quote them as real facts. The one real fact is the American Academy of Pediatrics’ 2014 recommendation that middle and high schools start at 8:30 a.m. or later.</p>
 </div>;
}
