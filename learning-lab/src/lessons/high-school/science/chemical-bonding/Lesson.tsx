import { useState } from 'react';
import Atoms from './Atoms';
import Trends from './Trends';
import Ionic from './Ionic';
import Covalent from './Covalent';
import Polarity from './Polarity';
import Practice from './Practice';
import './chemical-bonding.css';

type Mode = 'atoms' | 'trends' | 'ionic' | 'covalent' | 'polarity' | 'practice';
const modes: { id: Mode; label: string }[] = [
 { id: 'atoms', label: '⚛ 1. Read the table' },
 { id: 'trends', label: '📈 2. Spot the patterns' },
 { id: 'ionic', label: '⇄ 3. Ionic bonds' },
 { id: 'covalent', label: '🤝 4. Covalent bonds' },
 { id: 'polarity', label: '⚖ 5. Polar or ionic?' },
 { id: 'practice', label: '🎯 6. Practice' }
];

export default function ChemicalBonding() {
 const [mode, setMode] = useState<Mode>('atoms');
 const k = modes.findIndex(m => m.id === mode);
 return <div className="activity cb">
  <h2>Why do atoms bond, and how does the periodic table tell you how?</h2>
  <p>Table salt is a hard crystal that melts at 801 °C. Water is a liquid made of small molecules. Both form from atoms bonding, but in different ways. The difference comes down to the <strong>outermost electrons</strong> of each atom, and the periodic table is a map of exactly those electrons.</p>
  <p>Read valence electrons off the table, see why atomic size and electron pull change across it, build ionic and covalent compounds electron by electron, and then predict which kind of bond two elements will form.</p>
  <p className="cb-prereq"><strong>Before you start:</strong> atoms have protons and neutrons in a nucleus and electrons around it; the atomic number is the number of protons. Usually taught in high-school chemistry, in the units on atomic structure, the periodic table, and bonding.</p>
  <div className="cb-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'atoms' && <Atoms />}
  {mode === 'trends' && <Trends />}
  {mode === 'ionic' && <Ionic />}
  {mode === 'covalent' && <Covalent />}
  {mode === 'polarity' && <Polarity />}
  {mode === 'practice' && <Practice />}
  <div className="cb-modes-next">
   {k < modes.length - 1 && <button onClick={() => setMode(modes[k + 1].id)}>Next: {modes[k + 1].label.replace(/^\S+ /, '')} →</button>}
  </div>
 </div>;
}
