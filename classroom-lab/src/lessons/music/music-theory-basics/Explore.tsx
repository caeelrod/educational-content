import { useEffect, useRef, useState } from 'react';
import Piano, { keyFor } from './Piano';
import Staff, { type Focus } from './Staff';
import { useNarrow, usePlayer, type Ev } from './audio';
import { MIDDLE_C, bothNames, freq, fullName, isBlack, name, octaveOf, staffStep, whereOnStaff, type Spelling } from './notes';

type IdeaId = 'alphabet' | 'highlow' | 'octave' | 'loud' | 'halfsteps' | 'lines' | 'middleC';
type Beat = { notes: number[]; dur: number; vel?: number; focus?: Focus; say: string };
type Idea = { id: IdeaId; title: string; text: string[]; ask: string; demo: Beat[] };

const n = (notes: number[], say: string, extra: Partial<Beat> = {}): Beat => ({ notes, dur: 0.5, say, ...extra });
const ideas: Idea[] = [
 {
  id: 'highlow', title: 'High and low',
  text: ['How high or low a note sounds is called its pitch. Sound is a vibration: a guitar string or a speaker moves back and forth very fast and pushes the air.',
   'Faster vibrations make a higher pitch. On a piano, keys to the right are higher. On a staff, notes written higher up sound higher. People can hear vibrations from about 20 to 20,000 times a second.'],
  ask: 'Hum a low note and then a high note with your hand on your throat. What changes?',
  demo: [n([60], 'Low C'), n([67], 'Higher: G'), n([72], 'Higher: C'), n([79], 'Higher: G'), n([84], 'Highest here: C', { dur: 0.9 })]
 },
 {
  id: 'alphabet', title: 'Seven letters',
  text: ['Music names notes with only seven letters: A, B, C, D, E, F, G. After G, the letters start over at A.',
   'On a piano, find C just to the left of each pair of black keys. Then walk to the right: C, D, E, F, G, A, B, and C again.'],
  ask: 'If you keep going up from G, what letter comes next?',
  demo: [60, 62, 64, 65, 67, 69, 71].map(m => n([m], name(m), { dur: 0.42 })).concat(n([72], 'C again', { dur: 0.9 }))
 },
 {
  id: 'octave', title: 'Octaves',
  text: ['Notes with the same letter sound alike, even though one is higher. The distance from one C to the next C is an octave.',
   'Go up one octave and the vibrations get exactly twice as fast. Middle C vibrates about 262 times a second, and the C above it about 523 times.'],
  ask: 'When children and adults sing a song together, they often sing an octave apart. Why does it still sound like the same tune?',
  demo: [n([60], 'C4'), n([72], 'C5, one octave higher'), n([84], 'C6, two octaves higher'), n([60, 72, 84], 'All three Cs together', { dur: 1.4 })]
 },
 {
  id: 'loud', title: 'Loud is not high',
  text: ['Loudness and pitch are different things. Pitch depends on how fast something vibrates. Loudness depends on how big the vibrations are.',
   'Watch the wave: a louder sound makes taller waves, but the waves stay the same distance apart. A higher note squeezes the waves closer together.'],
  ask: 'Can you sing a high note quietly? A low note loudly?',
  demo: [n([60], 'Low and quiet', { vel: 0.3, dur: 0.8 }), n([60], 'Low and loud', { vel: 1, dur: 0.8 }), n([84], 'High and quiet', { vel: 0.3, dur: 0.8 }), n([84], 'High and loud', { vel: 1, dur: 0.8 })]
 },
 {
  id: 'halfsteps', title: 'Sharps and flats',
  text: ['From any key to the very next key, black or white, is a half step. It is the smallest step on a piano.',
   'A sharp (♯) means one half step higher. A flat (♭) means one half step lower. So the black key between C and D has two names: C♯ and D♭. E and F have no black key between them, and neither do B and C, so they are only a half step apart.'],
  ask: 'What are the two names for the black key between F and G?',
  demo: [n([60], 'C'), n([61], 'C sharp, also called D flat'), n([62], 'D'), n([63], 'D sharp, also called E flat'), n([64], 'E'), n([65], 'F, just a half step above E', { dur: 0.9 })]
 },
 {
  id: 'lines', title: 'Lines and spaces',
  text: ['Music is written on a staff of five lines and four spaces. Each line and each space is a different letter, going up in order.',
   'With the treble clef, the lines from the bottom are E, G, B, D, F ("Every Good Bird Does Fly"). The spaces spell FACE.'],
  ask: 'Make up your own sentence to remember E G B D F.',
  demo: [64, 67, 71, 74, 77].map(m => n([m], `Line: ${name(m)}`, { focus: 'lines' as Focus })).concat([65, 69, 72, 76].map(m => n([m], `Space: ${name(m)}`, { focus: 'spaces' as Focus })))
 },
 {
  id: 'middleC', title: 'Middle C',
  text: ['Middle C is the C closest to the middle of a full-size piano. It is a good landmark for finding other notes.',
   'In the treble clef, middle C sits below the staff on its own short line, called a ledger line. D hangs just under the bottom line, and E sits on the bottom line.'],
  ask: 'On this keyboard, where is middle C compared to the two black keys next to it?',
  demo: [n([60], 'Middle C, on a ledger line', { dur: 0.7 }), n([62], 'D, under the staff', { dur: 0.7 }), n([64], 'E, on the bottom line', { dur: 0.7 })]
 }
];

const WINDOW = 0.01; // the wave shows one hundredth of a second
function Wave({ midi, vel, ringing }: { midi: number | null; vel: number; ringing: boolean }) {
 const W = 320, H = 96, mid = H / 2;
 if (midi === null) return <svg className="mu-wave" viewBox={`0 0 ${W} ${H}`} aria-hidden="true"><line x1="0" x2={W} y1={mid} y2={mid} /></svg>;
 const cycles = freq(midi) * WINDOW;
 const cyc = W / cycles;
 const amp = 8 + 30 * vel;
 const pts: string[] = [];
 for (let x = -cyc; x <= W; x += 2) pts.push(`${x.toFixed(1)},${(mid - amp * Math.sin((x / cyc) * Math.PI * 2)).toFixed(1)}`);
 return <svg className={`mu-wave${ringing ? ' ringing' : ''}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
  <line x1="0" x2={W} y1={mid} y2={mid} />
  <polyline key={midi} points={pts.join(' ')} style={{ ['--cyc' as string]: `${cyc}px` }} />
 </svg>;
}

export default function Explore() {
 const narrow = useNarrow();
 const [oct, setOct] = useState(0); // which octave shows on narrow screens
 const [shown, setShown] = useState<number[]>([]);
 const [prev, setPrev] = useState<number | null>(null);
 const [vel, setVel] = useState(0.8);
 const [ringing, setRinging] = useState(false);
 const [letters, setLetters] = useState(true);
 const [spelling, setSpelling] = useState<Spelling>('sharp');
 const [idea, setIdea] = useState<IdeaId | null>(null);
 const [said, setSaid] = useState('');
 const ring = useRef<number | undefined>(undefined);
 const player = usePlayer();

 const from = narrow ? MIDDLE_C + oct * 12 : MIDDLE_C, to = narrow ? from + 12 : MIDDLE_C + 24;
 const current = ideas.find(i => i.id === idea) ?? null;

 // Which demo note is sounding now, from the player's clock.
 let beat: Beat | null = null;
 if (current && player.t !== null) {
  let acc = 0;
  for (const b of current.demo) { if (player.t < acc + b.dur) { beat = b; break; } acc += b.dur; }
 }
 const notes = beat ? beat.notes : shown;
 const top = notes.length ? Math.max(...notes) : null;
 useEffect(() => {
  if (!beat) return;
  setSaid(beat.say);
  if (narrow && top !== null && (top < from || top > to)) setOct(top >= MIDDLE_C + 12 ? 1 : 0);
 }, [beat?.say, beat?.notes.join()]);
 useEffect(() => () => window.clearTimeout(ring.current), []);

 function played(m: number) {
  player.stop();
  setPrev(shown.length === 1 ? shown[0] : null);
  setShown([m]);
  setVel(0.8);
  setRinging(true);
  window.clearTimeout(ring.current);
  setSaid(`${fullName(m, spelling)}, about ${Math.round(freq(m))} vibrations per second.`);
 }
 function released() { window.clearTimeout(ring.current); ring.current = window.setTimeout(() => setRinging(false), 300); }

 function demo() {
  if (!current) return;
  if (player.playing) { player.stop(); return; }
  const events: Ev[] = [];
  let t = 0;
  for (const b of current.demo) { events.push({ t, dur: b.dur * 0.92, midi: b.notes, vel: b.vel }); t += b.dur; }
  setPrev(null);
  player.play(events, t, { onEnd: () => { const last = current.demo[current.demo.length - 1]; setShown(last.notes); } });
 }

 function pickIdea(id: IdeaId) { player.stop(); setIdea(idea === id ? null : id); }

 const one = notes.length === 1 ? notes[0] : null;
 const diff = one !== null && prev !== null && !beat ? one - prev : null;
 const step = one !== null ? staffStep(one, spelling) : null;
 const label = notes.length ? `Treble staff showing ${notes.map(m => fullName(m, spelling)).join(', ')}.` : 'Empty treble staff.';
 const sounding = !!beat || ringing;

 return <div className="mu-explore">
  <div className="mu-toolbar">
   <label className="mu-check"><input type="checkbox" checked={letters} onChange={e => setLetters(e.target.checked)} /> Letter names on the keys</label>
   <div className="mu-seg" role="group" aria-label="Names for the black keys">
    <button aria-pressed={spelling === 'sharp'} onClick={() => setSpelling('sharp')}>Black keys as ♯ sharps</button>
    <button aria-pressed={spelling === 'flat'} onClick={() => setSpelling('flat')}>as ♭ flats</button>
   </div>
  </div>

  <div className="mu-explore-grid">
   <div className="mu-card mu-staff-card">
    <Staff measures={notes.length ? [[{ kind: 'note', midi: notes, value: 'whole', spelling }]] : [[]]} time={false} final={false} bars={false} label={label} focus={beat?.focus ?? null} letters={notes.length > 0} />
    <div className="mu-wave-box">
     <Wave midi={top} vel={beat?.vel ?? vel} ringing={sounding} />
     <p className="mu-caption">{top === null ? 'Play a note to see its vibration.' : <>Vibrations in 1/100 of a second: <strong>{(freq(top) * WINDOW).toFixed(1)}</strong></>}</p>
    </div>
   </div>

   <div className="mu-info" aria-live="polite">
    {beat ? <>
     <h3>{current!.title}</h3>
     <p className="mu-now">♪ {beat.say}</p>
    </> : one === null ? <>
     <h3>{notes.length > 1 ? `${notes.map(m => fullName(m, spelling)).join(' + ')}` : 'Play a note'}</h3>
     {notes.length > 1 ? <p>Notes with the same letter, an octave apart, blend together so well they can sound almost like one note.</p> : <>
      <p>Press any key on the piano below: click it, tap it, or slide your finger across the keys.</p>
      <p>On a computer keyboard, click the piano first, then press <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd> <kbd>G</kbd> <kbd>H</kbd> <kbd>J</kbd> <kbd>K</kbd> for the white keys and <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd> <kbd>U</kbd> for the black keys. Arrow keys and Enter work too.</p>
     </>}
    </> : <>
     <h3 className="mu-note-name">{fullName(one, spelling)}{one === MIDDLE_C && <span> · middle C</span>}</h3>
     <dl className="mu-facts">
      <div><dt>Letter name</dt><dd>{isBlack(one) ? <>{bothNames(one)}. This black key has two names: {name(one, 'sharp')} is a half step above {name(one - 1)}, and {name(one, 'flat')} is a half step below {name(one + 1)}.</> : <>{name(one)}. The small 4, 5, or 6 tells you which {name(one)} on the piano: this is the {name(one)} in octave {octaveOf(one)}.</>}</dd></div>
      <div><dt>On the staff</dt><dd>{step !== null && whereOnStaff(step)}{isBlack(one) ? `, with a ${spelling === 'sharp' ? 'sharp (♯)' : 'flat (♭)'} in front` : ''}.</dd></div>
      <div><dt>Vibrations</dt><dd>About <strong>{Math.round(freq(one)).toLocaleString()}</strong> times every second ({Math.round(freq(one))} hertz).</dd></div>
      {diff !== null && <div><dt>Compared with {fullName(prev!, spelling)}</dt><dd>{diff === 0 ? 'The same note again.'
       : Math.abs(diff) % 12 === 0 ? `Same letter, ${Math.abs(diff) / 12 === 1 ? 'one octave' : 'two octaves'} ${diff > 0 ? 'higher. It vibrates ' + (diff === 12 ? 'twice' : 'four times') + ' as fast.' : 'lower. It vibrates ' + (diff === -12 ? 'half' : 'a quarter') + ' as fast.'}`
       : `${diff > 0 ? 'Higher' : 'Lower'} by ${Math.abs(diff)} half step${Math.abs(diff) === 1 ? '' : 's'}. ${diff > 0 ? 'Faster' : 'Slower'} vibrations.`}</dd></div>}
     </dl>
    </>}
   </div>
  </div>

  <div className="mu-piano-wrap">
   {narrow && <div className="mu-oct" role="group" aria-label="Which part of the keyboard">
    <button onClick={() => setOct(0)} aria-pressed={oct === 0}>◀ Lower C4–C5</button>
    <button onClick={() => setOct(1)} aria-pressed={oct === 1}>Higher C5–C6 ▶</button>
   </div>}
   <Piano from={from} to={to} lit={beat ? beat.notes : []} letters={letters} spelling={spelling} onPlay={played} onRelease={released}
    label={`Piano keyboard from ${fullName(from)} to ${fullName(to)}. Arrow keys move, Enter plays. Letter keys from ${keyFor(from, from)} play notes too.`} />
  </div>

  <h3 className="mu-subhead">Big ideas</h3>
  <div className="mu-chips" role="group" aria-label="Big ideas about pitch">
   {ideas.map(i => <button key={i.id} aria-pressed={idea === i.id} aria-expanded={idea === i.id} onClick={() => pickIdea(i.id)}>{i.title}</button>)}
  </div>
  {current && <div className="mu-idea">
   <div className="mu-idea-head">
    <h4>{current.title}</h4>
    <button className="mu-primary" onClick={demo}>{player.playing ? '■ Stop' : '▶ Hear it'}</button>
   </div>
   {current.text.map(p => <p key={p}>{p}</p>)}
   <div className="challenge"><strong>Think:</strong> {current.ask}</div>
  </div>}
  <p className="note">Frequencies are for standard tuning, where the A above middle C vibrates 440 times a second; they are rounded to whole numbers. The wave is a model: real instruments make more complicated wave shapes, and this keyboard plays a computer-made tone, not a recorded piano.</p>
  <div className="mu-sr" aria-live="polite">{said}</div>
 </div>;
}
