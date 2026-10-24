import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { rebuttalStarters, reasonStarters, topics, type Part, type Starter, type Topic } from './content';
import { Tag } from './ui';

type Side = 'yes' | 'no';
type CardNote = { k: number; tone: 'good' | 'bad' | 'info'; body: ReactNode };

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const LINK = /\b(because|so|shows?|means?|if|since|which|therefore|this|that way|as a result)\b/i;
const TURN = /\b(but|however|even so|while|although|though|still|yet)\b/i;
const REASON = /\b(because|so|since|which|would|could|can|will|already|only)\b|\d/i;
const ATTACK = /\b(stupid|dumb|lazy|idiots?|crazy|don[’']t care|losers?)\b/i;
// Ends a sentence with a period unless the student already punctuated it.
const sentence = (s: string) => { const t = s.trim(); return !t ? '' : /[.!?”"]$/.test(t) ? t : t + '.'; };

export default function Build() {
 const [topic, setTopic] = useState<Topic | 'own' | null>(null);
 const [side, setSide] = useState<Side | null>(null);
 const [claim, setClaim] = useState('');
 const [picked, setPicked] = useState<number[]>([]);
 const [ownEvidence, setOwnEvidence] = useState(['', '']);
 const [note, setNote] = useState<CardNote | null>(null);
 const [reasoning, setReasoning] = useState('');
 const [counter, setCounter] = useState('');
 const [rebuttal, setRebuttal] = useState('');
 const [showLabels, setShowLabels] = useState(true);
 const [copied, setCopied] = useState<string | null>(null);
 const reasonBox = useRef<HTMLTextAreaElement>(null);
 const rebutBox = useRef<HTMLTextAreaElement>(null);

 const own = topic === 'own';
 const t = topic && topic !== 'own' ? topic : null;
 const evidence = own ? ownEvidence.filter(e => e.trim()) : picked.map(k => t!.bank[k].text);
 const hasClaim = words(claim) >= 4;
 const hasEvidence = evidence.length >= 2;
 const reasonOk = words(reasoning) >= 12 && LINK.test(reasoning);
 const hasCounter = words(counter) >= 5;
 const rebutOk = words(rebuttal) >= 6 && TURN.test(rebuttal) && REASON.test(rebuttal) && !ATTACK.test(rebuttal);

 function reset() {
  setSide(null); setClaim(''); setPicked([]); setOwnEvidence(['', '']); setNote(null);
  setReasoning(''); setCounter(''); setRebuttal(''); setCopied(null);
 }
 function chooseTopic(x: Topic | 'own') { reset(); setTopic(x); }
 function chooseSide(s: Side) { setSide(s); if (t) setClaim(s === 'yes' ? t.yes : t.no); setPicked([]); setNote(null); setCounter(''); }

 function card(k: number) {
  if (!t || !side) return;
  const c = t.bank[k];
  if (picked.includes(k)) { setPicked(p => p.filter(j => j !== k)); setNote(null); return; }
  if (c.side === 'weak') return setNote({ k, tone: 'bad', body: <><strong>Weak evidence.</strong> {c.why} Look for something more specific and trustworthy.</> });
  if (c.side !== side) return setNote({ k, tone: 'info', body: <><strong>This supports the other side.</strong> {c.why} Don’t throw it away: it could help you write your counterclaim in step 5.</> });
  if (picked.length >= 2) return setNote({ k, tone: 'info', body: <>You already have two pieces of evidence. Remove one first if you’d rather use this card.</> });
  setPicked(p => [...p, k]);
  setNote({ k, tone: 'good', body: <><strong>Strong choice.</strong> {c.why}</> });
 }

 function insert(box: RefObject<HTMLTextAreaElement | null>, set: (f: (s: string) => string) => void, st: Starter) {
  set(s => (s.trim() ? s.trimEnd() + ' ' : '') + st.insert);
  // Focus right away so typing goes into the box, then move the caret to the end once the new text is in.
  box.current?.focus();
  requestAnimationFrame(() => { const el = box.current; if (el) el.setSelectionRange(el.value.length, el.value.length); });
 }

 const parts: { part: Part; text: string }[] = [
  { part: 'claim' as Part, text: sentence(claim) },
  ...evidence.map(e => ({ part: 'evidence' as Part, text: sentence(e) })),
  { part: 'reasoning' as Part, text: sentence(reasoning) },
  { part: 'counterclaim' as Part, text: sentence(counter) },
  { part: 'rebuttal' as Part, text: sentence(rebuttal) }
 ].filter(p => p.text);
 const plain = parts.map(p => p.text).join(' ');

 async function copy() {
  try { await navigator.clipboard.writeText(plain); setCopied('Copied. Paste it into your document.'); }
  catch { setCopied('Your browser blocked copying. Select the paragraph and copy it yourself.'); }
 }

 const checks: { ok: boolean; text: string }[] = [
  { ok: hasClaim, text: 'A claim that says what should happen' },
  { ok: hasEvidence, text: 'Two pieces of evidence' },
  { ok: reasonOk, text: 'Reasoning that explains the evidence (with a linking word like “because” or “this shows”)' },
  { ok: hasCounter, text: 'A counterclaim that states the other side fairly' },
  { ok: rebutOk, text: 'A rebuttal that turns (“but,” “however”) and gives a reason' }
 ];

 return <div className="pw-panel pw-build">
  <p>Now write your own argument paragraph, one part at a time. You can pick a Ridgeview question, which comes with evidence to choose from, or bring your own topic.</p>
  <p className="pw-small">Nothing you write is saved or sent anywhere. Copy your paragraph before you leave or reload the page.</p>

  <section className="pw-step" aria-labelledby="pw-s1">
   <h3 id="pw-s1">1. Choose a question</h3>
   <div className="pw-topics" role="group" aria-label="Question">
    {topics.map(x => <button key={x.id} aria-pressed={topic === x} onClick={() => chooseTopic(x)}>{x.question}</button>)}
    <button aria-pressed={own} onClick={() => chooseTopic('own')}>My own topic</button>
   </div>
  </section>

  {topic && <section className="pw-step" aria-labelledby="pw-s2">
   <h3 id="pw-s2">2. Take a side: your <Tag part="claim" /></h3>
   {t && <div className="pw-seg" role="group" aria-label="Side">
    <button aria-pressed={side === 'yes'} onClick={() => chooseSide('yes')}>Yes</button>
    <button aria-pressed={side === 'no'} onClick={() => chooseSide('no')}>No</button>
   </div>}
   {(own || side) && <>
    <label className="pw-label" htmlFor="pw-claim">{own ? 'Write a claim: who should do what?' : 'Your claim (you can reword it)'}</label>
    <textarea id="pw-claim" className="pw-text short" value={claim} onChange={e => setClaim(e.target.value)}
     placeholder={own ? 'Example: Our school should let students choose their own seats at lunch.' : ''} />
    {own && <p className="pw-small">Check it: Could a reasonable person disagree? Does it say what should happen? Could evidence back it up?</p>}
   </>}
  </section>}

  {topic && (own || side) && hasClaim && <section className="pw-step" aria-labelledby="pw-s3">
   <h3 id="pw-s3">3. Back it up: two pieces of <Tag part="evidence" /></h3>
   {t ? <>
    <p>Choose two cards that support <em>your</em> side. ({picked.length} of 2 chosen)</p>
    <ul className="pw-cards">
     {t.bank.map((c, k) => <li key={k} className={picked.includes(k) ? 'right' : note?.k === k && note.tone !== 'good' ? (note.tone === 'bad' ? 'wrong' : 'other') : ''}>
      <button aria-pressed={picked.includes(k)} onClick={() => card(k)}>
       <span className="pw-check" aria-hidden="true">{picked.includes(k) ? '☑' : '☐'}</span><span>{c.text}</span>
      </button>
      {note?.k === k && <p className={`pw-why ${note.tone === 'good' ? '' : note.tone}`} aria-live="polite">{note.body}</p>}
     </li>)}
    </ul>
   </> : <>
    <p>Write two facts, numbers, examples, or quotes that support your claim. Say where each one comes from if you can.</p>
    {ownEvidence.map((e, k) => <div key={k}>
     <label className="pw-label" htmlFor={`pw-ev${k}`}>Evidence {k + 1}</label>
     <textarea id={`pw-ev${k}`} className="pw-text short" value={e} onChange={ev => setOwnEvidence(o => o.map((x, j) => j === k ? ev.target.value : x))} />
    </div>)}
    <p className="pw-small">Check it: Is it about your claim? Is it specific? Would a reader trust where it came from?</p>
   </>}
  </section>}

  {hasClaim && hasEvidence && <section className="pw-step" aria-labelledby="pw-s4">
   <h3 id="pw-s4">4. Connect it: your <Tag part="reasoning" /></h3>
   <p>Explain <em>how</em> your evidence proves your claim. Don’t just repeat it; say what it means.</p>
   <Starters list={reasonStarters} onPick={s => insert(reasonBox, setReasoning, s)} />
   <label className="pw-label pw-sr" htmlFor="pw-reason">Reasoning</label>
   <textarea id="pw-reason" ref={reasonBox} className="pw-text" value={reasoning} onChange={e => setReasoning(e.target.value)} />
   <Hint text={reasoning} hint={reasonHint(reasoning, evidence)} ok={reasonOk} />
  </section>}

  {hasClaim && hasEvidence && words(reasoning) >= 5 && <section className="pw-step" aria-labelledby="pw-s5">
   <h3 id="pw-s5">5. Answer the other side</h3>
   <label className="pw-label" htmlFor="pw-counter"><Tag part="counterclaim" /> What would someone who disagrees say?</label>
   {t && side && <div className="pw-row"><button className="pw-small-btn" onClick={() => setCounter(side === 'yes' ? t.counterYes : t.counterNo)}>Use a suggested counterclaim</button></div>}
   <textarea id="pw-counter" className="pw-text short" value={counter} onChange={e => setCounter(e.target.value)} placeholder="Some people argue that…" />
   {hasCounter && <>
    <label className="pw-label" htmlFor="pw-rebut"><Tag part="rebuttal" /> How do you answer them?</label>
    <Starters list={rebuttalStarters} onPick={s => insert(rebutBox, setRebuttal, s)} />
    <textarea id="pw-rebut" ref={rebutBox} className="pw-text" value={rebuttal} onChange={e => setRebuttal(e.target.value)} />
    <Hint text={rebuttal} hint={rebutHint(rebuttal)} ok={rebutOk} />
   </>}
  </section>}

  {hasClaim && <section className="pw-step" aria-labelledby="pw-s6">
   <h3 id="pw-s6">6. Your paragraph</h3>
   <div className="pw-row">
    <label className="pw-toggle"><input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} /> Show labels</label>
    <button className="pw-primary" onClick={copy} disabled={!plain}>Copy paragraph</button>
    <button onClick={() => { setTopic(null); reset(); }}>Start over</button>
   </div>
   <div aria-live="polite">{copied && <p className="pw-small">{copied}</p>}</div>
   <div className={`pw-final${showLabels ? ' labeled' : ''}`}>
    {parts.map((p, k) => <span key={k} className={showLabels ? `pw-mark-${p.part}` : ''}>{showLabels && <Tag part={p.part} />}{p.text} </span>)}
   </div>
   <h4>Quick checks <span className="pw-small">(a writing helper, not a grade)</span></h4>
   <ul className="pw-checklist">{checks.map((c, k) => <li key={k} className={c.ok ? 'ok' : ''}><span aria-hidden="true">{c.ok ? '✓' : '○'}</span> {c.text}<span className="pw-sr">{c.ok ? ': done' : ': not yet'}</span></li>)}</ul>
   <p className="pw-small">The checks only look for the pieces. Read your paragraph out loud to decide whether it would convince someone who disagrees with you.</p>
  </section>}
 </div>;
}

function Starters({ list, onPick }: { list: Starter[]; onPick: (s: Starter) => void }) {
 return <div className="pw-starters" role="group" aria-label="Sentence starters">
  <span className="pw-small">Starters:</span>
  {list.map(s => <button key={s.label} className="pw-small-btn" onClick={() => onPick(s)}>{s.label}</button>)}
 </div>;
}

function Hint({ text, hint, ok }: { text: string; hint: string; ok: boolean }) {
 if (!text.trim()) return null;
 return <p className={`pw-hint${ok ? ' ok' : ''}`} aria-live="polite">{hint}</p>;
}

function reasonHint(r: string, evidence: string[]) {
 if (evidence.some(e => e.length > 30 && r.toLowerCase().includes(e.slice(0, 30).toLowerCase()))) return 'It looks like you copied your evidence. Instead, explain what it means for your claim.';
 if (words(r) < 12) return 'Keep going: say what your evidence shows and why that supports your claim.';
 if (!LINK.test(r)) return 'Try a linking phrase such as “this shows that” or “because” to connect your evidence to your claim.';
 return 'Nice: your reasoning links evidence to claim. Reread it: would someone who skipped your evidence understand why it matters?';
}

function rebutHint(r: string) {
 if (ATTACK.test(r)) return 'Answer the point, not the people. Insults make readers trust you less.';
 if (!TURN.test(r)) return 'Rebuttals usually turn with a word like “but,” “however,” or “even so.”';
 if (words(r) < 6 || !REASON.test(r)) return 'Give a reason or a fact. Saying the other side is wrong isn’t the same as showing it.';
 return 'Good: you turned to your side and gave a reason. Does it answer the exact worry in your counterclaim?';
}
