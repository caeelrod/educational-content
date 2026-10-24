import { useState } from 'react';
import Explore from './Explore';
import FindIt from './FindIt';
import Gallery from './Gallery';
import Journey from './Journey';
import type { PartId } from './parts';

type Mode = 'explore' | 'journey' | 'find' | 'gallery';
const modes: { id: Mode; label: string }[] = [
 { id: 'explore', label: '🔍 Explore' },
 { id: 'journey', label: '🧬 Protein journey' },
 { id: 'find', label: '🎯 Find the part' },
 { id: 'gallery', label: '🧫 Cell gallery' }
];

export default function HumanCell() {
 const [mode, setMode] = useState<Mode>('explore');
 const [jump, setJump] = useState<{ id: PartId; n: number }>();
 return <div className="activity hc">
  <h2>Zoom into a human cell</h2>
  <p>Cells are the tiny living units that make up your body. Explore the parts inside one, follow a protein as the cell builds it, test yourself, and meet some very different human cells.</p>
  <div className="hc-modes" role="group" aria-label="Activity">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setJump(undefined); }}>{m.label}</button>)}
  </div>
  {mode === 'explore' && <Explore jump={jump} />}
  {mode === 'journey' && <Journey />}
  {mode === 'find' && <FindIt />}
  {mode === 'gallery' && <Gallery onJump={id => { setJump(j => ({ id, n: (j?.n ?? 0) + 1 })); setMode('explore'); }} />}
  <p className="note">This is a model, not a photograph. Real cells are three-dimensional, crowded, and mostly see-through; the colors here only help tell the parts apart. Sizes are not to scale. Ribosomes, for example, are drawn hundreds of times too big so you can see them. Many human cells are about 10 to 30 micrometers across, so you would need a microscope to see one.</p>
 </div>;
}
