import { useState, type ComponentType } from 'react';
import { useCentered, useFrames } from './motion';
import { Collision, OceanContinent, OceanOcean, Ridge, Rift, Transform, quakeCount, type SceneProps } from './scenes';

export type BoundaryId = 'ridge' | 'rift' | 'oc' | 'oo' | 'cc' | 'transform';
type Outcome = 'gap' | 'sink' | 'crumple' | 'slide';
type Boundary = {
 id: BoundaryId; group: 'Divergent' | 'Convergent' | 'Transform'; name: string; motion: string; Scene: ComponentType<SceneProps>;
 outcome: Outcome; forms: string; quakes: string; volcanoes: string; places: string; view: 'side' | 'top'; describe: (t: number) => string;
};

export const boundaries: Boundary[] = [
 { id: 'ridge', group: 'Divergent', name: 'Mid-ocean ridge', motion: 'Two ocean plates pull apart.', Scene: Ridge, outcome: 'gap', view: 'side',
  forms: 'Hot rock from the mantle rises into the gap. As it rises, the pressure on it drops and some of it melts. The melt cools into new ocean floor, building a long underwater mountain range with a valley along its top.',
  quakes: 'Frequent, small, shallow earthquakes along the ridge.',
  volcanoes: 'Lava erupts quietly onto the seafloor, mostly unseen. Iceland is a place where the ridge rises above sea level.',
  places: 'Mid-Atlantic Ridge and Iceland; East Pacific Rise.',
  describe: t => `Side view. Two ocean plates move apart from a ridge in the middle. Magma rises under the ridge and new ocean floor forms and moves away on both sides. ${Math.round(t * 100)}% of the way through.` },
 { id: 'rift', group: 'Divergent', name: 'Continental rift', motion: 'A continent begins to pull apart.', Scene: Rift, outcome: 'gap', view: 'side',
  forms: 'The land stretches and thins. Long blocks of crust drop down between faults, making a rift valley with lakes and volcanoes. If the rifting keeps going, the sea floods in and a new ocean is born.',
  quakes: 'Shallow earthquakes along the faults on the sides of the valley.',
  volcanoes: 'Yes, in and near the rift valley.',
  places: 'East African Rift (Ethiopia, Kenya, Tanzania). The Red Sea is a young ocean that began this way.',
  describe: t => t < 0.72 ? `Side view. A continent stretches. A rift valley ${t > 0.25 ? 'with lakes and volcanoes ' : ''}sinks between faults.` : 'Side view. The rift valley has dropped below sea level, the sea has flooded in, and new ocean floor is forming in the middle.' },
 { id: 'oc', group: 'Convergent', name: 'Ocean meets continent', motion: 'An ocean plate and a continent push together.', Scene: OceanContinent, outcome: 'sink', view: 'side',
  forms: 'Ocean plate is thinner but denser (heavier for its size) than continent, so it bends and sinks under the continent into the mantle. This is called subduction. A deep trench forms where it bends down, and the edge of the continent is squeezed up into mountains.',
  quakes: 'Many, including the most powerful earthquakes on Earth. They are shallow near the trench and get deeper farther inland, following the sinking plate down as far as about 700 km.',
  volcanoes: 'A chain of volcanoes in the mountains. As the sinking plate heats up, it releases water that helps the hot rock above it melt.',
  places: 'Andes Mountains (South America); Cascade Range, including Mount St. Helens (United States).',
  describe: t => `Side view. An ocean plate on the left sinks under a continent on the right at a deep trench. ${t > 0.5 ? 'Volcanoes have formed in the mountains above where the sinking plate is deep.' : 'Mountains are rising on the continent.'}` },
 { id: 'oo', group: 'Convergent', name: 'Ocean meets ocean', motion: 'Two ocean plates push together.', Scene: OceanOcean, outcome: 'sink', view: 'side',
  forms: 'The older ocean plate is colder and denser, so it sinks under the younger one, making a very deep trench. Volcanoes grow up from the seafloor and can rise above the waves as a curved chain of islands called an island arc.',
  quakes: 'Many. Shallow near the trench and deeper farther from it, along the sinking plate.',
  volcanoes: 'Yes: a line of volcanic islands.',
  places: 'Mariana Trench and Mariana Islands (the trench is nearly 11 km deep, the deepest place in the ocean); Aleutian Islands (Alaska); Lesser Antilles (Caribbean).',
  describe: t => `Side view. An older ocean plate sinks under a younger one at a deep trench. ${t > 0.8 ? 'A volcano has grown above sea level as an island.' : t > 0.5 ? 'An undersea volcano is growing.' : ''}` },
 { id: 'cc', group: 'Convergent', name: 'Continent meets continent', motion: 'Two continents push together.', Scene: Collision, outcome: 'crumple', view: 'side',
  forms: 'First the ocean between the continents sinks. Continental crust is too thick and light to sink far, so when the continents meet, neither one goes down. The crust crumples, folds, and stacks up into the highest mountains on Earth, with a deep root of crust below.',
  quakes: 'Many shallow and medium-depth earthquakes spread over a wide area.',
  volcanoes: 'Few or none once the continents collide.',
  places: 'Himalayas and the Tibetan Plateau (India has been pushing into Asia for about 50 million years). The Alps formed in a similar way.',
  describe: t => t < 0.45 ? 'Side view. Two continents move toward each other as the ocean floor between them sinks under the right-hand continent.' : 'Side view. The continents have collided. The crust is crumpling and stacking up into tall mountains with a thick root.' },
 { id: 'transform', group: 'Transform', name: 'Plates slide past', motion: 'Two plates grind past each other sideways.', Scene: Transform, outcome: 'slide', view: 'top',
  forms: 'Crust is neither made nor destroyed. The plates slide past each other along a fault. Far from the fault the ground moves steadily, but near it the rock sticks, bends, and stores up strain until it suddenly slips.',
  quakes: 'Yes, shallow and sometimes strong.',
  volcanoes: 'Usually none.',
  places: 'San Andreas Fault (California); North Anatolian Fault (Turkey). Most transform faults are on the ocean floor, linking pieces of mid-ocean ridges.',
  describe: t => `View from above. A fault runs across the middle; the top plate moves left and the bottom plate moves right. A road, a fence, and a stream cross the fault. ${quakeCount(t)} earthquakes so far have broken and offset them.` }
];

const outcomes: { id: Outcome; label: string }[] = [
 { id: 'gap', label: 'A crack opens and fills with new rock' },
 { id: 'sink', label: 'One plate sinks, making a deep trench and volcanoes' },
 { id: 'crumple', label: 'The crust crumples into very tall mountains' },
 { id: 'slide', label: 'Rock grinds sideways; roads and fences get split' }
];

export default function Lab({ start = 'ridge' }: { start?: BoundaryId }) {
 const [id, setId] = useState<BoundaryId>(start);
 const [t, setT] = useState(0);
 const [playing, setPlaying] = useState(false);
 const [labels, setLabels] = useState(true);
 const [quakes, setQuakes] = useState(true);
 const [guesses, setGuesses] = useState<Partial<Record<BoundaryId, Outcome>>>({});
 const scroller = useCentered<HTMLDivElement>();
 const b = boundaries.find(x => x.id === id)!;
 const guess = guesses[id];
 useFrames(playing, dt => setT(v => { const n = Math.min(1, v + dt / 9); if (n >= 1) setPlaying(false); return n; }));

 function choose(next: BoundaryId) { setId(next); setT(0); setPlaying(false); }
 const play = () => { if (t >= 1) setT(0); setPlaying(p => !p); };
 const groups = ['Divergent', 'Convergent', 'Transform'] as const;

 return <div className="pt-panel">
  <h3>Clue 3: What happens where plates meet?</h3>
  <p>Earth's outer shell is broken into about a dozen large <strong>tectonic plates</strong> and many smaller ones. Plates can pull apart (<strong>divergent</strong>), push together (<strong>convergent</strong>), or slide past each other (<strong>transform</strong>). Pick a boundary, predict what will happen, then run millions of years in seconds.</p>
  <details className="pt-more"><summary>What is a plate, and what is it sitting on?</summary>
   <svg className="pt-layers" viewBox="0 0 520 150" role="img" aria-label="Layers: crust on top, then the rest of the stiff plate, together called the lithosphere, about 100 kilometers thick. Below is the asthenosphere, hot solid rock that flows slowly.">
    <rect x="0" y="10" width="520" height="22" className="pt-ccrust" /><rect x="0" y="32" width="520" height="48" className="pt-lith" /><rect x="0" y="80" width="520" height="70" className="pt-asth" />
    <text className="pt-scene-label small" x="12" y="26">Crust</text><text className="pt-scene-label small" x="12" y="60">Stiff top of the mantle</text>
    <text className="pt-scene-label small" x="12" y="112">Asthenosphere: solid rock, hot enough to flow very slowly</text>
    <path className="pt-brace" d="M505 10 h-8 v70 h8 M497 45 h-8" /><text className="pt-scene-label small" x="485" y="49" textAnchor="end">Lithosphere = a plate</text>
   </svg>
   <p>A plate is a piece of the <strong>lithosphere</strong>: the crust plus the cold, stiff top of the mantle, about 100 km thick on average (thinner at mid-ocean ridges, thicker under old continents). Below it is the <strong>asthenosphere</strong>, rock so hot it can flow very slowly, like extremely thick putty, even though it is solid.</p>
   <p><strong>Plates do not float on a sea of lava.</strong> The mantle is almost entirely solid rock. Magma forms only in certain places, such as under ridges, in rifts, and above sinking plates, which is why volcanoes show up where they do.</p>
   <p>Two kinds of crust matter here: <strong>ocean crust</strong> is thin (about 7 km) and made of dense dark rock called basalt; <strong>continental crust</strong> is thick (about 35 km on average, much more under big mountains) and lighter.</p>
  </details>

  <div className="pt-boundary-picker">
   {groups.map(g => <div key={g} className="pt-bgroup"><span className="pt-label">{g}</span>
    <div className="pt-seg" role="group" aria-label={`${g} boundaries`}>
     {boundaries.filter(x => x.group === g).map(x => <button key={x.id} aria-pressed={id === x.id} onClick={() => choose(x.id)}>{x.name}</button>)}
    </div></div>)}
  </div>

  <div className="pt-predict">
   <p><strong>Predict:</strong> {b.motion} What do you think will happen?</p>
   <div className="pt-row">{outcomes.map(o => <button key={o.id} aria-pressed={guess === o.id} onClick={() => setGuesses(g => ({ ...g, [id]: o.id }))}>{o.label}</button>)}</div>
  </div>

  <div className="pt-scroll" ref={scroller}><svg className="pt-scene" viewBox="0 0 800 360" role="img" aria-labelledby="pt-scene-title">
   <title id="pt-scene-title">{b.describe(t)}</title>
   <rect className="pt-sky" width="800" height="360" />
   <b.Scene t={t} labels={labels} quakes={quakes} />
  </svg></div>
  <p className="pt-swipe">Swipe sideways to see the whole picture.</p>
  <div className="pt-timebar">
   <button className="pt-primary" onClick={play}>{playing ? '❚❚ Pause' : t >= 1 ? '↺ Replay' : '▶ Run time'}</button>
   <label className="pt-grow"><span className="pt-sr">Time</span>
    <input type="range" min={0} max={1000} value={Math.round(t * 1000)} aria-valuetext={`${Math.round(t * 100)} percent of the way through`} onChange={e => { setPlaying(false); setT(Number(e.target.value) / 1000); }} />
   </label>
   <span className="pt-small-text">{b.view === 'top' ? 'decades to centuries →' : 'millions of years →'}</span>
  </div>
  <div className="pt-row pt-toggles">
   <label className="pt-check"><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)} /> Labels</label>
   <label className="pt-check"><input type="checkbox" checked={quakes} onChange={e => setQuakes(e.target.checked)} /> Earthquakes</label>
   {b.view === 'side'
    ? <span className="pt-legend small"><span className="pt-sw ccrust" />continental crust <span className="pt-sw ocrust" />ocean crust <span className="pt-sw lith" />rest of plate <span className="pt-sw asth" />asthenosphere <span className="pt-sw magma" />magma {quakes && <><span className="pt-dot shallow" />shallow <span className="pt-dot mid" /> <span className="pt-dot deep" />deep earthquakes</>}</span>
    : <span className="pt-legend small">View from above. {quakes && <><span className="pt-dot shallow" />earthquakes along the fault</>}</span>}
  </div>

  <div aria-live="polite">{guess && t >= 0.9 && <p className={`pt-feedback ${guess === b.outcome ? 'good' : 'bad'}`}>{guess === b.outcome
   ? 'Your prediction matches what happens at this kind of boundary.'
   : `Not this time. You predicted "${outcomes.find(o => o.id === guess)!.label.toLowerCase()}", but here: ${outcomes.find(o => o.id === b.outcome)!.label.toLowerCase()}. Read why below.`}</p>}</div>

  <div className="pt-facts">
   <div><h4>{b.group}: {b.name}</h4><p>{b.forms}</p></div>
   <dl>
    <div><dt>Earthquakes</dt><dd>{b.quakes}</dd></div>
    <div><dt>Volcanoes</dt><dd>{b.volcanoes}</dd></div>
    <div><dt>Real places</dt><dd>{b.places}</dd></div>
   </dl>
  </div>
  <p className="pt-note">These are models. Depths are stretched compared with widths so thin layers show up, colors only tell layers apart, and the plates move evenly here; in real life the edges stick and slip. Scientists think the main pushes and pulls on plates come from old, cold plates sinking at trenches (pulling the rest of the plate along), from plates sliding off high ridges, and from slow, heat-driven flow in the mantle.</p>
 </div>;
}
