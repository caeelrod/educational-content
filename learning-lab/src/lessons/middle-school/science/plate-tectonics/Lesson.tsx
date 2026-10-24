import { useState } from 'react';
import Puzzle from './Puzzle';
import Spreading from './Spreading';
import Lab from './Lab';
import Detective from './Detective';
import './plate-tectonics.css';

type Mode = 'puzzle' | 'spreading' | 'lab' | 'detective';
const modes: { id: Mode; label: string }[] = [
 { id: 'puzzle', label: '🧩 1. Continent puzzle' },
 { id: 'spreading', label: '🌊 2. Seafloor spreading' },
 { id: 'lab', label: '🌋 3. Boundary lab' },
 { id: 'detective', label: '🔎 4. Boundary detective' }
];

export default function PlateTectonics() {
 const [mode, setMode] = useState<Mode>('puzzle');
 const k = modes.findIndex(m => m.id === mode);
 return <div className="activity pt">
  <h2>Why do earthquakes, volcanoes, and mountains show up where they do?</h2>
  <p>The ground under your feet is moving, a few centimeters every year. Follow the clues scientists used to figure that out: continents that fit like puzzle pieces, a striped ocean floor, and the patterns of earthquakes and volcanoes where giant <strong>tectonic plates</strong> meet.</p>
  <p className="pt-prereq"><strong>Helpful to know first:</strong> Earth has layers (crust, mantle, and core), and fossils are the remains of living things preserved in rock.</p>
  <div className="pt-modes" role="group" aria-label="Part of the lesson">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}
  </div>
  {mode === 'puzzle' && <Puzzle />}
  {mode === 'spreading' && <Spreading />}
  {mode === 'lab' && <Lab />}
  {mode === 'detective' && <Detective onLab={() => setMode('lab')} />}
  {k < modes.length - 1 && <div className="pt-modes-next"><button onClick={() => setMode(modes[k + 1].id)}>Next: {modes[k + 1].label.replace(/^\S+ \d\. /, '')} →</button></div>}
 </div>;
}
