import { useState } from 'react';
import { supports } from './content';
import { Dots, Pick, Tag } from './ui';

export default function BackItUp() {
 const [at, setAt] = useState(0);
 const [chosen, setChosen] = useState<boolean[]>(() => supports[0].cards.map(() => false));
 const [checked, setChecked] = useState(false);
 const [misses, setMisses] = useState(0);
 const [cardsDone, setCardsDone] = useState(false);
 const [reasonDone, setReasonDone] = useState(false);
 const [clean, setClean] = useState<boolean[]>([]);
 const [reasonFirst, setReasonFirst] = useState(true);
 const finished = at >= supports.length;
 const s = supports[Math.min(at, supports.length - 1)];
 const wrong = s.cards.filter((c, k) => chosen[k] !== (c.strength === 'strong')).length;

 function toggle(k: number) { if (cardsDone) return; setChecked(false); setChosen(cs => cs.map((v, j) => j === k ? !v : v)); }
 function check() {
  setChecked(true);
  if (wrong === 0) setCardsDone(true); else setMisses(m => m + 1);
 }
 function next() {
  const n = at + 1;
  setClean(c => [...c, misses === 0 && reasonFirst]);
  setAt(n); setChecked(false); setMisses(0); setCardsDone(false); setReasonDone(false); setReasonFirst(true);
  if (n < supports.length) setChosen(supports[n].cards.map(() => false));
 }

 if (finished) return <div className="pw-panel">
  <h3>Three claims, backed up</h3>
  <p className="pw-feedback good"><strong>{clean.filter(Boolean).length} of {supports.length} without a slip.</strong> Strong evidence is <strong>relevant</strong> (it’s about this claim), <strong>specific</strong> (numbers, names, results), and comes from a <strong>source you can trust</strong>. Reasoning then does the job evidence can’t do on its own: it explains what the evidence <em>means</em> for the claim.</p>
  <TrickList />
  <button onClick={() => { setAt(0); setClean([]); setChosen(supports[0].cards.map(() => false)); }}>Start over</button>
 </div>;

 return <div className="pw-panel">
  <p>Not everything that sounds convincing is good evidence. Choose the cards that would really help prove the claim, and leave out the weak ones. Then pick the reasoning that connects them.</p>
  <Dots total={supports.length} at={at} clean={clean} label={`Claim ${at + 1} of ${supports.length}`} />
  <div className="pw-claimbox"><Tag part="claim" /> {s.claim}</div>

  <h3>Step 1: Which cards are strong evidence?</h3>
  <ul className="pw-cards">
   {s.cards.map((c, k) => {
    const good = chosen[k] === (c.strength === 'strong');
    const show = checked && (cardsDone || !good);
    return <li key={k} className={show ? (good ? 'right' : 'wrong') : ''}>
     <button aria-pressed={chosen[k]} disabled={cardsDone} onClick={() => toggle(k)}>
      <span className="pw-check" aria-hidden="true">{chosen[k] ? '☑' : '☐'}</span>
      <span>{c.text}</span>
     </button>
     {show && <p className={`pw-why${good ? '' : ' bad'}`}><strong>{c.strength === 'strong' ? 'Strong' : 'Weak'} · {c.tag}.</strong> {c.why}{!good && (chosen[k] ? ' Leave this one out.' : ' This one belongs in.')}</p>}
    </li>;
   })}
  </ul>
  <div aria-live="polite">
   {checked && (cardsDone
    ? <p className="pw-feedback good"><strong>Good eye.</strong> You kept the strong evidence and left out the rest. Read why each card is strong or weak.</p>
    : <p className="pw-feedback bad"><strong>{wrong} card{wrong === 1 ? ' needs' : 's need'} another look.</strong> For each one marked, ask: Is it about this claim? Is it specific? Can I trust who said it?</p>)}
  </div>
  {!cardsDone && <div className="pw-row"><button className="pw-primary" onClick={check} disabled={!chosen.some(Boolean)}>Check my cards</button></div>}

  {cardsDone && <>
   <h3>Step 2: Connect it with reasoning</h3>
   <Pick key={at} prompt={<>Evidence doesn’t explain itself. Which sentence best explains <em>how</em> the strong evidence proves the claim?</>}
    options={s.reasons} onSolved={first => { setReasonFirst(first); setReasonDone(true); }} />
   {reasonDone && <div className="pw-row"><button className="pw-primary" onClick={next}>{at + 1 < supports.length ? 'Next claim →' : 'See how I did'}</button></div>}
  </>}
 </div>;
}

// The weak-argument tricks students met in parts 3 and 4, named so they can spot them in their own writing.
export function TrickList() {
 return <details className="pw-tricks">
  <summary>Tricks that sound convincing but aren’t</summary>
  <dl>
   <dt>Bandwagon</dt><dd>“Everyone knows…” or “Everybody agrees…” Lots of people believing something doesn’t make it true.</dd>
   <dt>One story</dt><dd>A single example can make a point feel real, but it can’t show what usually happens.</dd>
   <dt>Biased source</dt><dd>The source gains something if you believe it, like a company selling a product.</dd>
   <dt>Fame instead of expertise</dt><dd>A celebrity isn’t an expert just for being famous.</dd>
   <dt>Circular reasoning</dt><dd>Using the claim to prove itself: “It should be longer because it should be longer.”</dd>
   <dt>Straw man</dt><dd>Arguing against a silly version of the other side instead of what people really think.</dd>
   <dt>Attacking the person</dt><dd>Insulting the people who disagree instead of answering their point.</dd>
  </dl>
 </details>;
}
