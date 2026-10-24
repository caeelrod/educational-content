import { useState } from 'react';

type Answer = 'div' | 'oc' | 'oo' | 'cc' | 'tr' | 'none';
const answers: { id: Answer; label: string }[] = [
 { id: 'div', label: 'Divergent (pulling apart)' },
 { id: 'oc', label: 'Convergent: ocean meets continent' },
 { id: 'oo', label: 'Convergent: ocean meets ocean' },
 { id: 'cc', label: 'Convergent: continent meets continent' },
 { id: 'tr', label: 'Transform (sliding past)' },
 { id: 'none', label: 'Not at a plate boundary' }
];
type Case = { id: string; place: string; clues: string[]; answer: Answer; explain: string; hints?: Partial<Record<Answer, string>> };

const cases: Case[] = [
 { id: 'andes', place: 'The Andes Mountains, along the west coast of South America', answer: 'oc',
  clues: ['A deep trench runs along the coast, out in the ocean.', 'A long chain of tall mountains with many active volcanoes stands on land.', 'Earthquakes are shallow near the coast and get deeper and deeper farther inland.'],
  explain: 'The Nazca Plate (ocean) is sinking under the South American Plate. The earthquakes trace the sinking plate as it goes deeper under the continent.',
  hints: { oo: 'There is a trench and volcanoes, but these volcanoes sit in mountains on land, not on islands in the ocean.', cc: 'Tall mountains, yes, but there is also a deep ocean trench and lots of volcanoes. A continent-continent collision has neither.' } },
 { id: 'mariana', place: 'The Mariana Islands and Mariana Trench, in the western Pacific Ocean', answer: 'oo',
  clues: ['The deepest trench in the world, nearly 11 km deep.', 'Beside it, a curved line of volcanic islands rises from the deep ocean.', 'There is no continent nearby: just ocean floor on both sides.'],
  explain: 'The old, dense Pacific Plate sinks under the Philippine Sea Plate. Melting above the sinking plate built a curved chain of volcanic islands: an island arc.',
  hints: { oc: 'Trench and volcanoes, yes, but there is no continent here. Both sides are ocean floor.', div: 'A trench means a plate is going down, not new floor forming. Ridges are high, not deep.' } },
 { id: 'himalaya', place: 'The Himalayas, between India and the rest of Asia', answer: 'cc',
  clues: ['The highest mountains on Earth, including Mount Everest.', 'Many earthquakes, spread over a wide area, mostly shallow to medium depth.', 'Almost no active volcanoes. Rocks with fossils of sea creatures are found high in the mountains.'],
  explain: 'India has been pushing into Asia for about 50 million years. Neither continent sinks, so the crust crumples and stacks up. The sea fossils came from an ocean floor that was squeezed up between the continents.',
  hints: { oc: 'If an ocean plate were sinking here, you would expect a trench and a chain of volcanoes. There are almost no volcanoes.' } },
 { id: 'iceland', place: 'Iceland, in the North Atlantic Ocean', answer: 'div',
  clues: ['An island that sits on top of an underwater mountain range running down the middle of the ocean.', 'Long cracks and valleys cross the island, and they are slowly getting wider.', 'Many small, shallow earthquakes and frequent volcanic eruptions. Rocks are youngest in the middle of the island.'],
  explain: 'Iceland sits on the Mid-Atlantic Ridge, where the North American and Eurasian plates pull apart. It is above sea level partly because a hot spot under it supplies extra magma.',
  hints: { none: 'There may be a hot spot here too, but the widening cracks and youngest rock in the middle point to plates pulling apart.' } },
 { id: 'eafrica', place: 'The East African Rift, in Ethiopia, Kenya, and Tanzania', answer: 'div',
  clues: ['A long valley thousands of kilometers long, with steep walls on both sides.', 'Long, deep lakes fill parts of the valley, and there are volcanoes nearby.', 'Measurements show the land on either side moving apart by a few millimeters a year.'],
  explain: 'Africa is slowly splitting apart. If rifting continues for millions of years, the sea may flood in and form a new ocean, the way the Red Sea formed.',
  hints: { tr: 'The two sides are moving apart from each other, not sliding past. And transform faults rarely have volcanoes.' } },
 { id: 'sanandreas', place: 'The San Andreas Fault, in California', answer: 'tr',
  clues: ['A long, straight crack across the land, hundreds of kilometers long.', 'Streams and fences that cross it are bent or offset sideways.', 'Shallow earthquakes, some very strong. No volcanoes along it.'],
  explain: 'The Pacific Plate slides northwest past the North American Plate. The rock sticks, bends, and then slips in earthquakes, offsetting anything built across the fault.',
  hints: { div: 'Nothing is opening up here. Things are being shifted sideways.' } },
 { id: 'anatolia', place: 'The North Anatolian Fault, in northern Turkey', answer: 'tr',
  clues: ['A long fault running east to west across the country.', 'Land on one side moves sideways past the land on the other side.', 'A string of strong, shallow earthquakes in the last hundred years, and no volcanoes along the fault.'],
  explain: 'The small Anatolian Plate is being squeezed west, sliding past the Eurasian Plate along this fault.' },
 { id: 'hawaii', place: 'Hawaii, in the middle of the Pacific Ocean', answer: 'none',
  clues: ['Active volcanoes thousands of kilometers from the nearest plate boundary.', 'The islands form a long chain. The volcanoes at one end are active; the islands get older and more worn down toward the other end.', 'No trench, and no ridge, nearby.'],
  explain: 'Hawaii sits over a hot spot: a plume of unusually hot rock rising from deep in the mantle. The Pacific Plate moves over it, so each volcano is carried away and a new one forms. Not every volcano is at a plate boundary.',
  hints: { oo: 'Volcanic islands, yes, but there is no trench and no sinking plate here. Notice how far it is from any boundary.', div: 'There is no ridge here and the islands get older in one direction only, not in both directions as at a ridge.' } },
 { id: 'cascades', place: 'Mount St. Helens and the Cascade Range, in the northwestern United States', answer: 'oc',
  clues: ['A line of tall volcanoes on land, well inland from the Pacific coast.', 'Offshore, a small ocean plate meets the continent at a trench.', 'Buried forests and old tsunami deposits along the coast show that a giant earthquake struck here in the year 1700.'],
  explain: 'The small Juan de Fuca Plate is sinking under the North American Plate. Mount St. Helens erupted violently in 1980.',
  hints: { oo: 'The volcanoes are on a continent, not islands.' } },
 { id: 'redsea', place: 'The Red Sea, between Africa and Arabia', answer: 'div',
  clues: ['A long, narrow sea with very straight, matching coastlines on both sides.', 'Down its middle runs a deep trough where the youngest rock on the sea floor is found.', 'Shallow earthquakes and young volcanic rock along the middle.'],
  explain: 'Arabia and Africa are moving apart. The Red Sea is a young ocean, the next stage after a rift like the one in East Africa.' },
 { id: 'appalachian', place: 'The Appalachian Mountains, in the eastern United States', answer: 'none',
  clues: ['Old, rounded mountains, worn down by erosion.', 'Rocks inside them are folded and crumpled, as if squeezed together long ago.', 'Very few earthquakes today, no active volcanoes, and the nearest plate boundary is the Mid-Atlantic Ridge, far out in the ocean.'],
  explain: 'The Appalachians were built by continents colliding more than 250 million years ago, when Pangaea was forming. Today they are in the middle of the North American Plate. Mountains can outlast the boundary that made them.',
  hints: { cc: 'Good thinking: the folded rocks do come from a continent collision. But that was hundreds of millions of years ago. Is there an active boundary there today?' } },
 { id: 'aleutian', place: 'The western Aleutian Islands, stretching west from Alaska', answer: 'oo',
  clues: ['A long, curved chain of volcanic islands in the ocean.', 'A deep trench runs along the ocean side of the chain.', 'Earthquakes get deeper going from the trench toward the islands and beyond.'],
  explain: 'The Pacific Plate sinks under the North American Plate. In the west there is ocean on both sides, so the volcanoes form an island arc. (Farther east, near mainland Alaska, the same plate sinks under continent.)',
  hints: { oc: 'A trench and volcanoes, yes, but these volcanoes are islands rising from the ocean.' } }
];
const ROUND = 6;
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
type Entry = { c: Case; misses: number; picked: Answer[] };
const deal = (list = shuffle(cases).slice(0, ROUND)): Entry[] => list.map(c => ({ c, misses: 0, picked: [] }));

const generic: Record<Answer, string> = {
 div: 'At a divergent boundary you would see a ridge or rift valley, young rock in the middle, shallow earthquakes, and quiet volcanoes. Look for clues about a trench or sideways motion instead.',
 oc: 'Ocean-continent boundaries have a trench offshore and volcanoes in mountains on land. Check which clues are missing.',
 oo: 'Ocean-ocean boundaries have a deep trench next to a curve of volcanic islands. Check the clues again.',
 cc: 'Continent-continent collisions make huge mountains but have no trench and few volcanoes.',
 tr: 'Transform boundaries shift things sideways and have shallow earthquakes but no volcanoes or trenches.',
 none: 'Ask whether the clues show plates pulling apart, pushing together, or sliding past right now.'
};

export default function Detective({ onLab }: { onLab: () => void }) {
 const [round, setRound] = useState<Entry[]>(() => deal());
 const [i, setI] = useState(0);
 const [solved, setSolved] = useState(false);
 const [msg, setMsg] = useState<string | null>(null);
 const e = round[i];

 function pick(a: Answer) {
  if (solved || !e) return;
  if (a === e.c.answer) { setSolved(true); setMsg(null); return; }
  setRound(r => r.map((x, k) => k === i ? { ...x, misses: x.misses + 1, picked: [...x.picked, a] } : x));
  setMsg(e.c.hints?.[a] ?? generic[a]);
 }
 function next() { setI(i + 1); setSolved(false); setMsg(null); }
 function restart(list?: Case[]) { setRound(deal(list)); setI(0); setSolved(false); setMsg(null); }

 if (!e) {
  const clean = round.filter(x => x.misses === 0).length, missed = round.filter(x => x.misses > 0);
  return <div className="pt-panel">
   <h3>Case files closed: {clean} of {round.length} solved on the first try</h3>
   <ul className="pt-review">{round.map(x => <li key={x.c.id}><span aria-hidden="true">{x.misses === 0 ? '✓' : '↺'}</span> <strong>{x.c.place}</strong>: {answers.find(a => a.id === x.c.answer)!.label}</li>)}</ul>
   <p>{clean === round.length ? 'Every case solved first time. You can read a landscape the way geologists do.' : 'The most useful clues are a trench (a plate is sinking), where the volcanoes are (on land or as islands), and whether things move apart, together, or sideways.'}</p>
   <div className="pt-row">
    <button className="pt-primary" onClick={() => restart()}>New cases</button>
    {missed.length > 0 && <button onClick={() => restart(missed.map(x => x.c))}>Retry the {missed.length} I missed</button>}
    <button onClick={onLab}>Back to the boundary lab</button>
   </div>
  </div>;
 }

 return <div className="pt-panel">
  <h3>Clue 4: Boundary detective</h3>
  <p>Geologists can tell what kind of boundary a place sits on from its landforms, earthquakes, and volcanoes. Read the evidence and decide.</p>
  <div className="pt-progress" aria-label={`Case ${i + 1} of ${round.length}`}>{round.map((x, k) => <span key={k} className={k < i ? (x.misses === 0 ? 'done' : 'slip') : k === i ? 'now' : ''} />)}</div>
  <div className="pt-case">
   <p className="pt-eyebrow">Case {i + 1} of {round.length}</p>
   <p className="pt-case-title">{solved ? e.c.place : 'Mystery location'}</p>
   <ul className="pt-clues">{e.c.clues.map((c, k) => <li key={k}><span className="pt-clue-n" aria-hidden="true">{k + 1}</span>{c}</li>)}</ul>
  </div>
  <div className="pt-answers" role="group" aria-label="What kind of place is this?">
   {answers.map(a => {
    const wrong = e.picked.includes(a.id), right = solved && a.id === e.c.answer;
    return <button key={a.id} className={right ? 'right' : wrong ? 'wrong' : ''} disabled={solved || wrong} onClick={() => pick(a.id)}>{right ? '✓ ' : wrong ? '✗ ' : ''}{a.label}</button>;
   })}
  </div>
  <div aria-live="polite">
   {msg && !solved && <p className="pt-feedback bad">{msg}</p>}
   {solved && <p className="pt-feedback good"><strong>{e.misses === 0 ? 'Solved!' : 'Got it.'}</strong> {e.c.explain}</p>}
  </div>
  {solved && <button className="pt-primary" onClick={next}>{i + 1 < round.length ? 'Next case →' : 'See my case files'}</button>}
 </div>;
}
