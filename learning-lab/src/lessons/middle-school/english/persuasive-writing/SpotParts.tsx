import { useState } from 'react';
import { partInfo, partOrder, passages, type Part } from './content';
import { Dots, Tag } from './ui';

export default function SpotParts() {
 const [at, setAt] = useState(0);
 const [labels, setLabels] = useState<(Part | null)[]>(() => passages[0].sentences.map(() => null));
 const [brush, setBrush] = useState<Part>('claim');
 const [checked, setChecked] = useState(false);
 const [tries, setTries] = useState(0);
 const [clean, setClean] = useState<boolean[]>([]);
 const finished = at >= passages.length;
 const p = passages[Math.min(at, passages.length - 1)];
 const allLabeled = labels.every(Boolean);
 const right = labels.filter((l, k) => l === p.sentences[k].part).length;
 const solved = checked && right === p.sentences.length;

 function label(k: number) {
  if (solved) return;
  setChecked(false);
  setLabels(ls => ls.map((l, j) => j === k ? (l === brush ? null : brush) : l));
 }
 function check() {
  setChecked(true);
  const ok = labels.every((l, k) => l === p.sentences[k].part);
  if (ok) setClean(c => [...c, tries === 0]);
  else setTries(t => t + 1);
 }
 function retry() { setLabels(ls => ls.map((l, k) => l === p.sentences[k].part ? l : null)); setChecked(false); }
 function next() {
  const n = at + 1;
  setAt(n); setChecked(false); setTries(0);
  if (n < passages.length) setLabels(passages[n].sentences.map(() => null));
 }
 function restart() { setAt(0); setClean([]); setTries(0); setChecked(false); setLabels(passages[0].sentences.map(() => null)); }

 if (finished) {
  const first = clean.filter(Boolean).length;
  return <div className="pw-panel">
   <h3>You labeled all {passages.length} arguments</h3>
   <p className="pw-feedback good"><strong>{first} of {passages.length} on the first check.</strong> Notice that the parts weren’t always in the same order. The claim can come first, in the middle, or after a counterclaim, and a paragraph can end by restating it. What matters is that every part is there and does its job.</p>
   <p>The hardest pair is usually <Tag part="evidence" /> and <Tag part="reasoning" />. A quick test: evidence is something you could <em>check</em> (a number, a quote, an event). Reasoning is the writer <em>explaining</em> what it means, often with words like “so,” “because,” or “if… then.”</p>
   <button onClick={restart}>Start over</button>
  </div>;
 }

 return <div className="pw-panel">
  <p>Every strong argument has the same five jobs to do. Choose a label, then click each sentence it fits. Click a sentence again to remove its label.</p>
  <Dots total={passages.length} at={at} clean={clean} label={`Argument ${at + 1} of ${passages.length}`} />
  <div className="pw-brushes" role="group" aria-label="Label to apply">
   {partOrder.map(part => <button key={part} className={`pw-brush pw-${part}`} aria-pressed={brush === part} onClick={() => setBrush(part)}>
    <strong>{partInfo[part].name}</strong><span>{partInfo[part].job}</span>
   </button>)}
  </div>
  <h3>{at + 1}. “{p.title}”</h3>
  <ol className="pw-sentences">
   {p.sentences.map((s, k) => {
    const l = labels[k];
    const verdict = checked && l ? (l === s.part ? 'right' : 'wrong') : '';
    return <li key={k} className={verdict}>
     <button className={l ? `pw-${l}` : ''} disabled={solved} onClick={() => label(k)} aria-label={`Sentence ${k + 1}: ${s.text} ${l ? `Labeled ${partInfo[l].name}.` : 'No label yet.'}`}>
      <span className="pw-slot">{l ? <Tag part={l} /> : <span className="pw-tag pw-empty">Label?</span>}</span>
      <span>{s.text}</span>
     </button>
     {verdict === 'right' && <p className="pw-why"><span aria-hidden="true">✓ </span>{s.why}</p>}
     {verdict === 'wrong' && <p className="pw-why bad"><span aria-hidden="true">✗ </span>Not {partInfo[l!].name.toLowerCase()}. Ask yourself: {hint(l!)}</p>}
    </li>;
   })}
  </ol>
  <div aria-live="polite">
   {checked && (solved
    ? <p className="pw-feedback good"><strong>All {p.sentences.length} correct.</strong> Read the explanations under each sentence, then go on.</p>
    : <p className="pw-feedback bad"><strong>{right} of {p.sentences.length} are right.</strong> Look at the hints under the ones marked ✗, then try those again.</p>)}
  </div>
  <div className="pw-row">
   {!solved && !checked && <button className="pw-primary" disabled={!allLabeled} onClick={check}>{allLabeled ? 'Check my labels' : `Label every sentence (${labels.filter(Boolean).length} of ${labels.length})`}</button>}
   {checked && !solved && <button className="pw-primary" onClick={retry}>Try the ones I missed</button>}
   {solved && <button className="pw-primary" onClick={next}>{at + 1 < passages.length ? 'Next argument →' : 'See how I did'}</button>}
  </div>
 </div>;
}

// A question that helps a student see why a label doesn't fit, without giving the answer away.
function hint(wrong: Part) {
 switch (wrong) {
  case 'claim': return 'is this the writer’s main position, or something said to support or challenge it?';
  case 'evidence': return 'could you check this sentence like a fact, or is the writer explaining, answering, or stating a position?';
  case 'reasoning': return 'does this sentence explain what evidence means, or is it the evidence itself, the claim, or the other side?';
  case 'counterclaim': return 'is this what someone who disagrees would say? Look for words like “some people say.”';
  case 'rebuttal': return 'does this sentence answer an opposing view? Rebuttals often start with “but” or “however.”';
 }
}
