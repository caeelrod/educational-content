import { useState } from 'react';
import { debates } from './content';
import { TrickList } from './BackItUp';
import { Dots, Pick, Tag } from './ui';

export default function OtherSide() {
 const [at, setAt] = useState(0);
 const [step, setStep] = useState<'counter' | 'rebut' | 'done'>('counter');
 const [first, setFirst] = useState(true);
 const [clean, setClean] = useState<boolean[]>([]);
 const finished = at >= debates.length;
 const d = debates[Math.min(at, debates.length - 1)];
 const counter = d.counters.find(c => c.best)!;
 const rebuttal = d.rebuttals.find(r => r.best)!;

 function next() { setClean(c => [...c, first]); setAt(a => a + 1); setStep('counter'); setFirst(true); }

 if (finished) return <div className="pw-panel">
  <h3>You answered the other side {debates.length} times</h3>
  <p className="pw-feedback good"><strong>{clean.filter(Boolean).length} of {debates.length} without a slip.</strong> The strongest counterclaim is the one a thoughtful person who disagrees would actually make. The strongest rebuttal often starts by admitting what’s fair about it (“That’s a fair worry, but…”) and then answers it with a reason or a fact.</p>
  <p>Why bother? Readers who disagree with you are the ones you’re trying to persuade. When you state their view fairly and answer it, they’re more likely to listen.</p>
  <TrickList />
  <button onClick={() => { setAt(0); setStep('counter'); setClean([]); setFirst(true); }}>Start over</button>
 </div>;

 return <div className="pw-panel">
  <p>It might seem like mentioning the other side would weaken your argument. It does the opposite: it shows you’ve thought about it, and it lets you answer doubts before the reader raises them.</p>
  <Dots total={debates.length} at={at} clean={clean} label={`Argument ${at + 1} of ${debates.length}`} />
  <div className="pw-claimbox"><Tag part="claim" /> {d.claim}</div>

  <h3>Step 1: Choose the strongest counterclaim</h3>
  <Pick key={`c${at}`} prompt="Which is the fairest, strongest version of what someone who disagrees would say?"
   options={d.counters} onSolved={f => { if (!f) setFirst(false); setStep('rebut'); }} />

  {step !== 'counter' && <>
   <div className="pw-claimbox"><Tag part="counterclaim" /> {counter.text}</div>
   <h3>Step 2: Choose the best rebuttal</h3>
   <Pick key={`r${at}`} prompt="Which answer would most likely change the mind of someone who raised this concern?"
    options={d.rebuttals} onSolved={f => { if (!f) setFirst(false); setStep('done'); }} />
  </>}

  {step === 'done' && <>
   <div className="pw-assembled" aria-label="The argument so far">
    <p><Tag part="claim" /> {d.claim}</p>
    <p><Tag part="counterclaim" /> {counter.text}</p>
    <p><Tag part="rebuttal" /> {rebuttal.text}</p>
   </div>
   <div className="pw-row"><button className="pw-primary" onClick={next}>{at + 1 < debates.length ? 'Next argument →' : 'See how I did'}</button></div>
  </>}
 </div>;
}
