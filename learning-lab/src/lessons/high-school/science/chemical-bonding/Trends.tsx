import { useState, type CSSProperties } from 'react';
import PeriodicTable from './PeriodicTable';
import { byZ, bySym, fmt, mainGroup, properties, type Element, type Property } from './elements';

const about: Record<Property, { what: string; across: string; down: string; arrows: string }> = {
 radius: {
  what: 'How big an atom is, measured as half the distance between the nuclei of two bonded atoms (covalent radius, in picometers; 1 pm = 10⁻¹² m). Noble gases are left blank because they rarely bond, so their values aren\'t comparable.',
  across: 'Across a period, every element uses the same outer shell, but each has one more proton. The stronger pull draws the shell in, so atoms get smaller.',
  down: 'Down a group, each element has one more shell of electrons, so atoms get bigger.',
  arrows: 'Smaller → across a period. Bigger ↓ down a group.'
 },
 ie: {
  what: 'The energy needed to pull the outermost electron off one mole of atoms in the gas phase (kJ/mol). A high value means the atom holds its electrons tightly.',
  across: 'Across a period, more protons pull on the same shell, so the outer electrons are held more tightly and take more energy to remove.',
  down: 'Down a group, the outer electrons are in a shell farther from the nucleus, with more inner electrons shielding them, so they are easier to remove.',
  arrows: 'Higher → across a period. Lower ↓ down a group.'
 },
 en: {
  what: 'How strongly an atom pulls on the electrons it shares in a bond (Pauling scale, no units). Fluorine is the highest at 3.98. Helium, neon, and argon have no value because they form no ordinary bonds.',
  across: 'Across a period, more protons pull on the same shell, so the atom pulls shared electrons harder.',
  down: 'Down a group, the bonding electrons are farther from the nucleus and more shielded, so the pull is weaker.',
  arrows: 'Higher → across a period. Lower ↓ down a group. Fluorine, top right, is the highest.'
 }
};

type Pair = { p: Property; a: string; b: string; exception?: string };
const pairs: Pair[] = [
 { p: 'radius', a: 'Na', b: 'Cl' },
 { p: 'radius', a: 'F', b: 'I' },
 { p: 'ie', a: 'Li', b: 'K' },
 { p: 'ie', a: 'Na', b: 'Ar' },
 { p: 'en', a: 'C', b: 'F' },
 { p: 'en', a: 'S', b: 'O' },
 { p: 'radius', a: 'Mg', b: 'Rb' },
 { p: 'ie', a: 'N', b: 'O', exception: 'Oxygen\'s eighth electron is the first that has to share a small region of space (an orbital) with another electron in the outer shell. The two repel each other, so that electron is a little easier to remove. Trends describe the overall pattern, not every pair of neighbors.' },
 { p: 'ie', a: 'Be', b: 'B', exception: 'Boron\'s fifth electron starts a new, slightly higher-energy part of the shell (a 2p orbital), partly shielded by the two electrons below it, so it is easier to remove than beryllium\'s outer electrons.' }
];
const question = (p: Property) => p === 'radius' ? 'is larger' : p === 'ie' ? 'has the higher first ionization energy' : 'is more electronegative';

function why(pair: Pair) {
 const A = bySym(pair.a), B = bySym(pair.b), t = about[pair.p];
 if (A.period === B.period) return `${A.sym} and ${B.sym} are both in period ${A.period}. ${t.across}`;
 if (A.group === B.group) return `${A.sym} and ${B.sym} are both in group ${A.group}. ${t.down}`;
 return `${A.sym} and ${B.sym} differ in both row and column, and here both trends point the same way. ${t.down} ${t.across}`;
}

// Light-to-dark scale; text switches to white on the darker half.
function shade(t: number): CSSProperties {
 const l = 95 - t * 73;
 return { background: `hsl(185 ${38 + t * 22}% ${l}%)`, color: l < 52 ? '#fff' : '#183043' };
}

export default function Trends() {
 const [prop, setProp] = useState<Property>('radius');
 const [qi, setQi] = useState(0);
 const [pickd, setPickd] = useState<string | null>(null);
 const [score, setScore] = useState<boolean[]>([]);
 const [look, setLook] = useState<number | null>(null);
 const P = properties[prop];
 const vals = mainGroup.map(P.get).filter((v): v is number => v !== null);
 const lo = Math.min(...vals), hi = Math.max(...vals);

 const pair = pairs[qi], done = qi >= pairs.length;
 const PA = pair && bySym(pair.a), PB = pair && bySym(pair.b);
 const winner = pair && (properties[pair.p].get(PA)! > properties[pair.p].get(PB)! ? pair.a : pair.b);
 const highlight = pair && pickd ? [PA.z, PB.z] : [];

 function choose(s: string) {
  if (pickd) return;
  setPickd(s); setProp(pair.p); setScore(sc => [...sc, s === winner]);
 }
 const next = () => { setQi(i => i + 1); setPickd(null); if (qi + 1 < pairs.length) setProp(pairs[qi + 1].p); };

 const cell = (e: Element) => {
  const v = P.get(e);
  if (v === null) return { className: 'blank', value: '—', note: `${P.label}: no value` };
  return { style: shade((v - lo) / (hi - lo)), value: fmt(prop, v), note: `${P.label} ${fmt(prop, v)}${P.unit ? ' ' + P.unit : ''}` };
 };

 return <div className="cb-panel">
  <h3>Patterns across the table</h3>
  <p>Because the table is arranged by shells and valence electrons, measured properties change in a regular way across rows and down columns. Pick a property and look for the pattern before reading the explanation.</p>
  <div className="cb-seg" role="group" aria-label="Property to color the table by">
   {(Object.keys(properties) as Property[]).map(p => <button key={p} aria-pressed={prop === p} onClick={() => setProp(p)}>{properties[p].label}</button>)}
  </div>
  <p className="cb-aside">{about[prop].what}</p>
  <PeriodicTable view="main" selected={highlight.length ? highlight : look ? [look] : []} onPick={e => setLook(e.z)} cell={cell} label={`Main-group elements colored by ${P.label.toLowerCase()}`} />
  <div className="cb-scale" aria-hidden="true"><span>{fmt(prop, lo)}</span><i style={{ background: `linear-gradient(90deg, hsl(185 38% 95%), hsl(185 60% 22%))` }} /><span>{fmt(prop, hi)} {P.unit}</span></div>
  <p className="cb-readout-line" aria-live="polite">{look ? (() => { const e = byZ(look), v = P.get(e); return <><strong>{e.name}</strong>: {v === null ? 'no value' : `${fmt(prop, v)} ${P.unit}`}</>; })() : 'Click any element to read its value.'}</p>
  <details className="cb-details">
   <summary>Why does {P.label.toLowerCase()} follow this pattern?</summary>
   <p><strong>{about[prop].arrows}</strong></p>
   <p>{about[prop].across}</p>
   <p>{about[prop].down}</p>
   {prop === 'radius' && <p>Notice that the values barely change across the right side of periods 4 and 5 (Ga to Br, In to I). The trend is strongest at the left of each row.</p>}
   {prop === 'ie' && <p>Look closely at Be and B, and at N and O. Both pairs break the pattern by a little. The prediction round below explains why.</p>}
  </details>

  <div className="cb-check">
   <h3>Predict, then check</h3>
   {!done ? <>
    <p className="cb-eyebrow">QUESTION {qi + 1} OF {pairs.length}</p>
    <p>Using the patterns, which atom <strong>{question(pair.p)}</strong>?</p>
    <div className="cb-row" role="group" aria-label="Choose an element">
     {[PA, PB].map(e => <button key={e.sym} className="cb-choice" aria-pressed={pickd === e.sym} disabled={!!pickd && pickd !== e.sym} onClick={() => choose(e.sym)}>
      <strong>{e.sym}</strong> {e.name}
     </button>)}
    </div>
    <div aria-live="polite">{pickd && <div className={`cb-feedback ${pickd === winner ? 'good' : pair.exception ? 'info' : 'bad'}`}>
     <p><strong>{pickd === winner ? 'Right. ' : pair.exception ? 'That is what the trend predicts, but the data disagree. ' : 'Not this time. '}</strong>
      {properties[pair.p].label}: {PA.sym} {fmt(pair.p, properties[pair.p].get(PA)!)}, {PB.sym} {fmt(pair.p, properties[pair.p].get(PB)!)}{properties[pair.p].unit && ' ' + properties[pair.p].unit}. {winner} {question(pair.p)}.</p>
     <p>{pair.exception ? <><strong>An exception.</strong> {pair.exception}</> : why(pair)}</p>
    </div>}</div>
    {pickd && <button className="cb-primary" onClick={next}>{qi + 1 < pairs.length ? 'Next pair →' : 'See how I did'}</button>}
   </> : <>
    <p><strong>{score.filter(Boolean).length} of {pairs.length}</strong> matched the data. The last two pairs are real exceptions, so following the trend there was a good prediction.</p>
    <p>One idea explains all three trends: <strong>how strongly the nucleus pulls on the outer electrons.</strong> More protons in the same shell means a stronger pull; another shell farther out means a weaker one.</p>
    <button onClick={() => { setQi(0); setPickd(null); setScore([]); setProp(pairs[0].p); }}>Start over</button>
   </>}
  </div>
 </div>;
}
