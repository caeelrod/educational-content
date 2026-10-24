import { useState } from 'react';
import PeriodicTable, { ViewSwitch, useNarrow, type View } from './PeriodicTable';
import { LewisSymbol, ShellModel } from './Atom';
import { byZ, ionCharge, ionMatches, kind, kindLabel, mainGroup, shells, superscript, valence, where, type Element } from './elements';

const blockNote: Record<string, string> = {
 transition: 'A transition metal. Its newest electrons go into an inner shell, so the simple "count the outer electrons" rule in this lesson does not predict how it bonds. Chemistry courses come back to these later.',
 lanthanide: 'A lanthanide (f-block). Its newest electrons go two shells in, so this lesson\'s outer-electron rules do not apply.',
 actinide: 'An actinide (f-block). All are radioactive. Its newest electrons go two shells in, so this lesson\'s outer-electron rules do not apply.',
 main: 'A main-group element in period 6 or 7. The same group patterns hold, but this lesson\'s data stops at period 5.'
};

function groupRule(e: Element) {
 if (e.sym === 'He') return 'Helium is the exception: its only shell holds 2, so 2 is a full shell.';
 if (e.sym === 'H') return 'Hydrogen sits in group 1 with 1 electron, but it is a nonmetal and often shares.';
 return e.group! <= 2 ? `Group ${e.group} → ${e.group} valence electron${e.group === 1 ? '' : 's'}.` : `Group ${e.group} → ${e.group} − 10 = ${valence(e)} valence electrons.`;
}

function ionText(e: Element) {
 const c = ionCharge(e), v = valence(e);
 if (e.group === 18) return `${e.name} already has a full outer shell, so it almost never forms ions or bonds.`;
 if (e.sym === 'H') return 'Hydrogen usually shares its one electron. It can lose it (H⁺, in acids) or, with very reactive metals, gain one (H⁻).';
 if (e.sym === 'Sn') return 'Tin forms Sn²⁺ and Sn⁴⁺. Neither matches a noble gas, so the octet shortcut does not predict tin\'s ions.';
 if (c === null) return `${e.name} would have to gain or lose ${v === 4 ? 4 : Math.min(v, 8 - v)} electrons to match a noble gas, which takes too much energy. It usually shares electrons instead.`;
 const n = Math.abs(c), sym = `${e.sym}${superscript(c)}`;
 if (!ionMatches(e)) return `Tends to lose its 3 valence electrons → ${sym}. What is left is a full shell of 18 rather than a noble-gas arrangement, but it is still stable.`;
 return c > 0
  ? `Tends to lose its ${n} valence electron${n > 1 ? 's' : ''} → ${sym}, which has the same electron arrangement as ${ionMatches(e)}.`
  : `Tends to gain ${n} electron${n > 1 ? 's' : ''} to fill its outer shell to 8 → ${sym}, the same arrangement as ${ionMatches(e)}.`;
}

/** Pattern check: name the valence electrons from the table position alone. */
function Check({ exclude }: { exclude: number }) {
 const pool = mainGroup.filter(e => e.z !== exclude && e.sym !== 'He' && e.sym !== 'H');
 const pick = () => pool[Math.floor(Math.random() * pool.length)];
 const [target, setTarget] = useState<Element>(pick);
 const [answer, setAnswer] = useState<number | null>(null);
 const [score, setScore] = useState({ right: 0, tried: 0 });
 const want = valence(target);

 function choose(n: number) {
  if (answer !== null) return;
  setAnswer(n); setScore(s => ({ right: s.right + (n === want ? 1 : 0), tried: s.tried + 1 }));
 }
 let why = '';
 if (answer !== null && answer !== want) {
  if (answer === target.period) why = `${answer} is its period: the number of shells, not the electrons in the outer one. `;
  else if (target.group! >= 13 && answer === target.group! - 12) why = 'Count groups 13 to 18 as 3 to 8, not 1 to 6: the outer shell already holds the 2 electrons from groups 1 and 2. ';
 }
 return <div className="cb-check">
  <h3>Pattern check</h3>
  <p>Without clicking it, how many valence electrons does <strong>{target.name} ({target.sym})</strong> have? It is in <strong>{where(target).toLowerCase()}</strong>.</p>
  <div className="cb-chips" role="group" aria-label="Number of valence electrons">
   {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <button key={n} aria-pressed={answer === n} disabled={answer !== null && answer !== n} onClick={() => choose(n)}>{n}</button>)}
  </div>
  <div aria-live="polite">
   {answer !== null && <p className={`cb-feedback ${answer === want ? 'good' : 'bad'}`}>
    {answer === want ? 'Yes. ' : `Not quite: it has ${want}. ${why}`}{groupRule(target)}
   </p>}
  </div>
  <div className="cb-row">
   {answer !== null && <button className="cb-primary" onClick={() => { setTarget(pick()); setAnswer(null); }}>Another element</button>}
   {score.tried > 0 && <span className="cb-aside">{score.right} of {score.tried} right</span>}
  </div>
 </div>;
}

export default function Atoms() {
 const narrow = useNarrow();
 const [view, setView] = useState<View>(narrow ? 'main' : 'full');
 const [z, setZ] = useState(11);
 const e = byZ(z), k = kind(e);
 return <div className="cb-panel">
  <h3>Atoms and the periodic table</h3>
  <p>Every atom has a nucleus with protons and shells of electrons around it. The electrons in the <strong>outermost shell</strong>, the <strong>valence electrons</strong>, are the ones that take part in bonding. For the main-group elements, the periodic table is arranged so that you can read them off an element's column.</p>
  <div className="cb-row"><ViewSwitch view={view} setView={setView} /><span className="cb-aside">Pick an element. Arrow keys move around the table.</span></div>
  <PeriodicTable view={view} selected={[z]} onPick={el => setZ(el.z)} label="Periodic table: pick an element"
   cell={el => ({ className: kind(el) ?? `blk-${el.block}` })} />
  <div className="cb-legend" aria-hidden="true">
   <span><i className="metal" /> Metal</span><span><i className="metalloid" /> Metalloid</span><span><i className="nonmetal" /> Nonmetal</span><span><i className="noble" /> Noble gas</span>{view === 'full' && <span><i className="blk-transition" /> Outside this lesson's data</span>}
  </div>

  <div className="cb-two" aria-live="polite">
   {e.data ? <>
    <figure className="cb-figure">
     <ShellModel e={e} />
     <figcaption>Shell model. Electrons are drawn on circles to count them by shell; real electrons do not travel in circular orbits. Valence electrons are orange.</figcaption>
    </figure>
    <div className="cb-facts">
     <p className="cb-eyebrow">{where(e).toUpperCase()} · {kindLabel[k!].toUpperCase()}</p>
     <h4>{e.name} <span className="cb-light">({e.sym})</span></h4>
     <dl>
      <dt>Atomic number</dt><dd>{e.z}: {e.z} protons, and {e.z} electrons in a neutral atom</dd>
      <dt>Electrons per shell</dt><dd>{shells(e).join(', ')}</dd>
      <dt>Valence electrons</dt><dd><strong className="cb-big">{valence(e)}</strong> <span className="cb-aside">{groupRule(e)}</span></dd>
      <dt>Lewis symbol</dt><dd><svg viewBox="0 0 80 70" className="cb-lewis" role="img" aria-label={`${e.sym} with ${valence(e)} dots`}><LewisSymbol x={40} y={35} sym={e.sym} dots={Array(valence(e)).fill('val')} /></svg></dd>
      <dt>Ions</dt><dd>{ionText(e)}</dd>
     </dl>
    </div>
   </> : <div className="cb-facts wide">
    <p className="cb-eyebrow">{where(e).toUpperCase()}</p>
    <h4>{e.name} <span className="cb-light">({e.sym})</span></h4>
    <p>Atomic number {e.z}: {e.z} protons, and {e.z} electrons in a neutral atom.</p>
    <p>{blockNote[e.block]}</p>
   </div>}
  </div>

  <div className="cb-explain">
   <p><strong>Try this.</strong> Click Li, Na, and K. What stays the same in their outer shell, and what changes? Then click across period 3 from Na to Ar.</p>
   <ul>
    <li>Elements in the same <strong>group</strong> (column) have the same number of valence electrons, which is why they behave alike.</li>
    <li>Each new <strong>period</strong> (row) adds a shell. Across a period, each element has one more proton and one more valence electron than the last.</li>
    <li>Atoms are most stable with a full outer shell of 8, like the noble gases (2 for helium). This is the <strong>octet rule</strong>, and it predicts most of the bonding in this lesson.</li>
   </ul>
  </div>
  <Check exclude={z} />
 </div>;
}
