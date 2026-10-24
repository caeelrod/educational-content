import { useId, useState } from 'react';
import { bySym, kind, mainGroup } from './elements';
import { useNarrow } from './PeriodicTable';

const choices = mainGroup.filter(e => e.group !== 18);
const EXAMPLES: [string, string][] = [['H', 'H'], ['C', 'H'], ['N', 'H'], ['O', 'H'], ['H', 'Cl'], ['H', 'F'], ['C', 'O'], ['Na', 'Cl'], ['Mg', 'O'], ['K', 'F'], ['Li', 'I'], ['Si', 'F'], ['Na', 'K']];
const MAXD = 3.2;

export type BondType = 'nonpolar' | 'polar' | 'ionic';
export const bondType = (d: number): BondType => d < 0.4 ? 'nonpolar' : d <= 1.8 ? 'polar' : 'ionic';
export const bondLabel: Record<BondType, string> = { nonpolar: 'Nonpolar covalent', polar: 'Polar covalent', ionic: 'Ionic' };
export const isMetal = (s: string) => kind(bySym(s)) === 'metal';

function Picker({ label, value, onChange }: { label: string; value: string; onChange: (s: string) => void }) {
 const id = useId();
 return <div className="cb-picker">
  <label htmlFor={id} className="cb-label">{label}</label>
  <select id={id} value={value} onChange={e => onChange(e.target.value)}>
   {[1, 2, 3, 4, 5].map(p => <optgroup key={p} label={`Period ${p}`}>
    {choices.filter(e => e.period === p).map(e => <option key={e.sym} value={e.sym}>{e.sym} · {e.name} ({e.data!.en!.toFixed(2)})</option>)}
   </optgroup>)}
  </select>
 </div>;
}

export default function Polarity() {
 const [a, setA] = useState('H');
 const [b, setB] = useState('Cl');
 const A = bySym(a), B = bySym(b), ea = A.data!.en!, eb = B.data!.en!;
 const d = Math.abs(ea - eb), t = bondType(d);
 const metals = [a, b].filter(isMetal).length;
 const pullB = eb > ea; // the shared pair moves toward B
 // Phones get a narrower drawing so the labels stay readable.
 const narrow = useNarrow(560);
 const W = narrow ? 360 : 600, xa = narrow ? 85 : 160, xb = W - xa, mid = (xa + xb) / 2;
 const ra = (narrow ? 16 : 22) + A.data!.radius / (narrow ? 10 : 7), rb = (narrow ? 16 : 22) + B.data!.radius / (narrow ? 10 : 7);
 // In an ionic bond the pair sits on the anion, just inside its edge.
 const shift = t === 'ionic' ? (xb - xa) / 2 - (pullB ? rb : ra) + 12 : Math.min(d / MAXD, 1) * (xb - xa) / 2 * 0.9;
 const px = metals === 2 ? mid : mid + (pullB ? shift : -shift);
 const signA = t === 'ionic' ? (pullB ? '+' : '−') : t === 'polar' ? (pullB ? 'δ+' : 'δ−') : '';
 const signB = t === 'ionic' ? (pullB ? '−' : '+') : t === 'polar' ? (pullB ? 'δ−' : 'δ+') : '';
 const sx = (v: number) => 24 + (v / MAXD) * (W - 48);

 let verdict: string;
 if (metals === 2) verdict = `Both are metals. Metal atoms don't pair up this way: in a piece of metal, every atom releases its valence electrons into a shared "sea" that holds the positive ions together. That is metallic bonding, and the electronegativity scale doesn't describe it.`;
 else if (metals === 1 && t !== 'ionic') verdict = `Here the two rules of thumb disagree. A metal with a nonmetal usually means ionic, but the difference of ${d.toFixed(2)} is under 1.8. Compounds like this are in between; chemists decide by testing properties such as a high melting point and whether the melted compound conducts electricity.`;
 else if (metals === 0 && t === 'ionic') verdict = `The difference of ${d.toFixed(2)} is over 1.8, but both are nonmetals or metalloids, which share electrons and form molecules rather than ions. Silicon and fluorine, for example, make SiF₄, a gas made of molecules. Treat this as a very polar covalent bond: the cutoffs are guides, not laws.`;
 else if (t === 'ionic') verdict = `The difference of ${d.toFixed(2)} is over 1.8, and it's a metal with a nonmetal: both rules say ionic. ${pullB ? b : a} pulls the bonding electrons all the way over, and the two ions attract.`;
 else if (t === 'polar') verdict = `The difference of ${d.toFixed(2)} is between 0.4 and 1.8: a polar covalent bond. The pair is shared unequally, so ${pullB ? b : a} carries a partial negative charge (δ−) and ${pullB ? a : b} a partial positive charge (δ+).`;
 else verdict = d === 0 ? 'Two identical atoms pull equally, so the pair is shared exactly evenly: a nonpolar covalent bond.' : `The difference of ${d.toFixed(2)} is under 0.4, so the pair is shared almost evenly: treated as nonpolar covalent.`;

 return <div className="cb-panel">
  <h3>Polar or ionic? A tug of war</h3>
  <p>Ionic and covalent are two ends of one scale. In every bond, both atoms pull on the bonding electrons; <strong>electronegativity</strong> measures how hard. Equal pulls give an even share. Unequal pulls give an uneven share (a <strong>polar</strong> bond). A very unequal pull takes the electron completely (an <strong>ionic</strong> bond).</p>
  <div className="cb-chips" role="group" aria-label="Example bonds">
   {EXAMPLES.map(([x, y]) => <button key={x + y} aria-pressed={a === x && b === y} onClick={() => { setA(x); setB(y); }}>{x}–{y}</button>)}
  </div>
  <div className="cb-row cb-pickers">
   <Picker label="Atom 1" value={a} onChange={setA} />
   <Picker label="Atom 2" value={b} onChange={setB} />
  </div>
  <figure className="cb-figure wide">
   <svg viewBox={`0 0 ${W} 260`} role="img" aria-label={`${A.name} (electronegativity ${ea.toFixed(2)}) and ${B.name} (${eb.toFixed(2)}). Difference ${d.toFixed(2)}. ${metals === 2 ? 'Metallic bonding.' : bondLabel[t] + '.'}`}>
    <defs>
     <radialGradient id="cb-cloud" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f2b42c" stopOpacity=".55" /><stop offset="100%" stopColor="#f2b42c" stopOpacity="0" /></radialGradient>
    </defs>
    {metals < 2 && <ellipse cx={px} cy={95} rx={(t === 'ionic' ? 70 : 110 - shift * 0.3) * (narrow ? 0.6 : 1)} ry={62} fill="url(#cb-cloud)" className="cb-cloud" />}
    <circle cx={xa} cy={95} r={ra} className={`cb-pull-atom ${isMetal(a) ? 'metal' : ''}`} />
    <circle cx={xb} cy={95} r={rb} className={`cb-pull-atom ${isMetal(b) ? 'metal' : ''}`} />
    <text x={xa} y={95} className="cb-pull-sym" textAnchor="middle" dominantBaseline="central">{a}</text>
    <text x={xb} y={95} className="cb-pull-sym" textAnchor="middle" dominantBaseline="central">{b}</text>
    {signA && <text x={xa} y={95 - ra - 10} textAnchor="middle" className={`cb-sign ${signA.includes('+') ? 'plus' : 'minus'}`}>{signA}</text>}
    {signB && <text x={xb} y={95 - rb - 10} textAnchor="middle" className={`cb-sign ${signB.includes('+') ? 'plus' : 'minus'}`}>{signB}</text>}
    {metals < 2 ? <g className="cb-pair">
     <circle cx={px - 6} cy={95} r={5} /><circle cx={px + 6} cy={95} r={5} />
    </g> : <g className="cb-sea">{Array.from({ length: 14 }, (_, i) => <circle key={i} cx={xa - 50 + i * (xb - xa + 100) / 13} cy={95 + (i % 2 ? 46 : -46)} r={4} />)}</g>}
    <text x={xa} y={180} textAnchor="middle" className="cb-en">{ea.toFixed(2)}</text>
    <text x={xb} y={180} textAnchor="middle" className="cb-en">{eb.toFixed(2)}</text>
    {/* the difference scale */}
    <rect x={sx(0)} y={210} width={sx(0.4) - sx(0)} height={14} className="cb-zone z1" />
    <rect x={sx(0.4)} y={210} width={sx(1.8) - sx(0.4)} height={14} className="cb-zone z2" />
    <rect x={sx(1.8)} y={210} width={sx(MAXD) - sx(1.8)} height={14} className="cb-zone z3" />
    {[0, 0.4, 1.8, MAXD].map(v => <text key={v} x={sx(v)} y={242} textAnchor="middle" className="cb-tick">{v === MAXD ? '3.2' : v}</text>)}
    <text x={(sx(0) + sx(0.4)) / 2} y={204} textAnchor="middle" className="cb-zone-label">{narrow ? 'non' : 'nonpolar'}</text>
    <text x={(sx(0.4) + sx(1.8)) / 2} y={204} textAnchor="middle" className="cb-zone-label">{narrow ? 'polar' : 'polar covalent'}</text>
    <text x={(sx(1.8) + sx(MAXD)) / 2} y={204} textAnchor="middle" className="cb-zone-label">ionic</text>
    {metals < 2 && <path d={`M${sx(Math.min(d, MAXD))},228 l-7,12 h14 z`} className="cb-marker" />}
   </svg>
   <figcaption>Circle sizes follow atomic radius. The orange cloud and pair show where the bonding electrons spend most of their time. Electronegativity values are on the Pauling scale; the bar shows the difference.</figcaption>
  </figure>
  <div className="cb-readout">
   <div><span>{A.name}</span><strong>{ea.toFixed(2)}</strong></div>
   <div><span>{B.name}</span><strong>{eb.toFixed(2)}</strong></div>
   <div><span>Difference</span><strong>{d.toFixed(2)}</strong></div>
   <div><span>Bond type</span><strong>{metals === 2 ? 'Metallic' : bondLabel[t]}</strong></div>
  </div>
  <p className={`cb-feedback ${metals === 1 && t !== 'ionic' || metals === 0 && t === 'ionic' ? 'info' : 'good'}`} aria-live="polite">{verdict}</p>
  <div className="cb-explain">
   <p><strong>Two rules of thumb.</strong> (1) Electronegativity difference: under 0.4 nonpolar covalent, 0.4 to 1.8 polar covalent, over 1.8 ionic. (2) Element types: two nonmetals share (covalent); a metal and a nonmetal transfer (ionic). Usually they agree. Try Li–I and Si–F to see where they don't.</p>
   <p><strong>It's a scale, not three boxes.</strong> Bonds change gradually from evenly shared to fully transferred. The cutoffs at 0.4 and 1.8 are a common textbook guide. Some books use other numbers, which is a hint that no sharp line exists.</p>
  </div>
 </div>;
}
