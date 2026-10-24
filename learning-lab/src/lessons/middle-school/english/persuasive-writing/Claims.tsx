import { useState } from 'react';
import { fixes, kindInfo, statements, type Kind } from './content';
import { Dots, Pick } from './ui';

const kinds: Kind[] = ['arguable', 'fact', 'taste', 'vague'];

export default function Claims() {
 const [stage, setStage] = useState<'sort' | 'fix'>('sort');
 return <div className="pw-panel">
  <p>A claim is the backbone of an argument. A strong claim is <strong>arguable</strong> (a reasonable person could disagree), <strong>specific</strong> (it says what should happen), and <strong>supportable</strong> (evidence could back it up). Facts, personal tastes, and vague complaints can’t do that job.</p>
  <div className="pw-seg" role="group" aria-label="Activity">
   <button aria-pressed={stage === 'sort'} onClick={() => setStage('sort')}>Sort the statements</button>
   <button aria-pressed={stage === 'fix'} onClick={() => setStage('fix')}>Fix weak claims</button>
  </div>
  {stage === 'sort' ? <Sort onDone={() => setStage('fix')} /> : <FixIt />}
 </div>;
}

function Sort({ onDone }: { onDone: () => void }) {
 const [at, setAt] = useState(0);
 const [picks, setPicks] = useState<Kind[]>([]);
 const [clean, setClean] = useState<boolean[]>([]);
 const finished = at >= statements.length;
 const s = statements[Math.min(at, statements.length - 1)];
 const solved = picks.includes(s.kind);
 const last = picks[picks.length - 1];

 function pick(k: Kind) {
  if (solved || picks.includes(k)) return;
  if (!picks.length) setClean(c => [...c, k === s.kind]);
  setPicks(p => [...p, k]);
 }
 function next() { setAt(a => a + 1); setPicks([]); }

 if (finished) {
  const first = clean.filter(Boolean).length;
  return <div>
   <h3>Sorted all {statements.length}: {first} on the first try</h3>
   <ul className="pw-review">{statements.map((st, k) => <li key={k}><span aria-hidden="true" className={clean[k] ? 'ok' : 'miss'}>{clean[k] ? '✓' : '↺'}</span> {st.text} <em>({kindInfo[st.kind].name.toLowerCase()})</em></li>)}</ul>
   <p>Notice how often a weak statement was <em>almost</em> a claim. “Video games are bad” becomes a real claim once it says who should do what. Try sharpening some yourself.</p>
   <div className="pw-row"><button className="pw-primary" onClick={onDone}>Fix weak claims →</button><button onClick={() => { setAt(0); setPicks([]); setClean([]); }}>Sort again</button></div>
  </div>;
 }

 return <div>
  <Dots total={statements.length} at={at} clean={clean} label={`Statement ${at + 1} of ${statements.length}`} />
  <p className="pw-eyebrow">Statement {at + 1} of {statements.length}</p>
  <blockquote className="pw-quote">{s.text}</blockquote>
  <p className="pw-prompt">What kind of statement is this?</p>
  <div className="pw-kinds">
   {kinds.map(k => { const state = picks.includes(k) ? (k === s.kind ? 'right' : 'wrong') : '';
    return <button key={k} className={state} disabled={solved && k !== s.kind} onClick={() => pick(k)}>
     <strong>{state && <span aria-hidden="true">{state === 'right' ? '✓ ' : '✗ '}</span>}{kindInfo[k].name}</strong><span>{kindInfo[k].hint}</span>
    </button>; })}
  </div>
  <div aria-live="polite">
   {last && <p className={`pw-feedback ${last === s.kind ? 'good' : 'bad'}`}>
    {last === s.kind ? <><strong>{picks.length === 1 ? 'Yes. ' : 'Right. '}</strong>{s.why}</>
     : <><strong>Not quite.</strong> {wrongWhy(last)} Try again.</>}
   </p>}
  </div>
  {solved && <div className="pw-row"><button className="pw-primary" onClick={next}>{at + 1 < statements.length ? 'Next statement →' : 'See my results'}</button></div>}
 </div>;
}

// Asks the question that would have caught the mistake.
function wrongWhy(k: Kind) {
 switch (k) {
  case 'arguable': return 'Could a reasonable person disagree, and would evidence help settle it? Is it clear exactly what should happen?';
  case 'fact': return 'Could you settle this by looking it up or checking? If people could still disagree after checking, it’s not just a fact.';
  case 'taste': return 'Is this really about what someone likes? If evidence could change people’s minds, it’s more than taste.';
  case 'vague': return 'Is it actually unclear what should change? If it names a specific action, it isn’t vague.';
 }
}

function FixIt() {
 const [at, setAt] = useState(0);
 const [solved, setSolved] = useState(false);
 const [clean, setClean] = useState<boolean[]>([]);
 if (at >= fixes.length) return <div>
  <h3>Three weak claims, sharpened</h3>
  <p className="pw-feedback good">Each strong version named <strong>who</strong> should act and <strong>what</strong> should change. That gives the reader something definite to agree or disagree with, and gives you something definite to find evidence for.</p>
  <button onClick={() => { setAt(0); setSolved(false); setClean([]); }}>Start over</button>
 </div>;
 const f = fixes[at];
 return <div>
  <Dots total={fixes.length} at={at} clean={clean} label={`Weak claim ${at + 1} of ${fixes.length}`} />
  <p className="pw-eyebrow">Weak claim {at + 1} of {fixes.length}</p>
  <blockquote className="pw-quote weak">{f.weak}</blockquote>
  <Pick key={at} prompt="Which version is the strongest claim?" options={f.options} onSolved={first => { setSolved(true); setClean(c => [...c, first]); }} />
  {solved && <div className="pw-row"><button className="pw-primary" onClick={() => { setAt(a => a + 1); setSolved(false); }}>{at + 1 < fixes.length ? 'Next weak claim →' : 'Finish'}</button></div>}
 </div>;
}
