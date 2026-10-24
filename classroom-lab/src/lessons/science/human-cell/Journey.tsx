import { useMemo, useState } from 'react';
import { Scene } from './Scene';
import { EXO, EXO_T, GENE_START, H, PORE_EXIT, RIBO_ON_ER, VESICLES, W, WHOLE, cellPoint, erPoint, golgiPoint, lensTransform, nucPoint, type Pt, type View } from './geometry';
import { partById, type PartId } from './parts';
import { reducedMotion, useView } from './useView';

type Traveler = { path: string; end: Pt; kind: 'mrna' | 'protein' | 'vesicle'; dur: number };
type Step = { title: string; text: string; ask: string; view: View; active: PartId | null; gene?: boolean; traveler?: Traveler; scene: string };

const f = (p: readonly number[]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const pore = nucPoint(PORE_EXIT, 0);
const er0 = erPoint(126, -14), er1 = erPoint(126, 12), erOut = erPoint(182, 12);
const toVesicle = VESICLES[4];
const outside = cellPoint(EXO_T, -34);

const steps: Step[] = [
 {
  title: 'The recipe is in the DNA', active: 'nucleus', gene: true, view: { x: 350, y: 280, w: 300 },
  text: "Some cells, like the ones in your pancreas that make insulin, build proteins and send them out of the cell. Let's follow one. Its instructions are stored in a gene, a short section of the DNA inside the nucleus (shown in pink).",
  ask: 'Why might the cell keep its DNA locked inside the nucleus?',
  scene: 'The nucleus, with one gene in the DNA highlighted in pink.'
 },
 {
  title: 'A copy leaves the nucleus', active: 'nucleus', gene: true, view: { x: 410, y: 272, w: 220 },
  text: 'The cell makes a copy of the gene called messenger RNA. The copy slips out through a nuclear pore. The DNA itself never leaves; only copies do.',
  ask: 'Why is it useful to send out a copy instead of the DNA itself?',
  traveler: { kind: 'mrna', dur: 3.2, end: RIBO_ON_ER, path: `M${f(GENE_START)}Q390 300 ${f(pore)}L${f(RIBO_ON_ER)}` },
  scene: 'A pink copy of the gene travels from the DNA, out through a pore in the nuclear envelope, to a ribosome on the rough ER.'
 },
 {
  title: 'A ribosome builds the protein', active: 'ribosomes', view: { x: RIBO_ON_ER[0] + 4, y: RIBO_ON_ER[1], w: 70 },
  text: 'A ribosome on the rough ER reads the copy, three letters at a time, and links amino acids together in the right order. The growing chain is fed straight into the ER.',
  ask: 'What do you think would happen if the copy had a mistake in it?',
  traveler: { kind: 'protein', dur: 2.4, end: er0, path: `M${f(RIBO_ON_ER)}L${f(er0)}` },
  scene: 'Close-up of a ribosome on the rough ER. An orange protein chain moves from the ribosome into the ER.'
 },
 {
  title: 'Folding in the ER', active: 'roughER', view: { x: 480, y: 290, w: 170 },
  text: 'Inside the ER, the chain folds into its working shape. Then a bit of ER membrane pinches off around the finished protein, making a vesicle.',
  ask: 'Why does a protein need the right shape to do its job?',
  traveler: { kind: 'protein', dur: 3.2, end: toVesicle, path: `M${f(er0)}A126 126 0 0 1 ${f(er1)}L${f(erOut)}L${f(toVesicle)}` },
  scene: 'The protein moves along inside an ER sac, then leaves the ER in a small vesicle.'
 },
 {
  title: 'The Golgi finishes and packs it', active: 'golgi', view: { x: 616, y: 300, w: 200 },
  text: 'The vesicle joins the receiving side of the Golgi apparatus. The protein moves through the stack and gets its finishing touches. On the shipping side, it is packed into a new vesicle with an "address" that sends it to the cell membrane.',
  ask: 'How is the Golgi like a post office? How is it different?',
  traveler: { kind: 'vesicle', dur: 3.4, end: VESICLES[1], path: `M${f(toVesicle)}L${f(golgiPoint(150, 0.12))}L${f(golgiPoint(102, 0.05))}L${f(VESICLES[1])}` },
  scene: 'A vesicle travels into the Golgi stack and out the other side.'
 },
 {
  title: 'Shipped out of the cell', active: 'vesicles', view: { x: 708, y: 312, w: 190 },
  text: 'Motor proteins carry the vesicle along the cytoskeleton to the cell membrane. The vesicle joins the membrane and the protein spills out of the cell. Insulin then travels through the blood to cells all over the body.',
  ask: 'The vesicle becomes part of the membrane. What could happen to the cell if it sent out lots of vesicles and never took any membrane back in?',
  traveler: { kind: 'vesicle', dur: 3, end: outside, path: `M${f(VESICLES[1])}L${f(EXO)}L${f(outside)}` },
  scene: 'A vesicle travels to the cell membrane, merges with it, and releases the protein outside the cell.'
 },
 {
  title: 'Powered by mitochondria', active: 'mitochondria', view: WHOLE,
  text: 'Every step used energy: making the copy, linking amino acids, and moving vesicles. Mitochondria release energy from food and store it in ATP, which powers all of this work.',
  ask: 'A cell that makes lots of protein to send out also has lots of rough ER and a big Golgi. Why does that make sense?',
  scene: 'The whole cell, with the mitochondria highlighted.'
 }
];

const stops: { id: PartId; label: string }[] = [
 { id: 'nucleus', label: 'Nucleus' }, { id: 'ribosomes', label: 'Ribosome' }, { id: 'roughER', label: 'Rough ER' },
 { id: 'golgi', label: 'Golgi apparatus' }, { id: 'membrane', label: 'Cell membrane' }
];
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function TravelerShape({ kind }: { kind: Traveler['kind'] }) {
 if (kind === 'mrna') return <path className="hc-trav-mrna" d="M-9 0c2-3 4 3 6 0s4 3 6 0 4 3 6 0" />;
 if (kind === 'protein') return <g className="hc-trav-protein">{[-5, 0, 5].map((x, i) => <circle key={x} cx={x} cy={i === 1 ? -2 : 1} r="2.6" />)}</g>;
 return <g><circle className="hc-vesicle" r="8" /><g className="hc-trav-protein">{[-2.5, 2.5].map(x => <circle key={x} cx={x} cy="0" r="2" />)}</g></g>;
}

export default function Journey() {
 const [step, setStep] = useState(0);
 const [order, setOrder] = useState<PartId[]>([]);
 const [wrong, setWrong] = useState<PartId | null>(null);
 const quiz = step === steps.length;
 const s = steps[Math.min(step, steps.length - 1)];
 const [view] = useView(quiz ? WHOLE : s.view, 900);
 const choices = useMemo(() => shuffle(stops), [quiz]);
 const still = reducedMotion();
 const scale = s.view.w / 230;
 const done = order.length === stops.length;

 function go(n: number) { setStep(n); setOrder([]); setWrong(null); }
 function pick(id: PartId) {
  if (order.includes(id) || done) return;
  if (stops[order.length].id === id) { setOrder([...order, id]); setWrong(null); }
  else setWrong(id);
 }

 return <div className="hc-journey">
  <p>Follow one protein from the instructions in the DNA all the way out of the cell. Use <strong>Next</strong> to move along.</p>
  <div className="hc-journey-grid">
   <div className="hc-stage">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={quiz ? 'The whole cell.' : `Step ${step + 1}: ${s.scene}`}>
     <g transform={lensTransform(view, W, H)}>
      <Scene active={quiz ? null : s.active} gene={!quiz && s.gene}>
       {!quiz && s.traveler && <g key={step}>
        <path className="hc-trail" d={s.traveler.path} style={{ strokeWidth: 2.2 * scale, strokeDasharray: `${5 * scale} ${4 * scale}` }} />
        {still
         ? <g transform={`translate(${f(s.traveler.end)}) scale(${scale})`}><TravelerShape kind={s.traveler.kind} /></g>
         : <g><g transform={`scale(${scale})`}><TravelerShape kind={s.traveler.kind} /></g>
           <animateMotion dur={`${s.traveler.dur}s`} repeatCount="indefinite" path={s.traveler.path} keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear" /></g>}
       </g>}
      </Scene>
     </g>
    </svg>
   </div>
   <div className="hc-journey-panel">
    <div className="step-dots" role="group" aria-label="Journey steps">
     {steps.map((st, i) => <button key={st.title} aria-label={`Step ${i + 1}: ${st.title}`} aria-pressed={step === i} className={step === i ? 'active' : ''} onClick={() => go(i)}>{i + 1}</button>)}
     <button aria-label="Your turn: put the stops in order" aria-pressed={quiz} className={quiz ? 'active' : ''} onClick={() => go(steps.length)}>★</button>
    </div>
    {!quiz ? <div aria-live="polite">
     <div className="eyebrow">STEP {step + 1} OF {steps.length} · {(s.active ? partById[s.active].short : '').toUpperCase()}</div>
     <h3>{s.title}</h3>
     <p>{s.text}</p>
     <div className="challenge"><strong>Discuss:</strong> {s.ask}</div>
    </div> : <div>
     <div className="eyebrow">YOUR TURN</div>
     <h3>Put the stops in order</h3>
     <p>Tap the places the protein visited, from first to last.</p>
     <ol className="hc-order" aria-label="Your order">{stops.map((st, i) => <li key={st.id} className={order[i] ? 'filled' : ''}>{order[i] ? partById[order[i]].short : '?'}</li>)}</ol>
     <div className="hc-opts">{choices.map(c => <button key={c.id} disabled={order.includes(c.id)} onClick={() => pick(c.id)} className={wrong === c.id ? 'hc-shake' : ''}>{c.label}</button>)}</div>
     <div aria-live="polite">
      {wrong && !done && <p className="hc-feedback wrong">Not yet. {order.length === 0
       ? 'Where are the instructions kept before anything is built?'
       : `Where did the protein go right after the ${partById[order[order.length - 1]].short}?`}</p>}
      {done && <p className="hc-feedback right"><strong>You got it!</strong> Nucleus → ribosome → rough ER → Golgi apparatus → cell membrane. Vesicles carried the protein between the ER, the Golgi, and the membrane, and mitochondria supplied the energy.</p>}
     </div>
     {done && <button onClick={() => { setOrder([]); setWrong(null); }}>Try it again</button>}
    </div>}
    <div className="lesson-nav">
     <button disabled={step === 0} onClick={() => go(step - 1)}>← Previous</button>
     <button onClick={() => go(quiz ? 0 : step + 1)}>{quiz ? 'Start over ↻' : step === steps.length - 1 ? 'Your turn →' : 'Next step →'}</button>
    </div>
   </div>
  </div>
  <p className="note">A simplified model. Real proteins follow these steps, but many proteins at once, and the parts are packed much closer together. Some steps are skipped, such as how a protein's "address" is read.</p>
 </div>;
}
