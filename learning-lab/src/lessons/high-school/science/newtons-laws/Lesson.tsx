import { useState } from 'react';
import FirstLaw from './FirstLaw';
import CartLab from './CartLab';
import ThirdLaw from './ThirdLaw';
import ForceDiagrams from './ForceDiagrams';
import Elevator from './Elevator';
import Practice from './Practice';
import { V } from './shared';
import './newtons-laws.css';

type Mode = 'first' | 'second' | 'third' | 'fbd' | 'elevator' | 'practice';
const modes: { id: Mode; label: string }[] = [
 { id: 'first', label: '🧊 1. First law: keep sliding' },
 { id: 'second', label: '🛒 2. Second law: cart lab' },
 { id: 'third', label: '⛸ 3. Third law: push off' },
 { id: 'fbd', label: '✚ 4. Free-body diagrams' },
 { id: 'elevator', label: '🛗 5. Elevator ride' },
 { id: 'practice', label: '🎯 6. Practice' }
];

export default function NewtonsLaws() {
 const [mode, setMode] = useState<Mode>('first');
 const k = modes.findIndex(m => m.id === mode);
 return <div className="activity nl">
  <h2>What does it take to change how something moves?</h2>
  <p>A <strong>force</strong> is a push or a pull, measured in newtons (N). Newton’s three laws of motion connect forces to motion, and they rest on one idea that surprises almost everyone: forces don’t keep things moving. Forces <em>change</em> motion. A change in velocity, speeding up, slowing down, or turning, is called <strong>acceleration</strong> (<V>a</V>, in m/s²).</p>
  <p>Test each law in a simulation, practice drawing the forces on everyday objects, ride an elevator on a bathroom scale, then solve problems.</p>
  <p className="nl-prereq"><strong>Before you start:</strong> speed and velocity, acceleration as change in velocity per second, and solving a one-step equation such as 12 = 3<V>a</V>. Usually taught in a first high-school physics course or the forces unit of physical science.</p>
  <div className="nl-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'first' && <FirstLaw />}
  {mode === 'second' && <CartLab />}
  {mode === 'third' && <ThirdLaw />}
  {mode === 'fbd' && <ForceDiagrams />}
  {mode === 'elevator' && <Elevator />}
  {mode === 'practice' && <Practice />}
  <p className="nl-note-small">Simulations are simplified models: objects are treated as single rigid bodies, friction is one constant value, and <V>g</V> = 9.8 m/s². Each part notes its main simplifications.</p>
  <div className="nl-modes-next">
   {k < modes.length - 1 && <button onClick={() => { setMode(modes[k + 1].id); }}>Next: {modes[k + 1].label.replace(/^\S+ \d\. /, '')} →</button>}
  </div>
 </div>;
}
