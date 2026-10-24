import { useState } from 'react';
import { bySym, valence } from './elements';

type Mol = { id: string; formula: string; name: string; atoms: { el: string; x: number; y: number }[]; bonds: [number, number][]; shape: string };
const H = (x: number, y: number) => ({ el: 'H', x, y });
const MOLS: Mol[] = [
 { id: 'h2', formula: 'H₂', name: 'hydrogen', atoms: [H(115, 100), H(185, 100)], bonds: [[0, 1]], shape: 'Two atoms always sit on a line.' },
 { id: 'hcl', formula: 'HCl', name: 'hydrogen chloride', atoms: [H(110, 100), { el: 'Cl', x: 190, y: 100 }], bonds: [[0, 1]], shape: 'Two atoms always sit on a line.' },
 { id: 'h2o', formula: 'H₂O', name: 'water', atoms: [{ el: 'O', x: 150, y: 85 }, H(95, 140), H(205, 140)], bonds: [[0, 1], [0, 2]], shape: 'Bent, with an H–O–H angle of about 104.5°. The two lone pairs push the hydrogens together.' },
 { id: 'nh3', formula: 'NH₃', name: 'ammonia', atoms: [{ el: 'N', x: 150, y: 85 }, H(88, 128), H(150, 158), H(212, 128)], bonds: [[0, 1], [0, 2], [0, 3]], shape: 'A low pyramid (trigonal pyramidal), H–N–H about 107°, with the lone pair on top.' },
 { id: 'ch4', formula: 'CH₄', name: 'methane', atoms: [{ el: 'C', x: 150, y: 100 }, H(150, 38), H(215, 100), H(150, 162), H(85, 100)], bonds: [[0, 1], [0, 2], [0, 3], [0, 4]], shape: 'Drawn flat here, but really a tetrahedron with 109.5° between bonds.' },
 { id: 'o2', formula: 'O₂', name: 'oxygen', atoms: [{ el: 'O', x: 115, y: 100 }, { el: 'O', x: 185, y: 100 }], bonds: [[0, 1]], shape: 'Two atoms always sit on a line.' },
 { id: 'n2', formula: 'N₂', name: 'nitrogen', atoms: [{ el: 'N', x: 115, y: 100 }, { el: 'N', x: 185, y: 100 }], bonds: [[0, 1]], shape: 'Two atoms always sit on a line. The triple bond is one of the strongest bonds known, which is why the N₂ in air is so unreactive.' },
 { id: 'co2', formula: 'CO₂', name: 'carbon dioxide', atoms: [{ el: 'O', x: 75, y: 100 }, { el: 'C', x: 150, y: 100 }, { el: 'O', x: 225, y: 100 }], bonds: [[1, 0], [1, 2]], shape: 'Linear (180°). Each C=O bond is polar, but they point in opposite directions and cancel, so the molecule as a whole is nonpolar.' },
 { id: 'hcn', formula: 'HCN', name: 'hydrogen cyanide', atoms: [H(70, 100), { el: 'C', x: 145, y: 100 }, { el: 'N', x: 225, y: 100 }], bonds: [[0, 1], [1, 2]], shape: 'Linear (180°).' },
 { id: 'ch2o', formula: 'CH₂O', name: 'formaldehyde', atoms: [{ el: 'C', x: 140, y: 100 }, { el: 'O', x: 220, y: 100 }, H(85, 52), H(85, 148)], bonds: [[0, 1], [0, 2], [0, 3]], shape: 'Flat (trigonal planar), with angles near 120°.' },
 { id: 'c2h4', formula: 'C₂H₄', name: 'ethene (ethylene)', atoms: [{ el: 'C', x: 120, y: 100 }, { el: 'C', x: 180, y: 100 }, H(72, 55), H(72, 145), H(228, 55), H(228, 145)], bonds: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5]], shape: 'Flat, with angles near 120°. The double bond keeps the two ends from twisting.' }
];
const ORDER = ['none', 'single', 'double', 'triple'];
const target = (el: string) => el === 'H' ? 2 : 8;
// Bonds an atom needs to reach a full shell: 1 for hydrogen, 8 − valence for the rest.
const needBonds = (el: string, v: number) => el === 'H' ? 1 : 8 - v;
const angDist = (a: number, b: number) => { const d = Math.abs(a - b) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d); };

/** Spread lone pairs into the directions farthest from the atom's bonds (and from each other). */
function lonePairAngles(fixed: number[], count: number) {
 const best = (taken: number[]) => {
  let pick = -Math.PI / 2, bestD = -1;
  for (let i = 0; i < 48; i++) {
   const a = -Math.PI / 2 + (i * Math.PI) / 24;
   const d = taken.length ? Math.min(...taken.map(t => angDist(a, t))) : Math.PI - angDist(a, -Math.PI / 2);
   if (d > bestD + 1e-6) { bestD = d; pick = a; }
  }
  return pick;
 };
 const out: number[] = [];
 for (let k = 0; k < count; k++) out.push(best([...fixed, ...out]));
 // A few passes of moving each one to the best spot given the others evens out the spacing.
 for (let pass = 0; pass < 3 && count > 1; pass++) for (let k = 0; k < count; k++) out[k] = best([...fixed, ...out.filter((_, j) => j !== k)]);
 return out;
}

export default function Covalent() {
 const [mi, setMi] = useState(0);
 const mol = MOLS[mi];
 const [orders, setOrders] = useState<number[]>(() => mol.bonds.map(() => 0));
 const [charges, setCharges] = useState(false);
 const load = (i: number) => { setMi(i); setOrders(MOLS[i].bonds.map(() => 0)); };
 const setOrder = (k: number, o: number) => setOrders(os => os.map((x, j) => j === k ? o : x));

 const info = mol.atoms.map((a, i) => {
  const v = valence(bySym(a.el));
  const b = mol.bonds.reduce((s, [p, q], k) => s + (p === i || q === i ? orders[k] : 0), 0);
  // Unpaired electrons are the ones still free to make bonds; the rest of the unshared electrons sit in lone pairs.
  const lone = v - b, t = needBonds(a.el, v);
  const unpaired = lone < 0 ? 0 : b <= t ? Math.min(t - b, lone) : lone % 2;
  return { ...a, v, b, lone, unpaired, pairs: lone < 0 ? 0 : (lone - unpaired) / 2, around: v + b, want: target(a.el) };
 });
 const ok = info.every(a => a.lone >= 0 && a.around === a.want);
 const totalV = info.reduce((s, a) => s + a.v, 0), shared = 2 * orders.reduce((s, o) => s + o, 0);

 function problem(a: (typeof info)[number]) {
  const E = bySym(a.el);
  if (a.lone < 0) return a.el === 'H' ? 'H has only 1 electron, so it can form only one bond.' : `${a.el} has only ${a.v} valence electrons, so it cannot form ${a.b} bonds.`;
  if (a.around > a.want) return `${a.el} would be surrounded by ${a.around} electrons. ${E.name}'s outer shell holds only ${a.want}.`;
  if (a.around < a.want) return `${a.el} has ${a.around} electron${a.around === 1 ? '' : 's'} around it: ${a.want - a.around} short of ${a.want}. ${a.unpaired ? `Pair ${a.unpaired === 1 ? 'its unpaired electron' : `its ${a.unpaired} unpaired electrons`} with a neighbor's to make ${a.unpaired === 1 ? 'a bond' : 'more bonds'}.` : 'It needs to share more.'}`;
  return null;
 }
 const problems = info.map(problem).filter(Boolean) as string[];

 // Partial charges on polar bonds (electronegativity difference of 0.4 or more).
 const delta = info.map(() => ({ plus: false, minus: false }));
 mol.bonds.forEach(([p, q], k) => {
  if (!orders[k]) return;
  const ep = bySym(mol.atoms[p].el).data!.en!, eq = bySym(mol.atoms[q].el).data!.en!;
  if (Math.abs(ep - eq) < 0.4) return;
  const [lo, hi] = ep < eq ? [p, q] : [q, p];
  delta[lo].plus = true; delta[hi].minus = true;
 });

 const pairName = (k: number) => { const [p, q] = mol.bonds[k]; return `${mol.atoms[p].el}–${mol.atoms[q].el}`; };
 // Number repeated bonds ("C–H 1", "C–H 2") so each button row has its own label.
 const bondLabel = (k: number) => {
  const same = mol.bonds.map((_, j) => j).filter(j => pairName(j) === pairName(k));
  return same.length > 1 ? `${pairName(k)} ${same.indexOf(k) + 1}` : pairName(k);
 };
 const loneText = (a: (typeof info)[number]) => {
  if (a.pairs + a.unpaired === 0) return 'no unshared electrons';
  return [a.pairs ? `${a.pairs} lone pair${a.pairs > 1 ? 's' : ''}` : '', a.unpaired ? `${a.unpaired} unpaired electron${a.unpaired > 1 ? 's' : ''}` : ''].filter(Boolean).join(' and ');
 };
 // Fit the drawing to the molecule so small molecules aren't lost in empty space.
 const xs = mol.atoms.map(a => a.x), ys = mol.atoms.map(a => a.y), pad = 44;
 const w = Math.max(Math.max(...xs) - Math.min(...xs) + 2 * pad, 200), h = Math.max(Math.max(...ys) - Math.min(...ys) + 2 * pad, 120);
 const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
 const box = `${cx - w / 2} ${cy - h / 2} ${w} ${h}`;
 const describe = `${mol.name}: ${mol.bonds.map((_, k) => `${orders[k] ? ORDER[orders[k]] + ' bond' : 'no bond'} ${bondLabel(k)}`).join(', ')}. ` +
  info.map(a => `${a.el} has ${loneText(a)} and ${a.around} electrons around it`).join('; ');
 const tally = new Map<string, number>();
 const shown = new Map<string, string>(); // the first way each pair is written, e.g. "O–H"
 mol.bonds.forEach(([p, q], k) => {
  const key = `${ORDER[orders[k]]}|${[mol.atoms[p].el, mol.atoms[q].el].sort().join()}`;
  tally.set(key, (tally.get(key) ?? 0) + 1);
  if (!shown.has(key)) shown.set(key, pairName(k));
 });
 const summary = [...tally].map(([key, n]) => { const o = key.split('|')[0], pr = shown.get(key); return n === 1 ? `a ${o} bond (${pr})` : `${n} ${o} bonds (${pr})`; });

 return <div className="cb-panel">
  <h3>Covalent bonds: sharing pairs</h3>
  <p>When two nonmetals meet, neither can pull electrons all the way off the other. Instead they <strong>share</strong> pairs of electrons. Each shared pair is a <strong>covalent bond</strong>, and a shared electron counts toward the outer shell of both atoms. Two shared pairs make a double bond, three a triple bond.</p>
  <p>The atoms start side by side, unbonded, each showing its valence electrons. The <strong>unpaired</strong> electrons (orange) are the ones free to share. Set each bond to single, double, or triple until every atom has a full shell: 8 electrons around it, or 2 for hydrogen. Electrons that stay unshared sit in <strong>lone pairs</strong> (teal).</p>
  <div className="cb-chips" role="group" aria-label="Choose a molecule">
   {MOLS.map((m, i) => <button key={m.id} aria-pressed={mi === i} onClick={() => load(i)}>{m.formula}</button>)}
  </div>

  <div className="cb-two">
   <figure className="cb-figure cb-mol">
    <svg viewBox={box} role="img" aria-label={describe}>
     {mol.bonds.map(([p, q], k) => {
      const A = mol.atoms[p], B = mol.atoms[q], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, r = 17;
      const offs = [[], [0], [-4.5, 4.5], [-7, 0, 7]][orders[k]];
      return <g key={k} className="cb-bond" onClick={() => setOrder(k, (orders[k] + 1) % 4)}>
       {!orders[k] && <line x1={A.x + ux * r} y1={A.y + uy * r} x2={B.x - ux * r} y2={B.y - uy * r} className="cb-bond-guide" />}
       <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="cb-bond-hit" />
       {offs.map(o => <line key={o} x1={A.x + ux * r - uy * o} y1={A.y + uy * r + ux * o} x2={B.x - ux * r - uy * o} y2={B.y - uy * r + ux * o} />)}
      </g>;
     })}
     {info.map((a, i) => {
      // Unpaired electrons face the neighbors they could still bond with; lone pairs go where there is room.
      const nbrs = mol.bonds.map(([p, q], k) => ({ p, q, k })).filter(({ p, q }) => p === i || q === i)
       .map(({ p, q, k }) => { const o = mol.atoms[p === i ? q : p]; return { t: Math.atan2(o.y - a.y, o.x - a.x), bonded: orders[k] > 0 }; });
      const toward = nbrs.filter(n => !n.bonded).map(n => n.t).slice(0, a.unpaired);
      const rest = lonePairAngles([...nbrs.map(n => n.t), ...toward], a.pairs + a.unpaired - toward.length);
      const angles = [...rest.slice(0, a.pairs), ...toward, ...rest.slice(a.pairs)];
      const labelAt = lonePairAngles([...nbrs.map(n => n.t), ...angles], 1)[0];
      const bad = a.lone < 0 || a.around > a.want;
      return <g key={i}>
       <text x={a.x} y={a.y} textAnchor="middle" dominantBaseline="central" className={`cb-mol-sym ${bad ? 'bad' : ''}`}>{a.el}</text>
       {angles.map((t, k) => {
        const cx = a.x + Math.cos(t) * 23, cy = a.y + Math.sin(t) * 23, px = -Math.sin(t) * 4.5, py = Math.cos(t) * 4.5;
        return k >= a.pairs ? <circle key={k} cx={cx} cy={cy} r={3.6} className="cb-e unp" />
         : <g key={k}><circle cx={cx + px} cy={cy + py} r={3.2} className="cb-e lone" /><circle cx={cx - px} cy={cy - py} r={3.2} className="cb-e lone" /></g>;
       })}
       {charges && (delta[i].plus || delta[i].minus) && <text x={a.x + Math.cos(labelAt) * 30} y={a.y + Math.sin(labelAt) * 30} textAnchor="middle" dominantBaseline="central" className={`cb-delta ${delta[i].minus ? 'minus' : 'plus'}`}>δ{delta[i].minus ? '−' : '+'}</text>}
      </g>;
     })}
    </svg>
    <figcaption>{mol.formula}, {mol.name}. Click a bond, or use the buttons, to change it. {mol.shape}</figcaption>
   </figure>
   <div>
    <div className="cb-bonds">
     {mol.bonds.map((_, k) => <div key={k} className="cb-bond-row">
      <span className="cb-label">{bondLabel(k)}</span>
      <div className="cb-seg" role="group" aria-label={`Bond ${bondLabel(k)}`}>
       {ORDER.map((o, j) => <button key={o} aria-pressed={orders[k] === j} onClick={() => setOrder(k, j)}>{o}</button>)}
      </div>
     </div>)}
    </div>
    <table className="cb-table-small">
     <caption>Electrons around each atom</caption>
     <thead><tr><th>Atom</th><th>Valence e⁻</th><th>In bonds</th><th>Unshared</th><th>Total</th></tr></thead>
     <tbody>{info.map((a, i) => <tr key={i} className={a.lone < 0 || a.around > a.want ? 'bad' : problem(a) ? '' : 'ok'}><td>{a.el}</td><td>{a.v}</td><td>{2 * a.b}</td><td>{Math.max(0, a.lone)}</td><td>{a.lone < 0 ? '—' : a.around} {problem(a) ? '' : '✓'}</td></tr>)}</tbody>
    </table>
    <p className="cb-aside">Electron count: {totalV} valence electrons in all{info.every(a => a.lone >= 0) ? `, ${shared} in bonds and ${totalV - shared} unshared` : ''}. Shared electrons are counted for both atoms, so the totals add up to more than {totalV}.</p>
    <label className="cb-toggle"><input type="checkbox" checked={charges} onChange={e => setCharges(e.target.checked)} /> Show partial charges (δ+ and δ−) on polar bonds</label>
   </div>
  </div>
  <div aria-live="polite">
   {ok ? <div className="cb-feedback good">
    <p><strong>Every atom has a full shell.</strong> {mol.formula} has {summary.length > 1 ? `${summary.slice(0, -1).join(', ')} and ${summary[summary.length - 1]}` : summary[0]}.</p>
    <p className="cb-aside">Pattern: H forms 1 bond, O forms 2, N forms 3, C forms 4. Each atom shares exactly as many electrons as it needs to reach 8 (or 2).</p>
    {mi < MOLS.length - 1 && <button className="cb-primary" onClick={() => load(mi + 1)}>Next: {MOLS[mi + 1].formula} →</button>}
   </div> : orders.every(o => o === 0)
    ? <p className="cb-feedback info">No bonds yet. Every atom here is short of a full shell. Click a dashed line, or choose <strong>single</strong>, to let two atoms share a pair.</p>
    : <div className="cb-feedback info"><ul>{problems.map((p, i) => <li key={i}>{p}</li>)}</ul></div>}
  </div>
  <div className="cb-explain">
   <p><strong>Shortcut.</strong> A nonmetal with <em>v</em> valence electrons needs 8 − <em>v</em> more, so it usually forms 8 − <em>v</em> bonds: carbon 4, nitrogen 3, oxygen 2, the halogens 1. Hydrogen needs 1 more to reach 2.</p>
   <p><strong>What the drawing leaves out.</strong> Lewis structures count electrons; they don't show where electrons are. This builder only handles molecules where every atom keeps its own share of electrons (no formal charges), and it uses the octet rule, which has real exceptions (for example BF₃ and SF₆). The O₂ drawing is the standard Lewis structure, though experiments show O₂ has two unpaired electrons, something only a more advanced model explains.</p>
  </div>
 </div>;
}
