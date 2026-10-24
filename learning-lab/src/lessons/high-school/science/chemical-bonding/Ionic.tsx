import { useState } from 'react';
import { LewisSymbol } from './Atom';
import { anionName, bySym, charge, fmt, ionCharge, ionMatches, superscript, valence } from './elements';

const PAIRS: [string, string][] = [['Na', 'Cl'], ['Mg', 'O'], ['Ca', 'Cl'], ['Li', 'O'], ['K', 'S'], ['Al', 'F'], ['Mg', 'N'], ['Al', 'O']];
const MAX = 3;

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
/** Smallest whole-number ratio of metal to nonmetal ions whose charges cancel. */
export function ratio(m: string, n: string): [number, number] {
 const cm = ionCharge(bySym(m))!, cn = -ionCharge(bySym(n))!, l = cm * cn / gcd(cm, cn);
 return [l / cm, l / cn];
}
export function Formula({ m, n, a, b }: { m: string; n: string; a: number; b: number }) {
 return <span className="cb-formula">{m}{a > 1 && <sub>{a}</sub>}{n}{b > 1 && <sub>{b}</sub>}</span>;
}
export const formulaText = (m: string, n: string, a: number, b: number) => `${m}${a > 1 ? a : ''}${n}${b > 1 ? b : ''}`;
/** "Al2O3" written with subscript digits, "Al₂O₃", for running text. */
export const formulaSub = (f: string) => f.replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[+d]);

/** The right ratio plus the usual wrong ones: swapped, one-to-one, and a near miss. */
export function formulaOptions(m: string, n: string): [number, number][] {
 const [a, b] = ratio(m, n);
 const opts: [number, number][] = [[a, b], [b, a], [1, 1], [a === 1 ? 2 : a - 1, b], [a, b + 1], [1, 2], [2, 1]];
 const seen = new Set<string>(), out: [number, number][] = [];
 for (const o of opts) { const k = o.join(':'); if (!seen.has(k)) { seen.add(k); out.push(o); } }
 return out.slice(0, 4).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

type State = { metals: number[]; got: number[] };

export default function Ionic() {
 const [pi, setPi] = useState(0);
 const [m, n] = PAIRS[pi];
 const M = bySym(m), N = bySym(n), vm = valence(M), vn = valence(N), need = 8 - vn;
 const fresh = (cm: number, cn: number): State => ({ metals: Array(cm).fill(vm), got: Array(cn).fill(0) });
 const [st, setSt] = useState<State>(() => fresh(1, 1));
 const [hist, setHist] = useState<State[]>([]);
 const [sel, setSel] = useState<number | null>(0);
 const [msg, setMsg] = useState('Pick a metal atom, then the nonmetal atom it should give an electron to.');
 const [guess, setGuess] = useState<string | null>(null);

 function load(i: number) {
  const [mm] = PAIRS[i];
  setPi(i); setSt({ metals: [valence(bySym(mm))], got: [0] }); setHist([]); setSel(0); setGuess(null);
  setMsg('Pick a metal atom, then the nonmetal atom it should give an electron to.');
 }
 const reset = (cm: number, cn: number, note: string) => { setSt(fresh(cm, cn)); setHist([]); setSel(0); setMsg(note); };
 function addMetal() { if (st.metals.length < MAX) { setHist(h => [...h, st]); setSt(s => ({ ...s, metals: [...s.metals, vm] })); setMsg(`Added another ${M.name.toLowerCase()} atom.`); } }
 function addNon() { if (st.got.length < MAX) { setHist(h => [...h, st]); setSt(s => ({ ...s, got: [...s.got, 0] })); setMsg(`Added another ${N.name.toLowerCase()} atom.`); } }
 const undo = () => { if (hist.length) { setSt(hist[hist.length - 1]); setHist(h => h.slice(0, -1)); setMsg('Undid the last step.'); } };

 function pickMetal(i: number) {
  if (st.metals[i] === 0) { setMsg(`That ${m} has already given away all ${vm} valence electron${vm > 1 ? 's' : ''}. What is left underneath is a full shell like ${ionMatches(M)}'s, and taking from it would cost far more energy.`); return; }
  setSel(i); setMsg(`${m} atom ${i + 1} is ready to give an electron. Now pick a ${n} atom.`);
 }
 function pickNon(j: number) {
  if (st.got[j] >= need) { setMsg(`That ${n} already has 8 electrons in its outer shell. Another electron would have to start a new shell farther out, so it won't take one.`); return; }
  const i = sel !== null && st.metals[sel] > 0 ? sel : st.metals.findIndex(x => x > 0);
  if (i < 0) { setMsg(`Every ${m} atom has given all its valence electrons. Add another ${m} atom to supply more.`); return; }
  const next: State = { metals: st.metals.map((x, k) => k === i ? x - 1 : x), got: st.got.map((x, k) => k === j ? x + 1 : x) };
  setHist(h => [...h, st]); setSt(next);
  if (next.metals[i] === 0) { const k = next.metals.findIndex(x => x > 0); setSel(k < 0 ? null : k); }
  setMsg(status(next));
 }

 function status(s: State) {
  const left = s.metals.filter(x => x > 0).length, short = s.got.filter(x => x < need);
  if (!left && !short.length) return '';
  if (!left) return `Every ${m} has given away its valence electrons, but ${short.length === 1 ? `a ${n} atom still needs` : `${short.length} ${n} atoms still need`} more. Add another ${m} atom.`;
  if (!short.length) return `Every ${n} has a full shell, but ${m} still has electrons to give. Add another ${n} atom.`;
  return `Moved one electron. ${left} ${m} atom${left > 1 ? 's' : ''} can still give, and ${short.length} ${n} atom${short.length > 1 ? 's' : ''} still need${short.length > 1 ? '' : 's'} more.`;
 }

 const done = st.metals.every(x => x === 0) && st.got.every(x => x === need);
 const [a, b] = ratio(m, n), g = gcd(st.metals.length, st.got.length);
 const cm = ionCharge(M)!, cn = ionCharge(N)!;
 const opts = formulaOptions(m, n);

 return <div className="cb-panel">
  <h3>Ionic bonds: give and take</h3>
  <p>A metal atom holds its few valence electrons loosely (low ionization energy). A nonmetal atom pulls hard on electrons (high electronegativity). When they meet, electrons move from the metal to the nonmetal until both have a full outer shell. The metal becomes a positive ion, the nonmetal a negative ion, and the opposite charges attract: that attraction is the <strong>ionic bond</strong>.</p>
  <div className="cb-chips" role="group" aria-label="Choose a metal and nonmetal">
   {PAIRS.map(([x, y], i) => <button key={x + y} aria-pressed={pi === i} onClick={() => load(i)}>{x} + {y}</button>)}
  </div>

  <div className="cb-predict">
   <p><strong>Predict first:</strong> in what ratio will {M.name.toLowerCase()} and {N.name.toLowerCase()} combine?</p>
   <div className="cb-chips" role="group" aria-label="Predicted formula">
    {opts.map(([x, y]) => { const k = formulaText(m, n, x, y); return <button key={k} aria-pressed={guess === k} onClick={() => setGuess(k)}><Formula m={m} n={n} a={x} b={y} /></button>; })}
   </div>
  </div>

  <div className="cb-ionic" role="group" aria-label="Atoms">
   <div className="cb-side">
    <p className="cb-eyebrow">METAL · {M.name.toUpperCase()} · {vm} VALENCE e⁻</p>
    <div className="cb-atoms">
     {st.metals.map((x, i) => { const c = vm - x; return <button key={i} className={`cb-atom metal ${sel === i ? 'sel' : ''}`} aria-pressed={sel === i}
      aria-label={`${M.name} atom ${i + 1}: ${x} valence electron${x === 1 ? '' : 's'} left${c ? `, now the ion ${m}${superscript(c)}` : ''}`} onClick={() => pickMetal(i)}>
      <svg viewBox="0 0 100 100" aria-hidden="true">{x === 0 && <circle cx="50" cy="50" r="30" className="cb-lost" />}<LewisSymbol x={50} y={50} sym={m} dots={Array(x).fill('m')} sup={charge(c)} /></svg>
     </button>; })}
     <div className="cb-addrm">
      <button onClick={addMetal} disabled={st.metals.length >= MAX} aria-label={`Add a ${M.name.toLowerCase()} atom`}>+ {m}</button>
      <button onClick={() => reset(Math.max(1, st.metals.length - 1), st.got.length, `Removed a ${m} atom and started the transfers over.`)} disabled={st.metals.length <= 1} aria-label={`Remove a ${M.name.toLowerCase()} atom`}>− {m}</button>
     </div>
    </div>
   </div>
   <div className="cb-arrow" aria-hidden="true"><span className="cb-wide">e⁻ →</span><span className="cb-narrow">e⁻ ↓</span></div>
   <div className="cb-side">
    <p className="cb-eyebrow">NONMETAL · {N.name.toUpperCase()} · {vn} VALENCE e⁻</p>
    <div className="cb-atoms">
     {st.got.map((x, j) => <button key={j} className="cb-atom non" aria-label={`${N.name} atom ${j + 1}: ${vn + x} outer electrons${x ? `, ${x} received, now ${n}${superscript(-x)}` : ''}`} onClick={() => pickNon(j)}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><LewisSymbol x={50} y={50} sym={n} dots={[...Array(vn).fill('n'), ...Array(x).fill('m')]} sup={charge(-x)} brackets={x === need} size={0.92} /></svg>
     </button>)}
     <div className="cb-addrm">
      <button onClick={addNon} disabled={st.got.length >= MAX} aria-label={`Add a ${N.name.toLowerCase()} atom`}>+ {n}</button>
      <button onClick={() => reset(st.metals.length, Math.max(1, st.got.length - 1), `Removed a ${n} atom and started the transfers over.`)} disabled={st.got.length <= 1} aria-label={`Remove a ${N.name.toLowerCase()} atom`}>− {n}</button>
     </div>
    </div>
   </div>
  </div>
  <div className="cb-row">
   <button onClick={undo} disabled={!hist.length}>Undo</button>
   <button onClick={() => reset(1, 1, 'Started over with one atom of each.')}>Start over</button>
   <span className="cb-aside"><i className="cb-dot m" /> electrons that started on {m} · <i className="cb-dot n" /> {n}'s own electrons</span>
  </div>
  <div aria-live="polite">
   {!done && msg && <p className="cb-feedback info">{msg}</p>}
   {done && <div className="cb-feedback good">
    <p><strong>Every atom now has a full outer shell.</strong> {st.metals.length} {m}{superscript(cm)} ion{st.metals.length > 1 ? 's' : ''} and {st.got.length} {n}{superscript(cn)} ion{st.got.length > 1 ? 's' : ''}: total charge {st.metals.length} × (+{cm}) + {st.got.length} × (−{-cn}) = 0.</p>
    <p>Formula: <strong><Formula m={m} n={n} a={a} b={b} /></strong> ({M.name.toLowerCase()} {anionName[n]}).{g > 1 && ` You used ${st.metals.length} and ${st.got.length}; a formula uses the smallest whole-number ratio, ${a} : ${b}.`}</p>
    {guess && <p>{guess === formulaText(m, n, a, b) ? 'Your prediction was right.' : `You predicted ${formulaSub(guess)}. Charges must cancel: ${m}${superscript(cm)} and ${n}${superscript(cn)} only balance at ${a} : ${b}.`}</p>}
    <p className="cb-aside">{m}{superscript(cm)} has the electron arrangement of {ionMatches(M)} and {n}{superscript(cn)} the arrangement of {ionMatches(N)}.</p>
    {pi < PAIRS.length - 1 && <button className="cb-primary" onClick={() => load(pi + 1)}>Next pair: {PAIRS[pi + 1].join(' + ')} →</button>}
   </div>}
  </div>
  <div className="cb-explain">
   <p><strong>Why the metal gives and the nonmetal takes.</strong> Removing {m}'s first electron takes {fmt('ie', M.data!.ie)} kJ/mol; removing one from {n} would take {fmt('ie', N.data!.ie)} kJ/mol. {n} has the higher electronegativity ({fmt('en', N.data!.en!)} against {fmt('en', M.data!.en!)}), so the electrons end up on {n}.</p>
   <p><strong>A model, not a movie.</strong> Moving electrons one at a time is bookkeeping for counting them. In a real ionic solid there are no separate pairs or molecules: each ion sits in a crystal lattice surrounded by ions of the opposite charge, and the formula only gives the ratio of ions.</p>
  </div>
 </div>;
}
