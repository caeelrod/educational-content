import { useState, type ReactNode } from 'react';
import { lower, partById, type PartId } from './parts';

type CellType = {
 id: string; name: string; where: string; job: string; shape: string; nucleus: string;
 link: { part: PartId; text: string }; fact: string; ask: string; art: ReactNode; alt: string;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const types: CellType[] = [
 {
  id: 'rbc', name: 'Red blood cell', where: 'In your blood',
  job: 'Carries oxygen from your lungs to every part of your body.',
  shape: 'A soft disc that is thinner in the middle. It bends and squeezes through the tiniest blood vessels.',
  nucleus: 'None. As a red blood cell matures, it loses its nucleus and its mitochondria. That leaves more room for hemoglobin, the protein that carries oxygen.',
  link: { part: 'nucleus', text: 'Compare it with the nucleus most cells keep' },
  fact: 'About 25 trillion of your roughly 30 trillion cells are red blood cells. Each one lasts about 4 months.',
  ask: 'Without a nucleus, a red blood cell cannot make new proteins. Why might it wear out after a few months?',
  alt: 'A red disc with a pale dent in the middle, shown from the top and from the side, where it looks pinched in the middle.',
  art: <>
   <circle cx="80" cy="75" r="46" fill="#d9453b" /><circle cx="80" cy="75" r="22" fill="#ec7d71" /><circle cx="80" cy="75" r="46" fill="none" stroke="#a8261f" strokeWidth="2" />
   <path d="M152 58c14-9 22 8 33 8s19-17 33-8c9 6 9 28 0 34-14 9-22-8-33-8s-19 17-33 8c-9-6-9-28 0-34z" fill="#d9453b" stroke="#a8261f" strokeWidth="2" />
   <text x="80" y="140" className="hc-art-label">top</text><text x="185" y="140" className="hc-art-label">side</text>
  </>
 },
 {
  id: 'neuron', name: 'Nerve cell (neuron)', where: 'Brain, spinal cord, and nerves',
  job: 'Sends electrical signals to other nerve cells, muscles, and glands.',
  shape: 'Short branches collect signals. One long fiber, called an axon, carries signals away to the next cell.',
  nucleus: 'One, in the rounded cell body.',
  link: { part: 'cytoskeleton', text: 'See the cytoskeleton tracks that run down the axon' },
  fact: 'Some neurons reach from the bottom of your spine all the way to your toes, about a meter long.',
  ask: 'Why is a long, thin shape useful for a cell that carries messages?',
  alt: 'A purple cell body with a nucleus and branching arms, and one long fiber with bead-like coverings that splits into small branches at the far end.',
  art: <>
   <g stroke="#7b5fb3" strokeWidth="3" fill="none" strokeLinecap="round">
    <path d="M40 60 20 38M27 46 12 46M44 56 40 26M40 34 30 18M40 34 50 16M36 80 14 98M22 90 10 84M50 88 46 118M46 106 34 120M32 68 8 66" />
    <path d="M66 74H200M200 74 222 56M200 74 226 74M200 74 220 94M214 62 224 50M212 88 224 100" />
   </g>
   {range(6).map(i => <rect key={i} x={76 + i * 21} y="68" width="16" height="12" rx="6" fill="#f3e8c9" stroke="#b9a160" />)}
   <path d="M30 70c-4-14 10-24 22-20 14 2 18 18 12 28-6 10-22 12-30 4z" fill="#c9b6ec" stroke="#7b5fb3" strokeWidth="2" />
   <circle cx="47" cy="68" r="7" fill="#6a4ca6" />
  </>
 },
 {
  id: 'muscle', name: 'Skeletal muscle cell', where: 'The muscles that move your bones',
  job: 'Contracts (gets shorter) to pull on bones and move your body.',
  shape: 'Very long and thin, like a fiber. Rows of proteins inside give it a striped look.',
  nucleus: 'Many. Each muscle cell forms when lots of smaller cells join together, so it keeps all of their nuclei.',
  link: { part: 'mitochondria', text: 'See the mitochondria that power every squeeze' },
  fact: 'One skeletal muscle cell can be several centimeters long, much longer than most cells.',
  ask: 'Muscle cells are packed with mitochondria. What does that tell you about how much energy they use?',
  alt: 'A long pink fiber with thin dark stripes across it and several small oval nuclei along its edges.',
  art: <>
   <rect x="10" y="48" width="220" height="54" rx="24" fill="#f4b3a8" stroke="#c8553d" strokeWidth="2" />
   {range(29).map(i => <line key={i} x1={22 + i * 7} y1="52" x2={22 + i * 7} y2="98" stroke="#c8553d" strokeWidth={i % 2 ? 1 : 2.4} opacity=".55" />)}
   {[[40, 54], [95, 96], [150, 54], [200, 96], [120, 54], [64, 96]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="9" ry="3.6" fill="#6a4ca6" />)}
  </>
 },
 {
  id: 'skin', name: 'Skin cell', where: 'The outer layer of your skin',
  job: 'Forms a tough, waterproof layer that keeps germs out and water in.',
  shape: 'New cells start out like little cubes at the bottom of the layer. As newer cells push them up, they flatten and fill with keratin, a tough protein.',
  nucleus: 'One while the cell is alive. The flat cells at the surface have lost their nucleus and are no longer alive.',
  link: { part: 'cytoskeleton', text: 'Keratin is part of the cytoskeleton. See it in the explorer' },
  fact: 'The flat cells on top flake off all the time, and new cells from below take their place.',
  ask: 'Why might it help to have dead, tough cells on the very outside of your body?',
  alt: 'Layers of skin cells: cube-shaped cells with nuclei at the bottom, flatter cells above them, and very flat cells with no nuclei on top, one flaking off.',
  art: <>
   {range(6).map(i => <g key={'b' + i}><rect x={12 + i * 36} y="104" width="34" height="32" rx="4" fill="#f0c9ab" stroke="#b07a55" /><circle cx={29 + i * 36} cy="120" r="6" fill="#6a4ca6" /></g>)}
   {range(5).map(i => <g key={'m' + i}><rect x={20 + i * 42} y="82" width="40" height="20" rx="6" fill="#ecc19f" stroke="#b07a55" /><ellipse cx={40 + i * 42} cy="92" rx="6" ry="4" fill="#6a4ca6" /></g>)}
   {range(4).map(i => <g key={'u' + i}><rect x={14 + i * 54} y="68" width="52" height="12" rx="5" fill="#e6b994" stroke="#b07a55" /><ellipse cx={40 + i * 54} cy="74" rx="6" ry="2" fill="#6a4ca6" opacity=".6" /></g>)}
   {range(3).map(i => <rect key={'t' + i} x={12 + i * 2} y={58 - i * 7} width="214" height="6" rx="3" fill="#e2c3a6" stroke="#b07a55" />)}
   <rect x="160" y="26" width="60" height="6" rx="3" fill="#e2c3a6" stroke="#b07a55" transform="rotate(-10 190 29)" />
  </>
 },
 {
  id: 'wbc', name: 'White blood cell', where: 'In your blood and body tissues',
  job: 'Hunts down germs, such as bacteria, and destroys them.',
  shape: 'It can change shape, reach out, and crawl out of blood vessels to get to an infection.',
  nucleus: 'One. In the kind shown here (a neutrophil), the nucleus has several lobes.',
  link: { part: 'lysosomes', text: 'See the lysosomes that digest the germs' },
  fact: 'Your body makes billions of new white blood cells every day.',
  ask: 'Why would a cell that eats germs need lots of lysosomes?',
  alt: 'A pale blue cell with a purple nucleus in three lobes. One arm is wrapping around a green rod-shaped bacterium, and another bacterium is already inside a bubble with green lysosomes next to it.',
  art: <>
   <path d="M60 40c20-22 60-18 78-4 14-10 34-8 40 4 6 10-2 20-12 22 10 14 6 34-10 44-20 14-56 16-80 6C52 104 36 86 40 66c-14-4-12-20 0-24 6-2 14 0 20-2z" fill="#e3ecf9" stroke="#5d82cf" strokeWidth="2" />
   <g fill="#6a4ca6"><circle cx="82" cy="70" r="12" /><circle cx="100" cy="84" r="11" /><circle cx="116" cy="68" r="11" /><path d="M86 74l10 6M106 78l8-6" stroke="#6a4ca6" strokeWidth="6" /></g>
   <rect x="160" y="38" width="30" height="12" rx="6" fill="#7fbf4d" stroke="#4f8a24" transform="rotate(-20 175 44)" />
   <circle cx="130" cy="98" r="11" fill="#fbe7bb" stroke="#d39a22" strokeWidth="1.5" /><rect x="122" y="94" width="16" height="7" rx="3.5" fill="#7fbf4d" />
   {[[146, 104], [114, 108], [146, 86]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="4.5" fill="#d6ebb8" stroke="#6d9b37" />)}
  </>
 },
 {
  id: 'fat', name: 'Fat cell', where: 'Under your skin and around your organs',
  job: 'Stores energy as fat. Fat under the skin also helps keep the body warm.',
  shape: 'Round. One big droplet of fat fills almost the whole cell.',
  nucleus: 'One, squeezed flat against the edge by the fat droplet.',
  link: { part: 'smoothER', text: 'See the smooth ER, where fats are made' },
  fact: 'A fat cell can grow and shrink a lot as it stores fat or uses it up.',
  ask: 'Where did the rest of this cell go? Look for the cytoplasm and the nucleus.',
  alt: 'A round cell almost completely filled by a large yellow droplet, with a thin rim of cytoplasm and a flattened nucleus at the top edge.',
  art: <>
   <circle cx="120" cy="76" r="62" fill="#e6f3ee" stroke="#c9643f" strokeWidth="2.5" />
   <circle cx="120" cy="79" r="55" fill="#ffe58a" stroke="#e0b53a" strokeWidth="1.5" />
   <ellipse cx="120" cy="19" rx="16" ry="4.5" fill="#6a4ca6" />
  </>
 }
];

export default function Gallery({ onJump }: { onJump: (id: PartId) => void }) {
 const [pick, setPick] = useState(types[0].id);
 const t = types.find(x => x.id === pick)!;
 return <div className="hc-gallery">
  <p>The cell in <strong>Explore</strong> is a model of a "typical" cell, but your body has hundreds of kinds of cells. Each kind has a shape and set of parts that fit its job. Pick a cell to meet it.</p>
  <div className="hc-gallery-grid" role="group" aria-label="Kinds of human cells">
   {types.map(x => <button key={x.id} className="hc-gcard" aria-pressed={pick === x.id} onClick={() => setPick(x.id)}>
    <svg viewBox="0 0 240 150" aria-hidden="true">{x.art}</svg>
    <span>{x.name}</span>
   </button>)}
  </div>
  <div className="hc-gdetail" aria-live="polite">
   <svg viewBox="0 0 240 150" role="img" aria-label={t.alt}>{t.art}</svg>
   <div>
    <div className="eyebrow">{t.where.toUpperCase()}</div>
    <h3>{t.name}</h3>
    <p className="hc-job">{t.job}</p>
    <dl className="hc-facts">
     <div><dt>Shape</dt><dd>{t.shape}</dd></div>
     <div><dt>Nucleus</dt><dd>{t.nucleus}</dd></div>
     <div><dt>Did you know?</dt><dd>{t.fact}</dd></div>
    </dl>
    <div className="challenge"><strong>Think about it:</strong> {t.ask}</div>
    <button className="hc-primary" onClick={() => onJump(t.link.part)}>{t.link.text} →</button>
    <span className="hc-sr"> (opens the {lower(partById[t.link.part])} in Explore)</span>
   </div>
  </div>
  <p className="note">Drawings are simplified and not to scale with each other. Red blood cells are smaller than most cells, and some nerve and muscle cells are far longer than they could be drawn here.</p>
 </div>;
}
