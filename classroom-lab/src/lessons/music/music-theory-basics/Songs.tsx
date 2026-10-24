import { useEffect, useMemo, useState } from 'react';
import Piano from './Piano';
import Staff, { type Focus, type Item } from './Staff';
import { useNarrow, usePlayer, type Ev } from './audio';
import { beatsOf, fullName, isBlack, name, staffStep, valueNames, whereOnStaff, type Value } from './notes';

type Song = { id: string; title: string; credit: string; notes: [number, Value][] };
const C = 60, D = 62, E = 64, F = 65, G = 67, A = 69;
const q = 'quarter', h = 'half', w = 'whole', e8 = 'eighth', dq = 'dottedQuarter';
const songs: Song[] = [
 { id: 'buns', title: 'Hot Cross Buns', credit: 'Traditional English street cry',
  notes: [[E, q], [D, q], [C, h], [E, q], [D, q], [C, h], [C, e8], [C, e8], [C, e8], [C, e8], [D, e8], [D, e8], [D, e8], [D, e8], [E, q], [D, q], [C, h]] },
 { id: 'mary', title: 'Mary Had a Little Lamb', credit: 'Traditional American tune; words by Sarah Josepha Hale (1830)',
  notes: [[E, q], [D, q], [C, q], [D, q], [E, q], [E, q], [E, h], [D, q], [D, q], [D, h], [E, q], [G, q], [G, h],
   [E, q], [D, q], [C, q], [D, q], [E, q], [E, q], [E, q], [E, q], [D, q], [D, q], [E, q], [D, q], [C, w]] },
 { id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', credit: 'Traditional French melody ("Ah! vous dirai-je, maman"), first line',
  notes: [[C, q], [C, q], [G, q], [G, q], [A, q], [A, q], [G, h], [F, q], [F, q], [E, q], [E, q], [D, q], [D, q], [C, h]] },
 { id: 'joy', title: 'Ode to Joy', credit: 'Ludwig van Beethoven, Symphony No. 9 (1824), main theme',
  notes: [[E, q], [E, q], [F, q], [G, q], [G, q], [F, q], [E, q], [D, q], [C, q], [C, q], [D, q], [E, q], [E, dq], [D, e8], [D, h],
   [E, q], [E, q], [F, q], [G, q], [G, q], [F, q], [E, q], [D, q], [C, q], [C, q], [D, q], [E, q], [D, dq], [C, e8], [C, h]] }
];

function measuresOf(s: Song): Item[][] {
 const out: Item[][] = [[]];
 let beats = 0;
 for (const [m, v] of s.notes) {
  if (beats === 4) { out.push([]); beats = 0; }
  out[out.length - 1].push({ kind: 'note', midi: [m], value: v });
  beats += beatsOf[v];
 }
 return out;
}

type Step = { title: string; focus: Focus; letters?: boolean; text: (s: Song) => string; ask: string };
const usedValues = (s: Song) => [...new Set(s.notes.map(n => n[1]))].sort((a, b) => beatsOf[b] - beatsOf[a]);
const valueLine = (v: Value) => ({
 whole: 'a whole note (hollow, no stem) lasts 4 beats',
 dottedHalf: 'a dotted half note lasts 3 beats',
 half: 'a half note (hollow, with a stem) lasts 2 beats',
 dottedQuarter: 'a dotted quarter note lasts 1½ beats, because a dot adds half the note\'s length',
 quarter: 'a quarter note (filled in, with a stem) lasts 1 beat',
 eighth: 'an eighth note lasts half a beat; two of them are often joined by a beam'
})[v];

const steps: Step[] = [
 { title: 'The staff', focus: 'staff', text: () => 'Music is written on a staff: five lines and the four spaces between them. Notes written higher on the staff sound higher. Notes written lower sound lower.', ask: 'Find the highest note in this song. Is it near the top or the bottom of the staff?' },
 { title: 'The treble clef', focus: 'clef', text: () => 'The curly sign at the start of each line is the treble clef. Its curl wraps around the second line from the bottom and marks it as G, so it is also called the G clef. From that one line, you can work out every other note.', ask: 'Why might a song need a clef at all? What would be confusing without one?' },
 { title: 'The time signature', focus: 'time', text: () => 'The two numbers are the time signature. The top 4 means there are 4 beats in each measure. The bottom 4 means a quarter note gets one beat.', ask: 'If the top number were 3, how many beats would each measure have?' },
 { title: 'Measures and bar lines', focus: 'bars', text: s => `Bar lines divide the music into measures. In 4/4 time, each measure holds exactly 4 beats. This song has ${measuresOf(s).length} measures. The thick double bar line at the very end means "the end".`, ask: 'Pick one measure and add up its beats. Do you get 4?' },
 { title: 'Note shapes tell how long', focus: 'notes', text: s => `The shape of a note tells you how long to hold it. In this song, ${usedValues(s).map(valueLine).join('; ')}.`, ask: 'Clap the rhythm while you count "1, 2, 3, 4" for each measure.' },
 { title: 'Note positions tell how high', focus: 'lines', letters: true, text: s => `Where a note sits tells you its letter name. The lines from the bottom are E, G, B, D, F, and the spaces are F, A, C, E. This song uses ${[...new Set(s.notes.map(n => n[0]))].sort((a, b) => a - b).map(m => name(m)).join(', ')}.${s.notes.some(n => n[0] === C) ? ' Middle C sits on a short ledger line below the staff.' : ''}`, ask: 'Which note in this song sits on the bottom line? Which one hangs just below it?' },
 { title: 'Listen and follow', focus: null, text: () => 'Press Play and follow along. Each note lights up as it sounds. Try singing or humming along on the second time.', ask: 'Where does the tune go up? Where does it go down? Trace it in the air with your finger.' }
];

export default function Songs() {
 const narrow = useNarrow();
 const [songId, setSongId] = useState(songs[0].id);
 const [step, setStep] = useState(0);
 const [letters, setLetters] = useState(false);
 const [slow, setSlow] = useState(false);
 const [at, setAt] = useState(0);
 const [slips, setSlips] = useState(0);
 const [miss, setMiss] = useState(0); // misses on the current note
 const [wrong, setWrong] = useState<number | null>(null);
 const [showNext, setShowNext] = useState(false);
 const [said, setSaid] = useState('');
 const player = usePlayer();

 const song = songs.find(s => s.id === songId)!;
 const measures = useMemo(() => measuresOf(song), [song]);
 const quiz = step === steps.length;
 const s = steps[Math.min(step, steps.length - 1)];
 const done = quiz && at >= song.notes.length;
 const per = narrow ? 2 : 4;
 const systems = Array.from({ length: Math.ceil(measures.length / per) }, (_, i) => measures.slice(i * per, i * per + per));
 const spb = slow ? 0.85 : 0.6;

 // Which note is sounding now.
 let active: number | null = null;
 if (player.t !== null) {
  let t = 0;
  for (let i = 0; i < song.notes.length; i++) { const d = beatsOf[song.notes[i][1]] * spb; if (player.t < t + d) { active = i; break; } t += d; }
 }
 const target = quiz && !done ? song.notes[at][0] : null;
 const hintOn = quiz && !done && (showNext || miss >= 2);

 useEffect(() => { player.stop(); }, [songId, step, slow]);

 function go(n: number) { setStep(n); resetTurn(); }
 function resetTurn() { setAt(0); setSlips(0); setMiss(0); setWrong(null); setSaid(''); }
 function pickSong(id: string) { setSongId(id); resetTurn(); }

 function listen() {
  if (player.playing) { player.stop(); return; }
  const ev: Ev[] = [];
  let t = 0;
  for (const [m, v] of song.notes) { const d = beatsOf[v] * spb; ev.push({ t, dur: d * 0.9, midi: m }); t += d; }
  player.play(ev, t);
 }

 function played(m: number) {
  if (!quiz || done || target === null) return;
  if (m === target) {
   const next = at + 1;
   setAt(next); setMiss(0); setWrong(null);
   setSaid(next >= song.notes.length ? `You played the whole song!` : `${name(m)}. Next note.`);
   return;
  }
  setSlips(slips + 1); setMiss(miss + 1); setWrong(m);
  setSaid(`You played ${fullName(m)}. Try again.`);
 }

 const wrongText = () => {
  if (wrong === null || target === null) return '';
  if (isBlack(wrong)) return `That's a black key (${name(wrong, 'sharp')} / ${name(wrong, 'flat')}). This song uses only white keys.`;
  const gap = staffStep(target) - staffStep(wrong);
  const dir = gap > 0 ? 'higher' : 'lower';
  const by = Math.abs(gap) === 1 ? 'one step' : `${Math.abs(gap)} steps`;
  return `You played ${name(wrong)}. The next note is ${by} ${dir}. Look at the note: it is ${whereOnStaff(staffStep(target))}.`;
 };

 let offset = 0;
 return <div className="mu-songs">
  <div className="mu-toolbar">
   <div className="mu-seg" role="group" aria-label="Song">
    {songs.map(x => <button key={x.id} aria-pressed={songId === x.id} onClick={() => pickSong(x.id)}>{x.title}</button>)}
   </div>
  </div>
  <div className="mu-score">
   <div className="mu-score-head"><strong>{song.title}</strong><span>{song.credit}</span></div>
   {systems.map((sys, i) => {
    const start = offset; offset += sys.reduce((a, m) => a + m.length, 0);
    const local = (k: number | null) => k !== null && k >= start && k < offset ? k - start : null;
    return <Staff key={`${songId}-${i}-${per}`} measures={sys} time={i === 0} final={i === systems.length - 1}
     focus={quiz || (s.focus === 'time' && i > 0) ? null : s.focus}
     letters={letters || (!quiz && !!s.letters)} active={local(active)} hint={local(quiz && !done ? at : null)}
     className={hintOn ? 'show-hint' : ''}
     label={`${song.title}, line ${i + 1} of ${systems.length}: ${sys.map(m => m.map(it => it.kind === 'note' ? `${fullName(it.midi[0])} ${valueNames[it.value]}` : '').join(', ')).join('. Bar line. ')}.`} />;
   })}
  </div>

  <div className="mu-songs-panel">
   <div className="step-dots" role="group" aria-label="Steps">
    {steps.map((st, i) => <button key={st.title} aria-label={`Step ${i + 1}: ${st.title}`} aria-pressed={step === i} className={step === i ? 'active' : ''} onClick={() => go(i)}>{i + 1}</button>)}
    <button aria-label="Your turn: play the song" aria-pressed={quiz} className={quiz ? 'active' : ''} onClick={() => go(steps.length)}>★</button>
   </div>
   {!quiz ? <div aria-live="polite">
    <div className="eyebrow">STEP {step + 1} OF {steps.length}</div>
    <h3>{s.title}</h3>
    <p>{s.text(song)}</p>
    <div className="challenge"><strong>Discuss:</strong> {s.ask}</div>
   </div> : <div>
    <div className="eyebrow">YOUR TURN</div>
    <h3>Play it by reading</h3>
    <p>Read each note and press the matching key. Take your time: only the order of the notes counts here, not the rhythm. The orange box shows which note is next.</p>
    <div className="mu-progress" aria-label={`${Math.min(at, song.notes.length)} of ${song.notes.length} notes played`}>
     <span style={{ width: `${(Math.min(at, song.notes.length) / song.notes.length) * 100}%` }} />
    </div>
   </div>}
   <div className="mu-actions">
    <button className={!quiz && step === steps.length - 1 ? 'mu-primary' : ''} onClick={listen}>{player.playing ? '■ Stop' : '▶ Listen'}</button>
    <div className="mu-seg" role="group" aria-label="Speed">
     <button aria-pressed={!slow} onClick={() => setSlow(false)}>Medium</button>
     <button aria-pressed={slow} onClick={() => setSlow(true)}>Slow</button>
    </div>
    <label className="mu-check"><input type="checkbox" checked={letters} onChange={e => setLetters(e.target.checked)} /> Letter names</label>
   </div>
   <div className="lesson-nav">
    <button disabled={step === 0} onClick={() => go(step - 1)}>← Previous</button>
    <button onClick={() => go(quiz ? 0 : step + 1)}>{quiz ? 'Start over ↻' : step === steps.length - 1 ? 'Your turn →' : 'Next step →'}</button>
   </div>
  </div>

  {quiz && <div className="mu-play">
   <div aria-live="polite">
    {done ? <div className="mu-feedback right"><p className="mu-headline">You played “{song.title}”!</p>
     <p>{slips === 0 ? 'Every note right on the first try.' : `You found every note, with ${slips} slip${slips === 1 ? '' : 's'} along the way.`} Now try it again with the rhythm: hold each note for its full length.</p>
     <div className="mu-actions"><button className="mu-primary" onClick={resetTurn}>Play it again</button>
      <button onClick={() => pickSong(songs[(songs.indexOf(song) + 1) % songs.length].id)}>Next song →</button></div>
    </div>
     : wrong !== null ? <div className="mu-feedback wrong"><p>{wrongText()}</p>{miss >= 2 && <p>The right key is glowing now.</p>}</div>
     : <p className="mu-hint">{at === 0 ? `The first note is ${letters ? name(song.notes[0][0]) : 'boxed in orange'}. Find it on the piano.` : `Note ${at + 1} of ${song.notes.length}.`}</p>}
   </div>
   <label className="mu-check"><input type="checkbox" checked={showNext} onChange={e => setShowNext(e.target.checked)} /> Light up the next key</label>
   {narrow && !done && (() => {
    // On a phone the score is far above the piano, so repeat the line being played right here.
    let start = 0;
    for (const sys of systems) {
     const n = sys.reduce((a, m) => a + m.length, 0);
     if (at < start + n) return <Staff measures={sys} time={false} final={false} hint={at - start} letters={letters} className="mu-near" label={`The line you are playing. Next note: number ${at - start + 1} on this line.`} />;
     start += n;
    }
    return null;
   })()}
   <Piano from={60} to={72} letters={letters} hint={hintOn ? target : null} onPlay={played} label="Piano keyboard from C4 to C5. Arrow keys move, Enter plays. A S D F G H J K play the white keys." />
  </div>}
  <p className="note">Melodies are written in C so they fit the white keys. They are traditional or very old (public domain), and the arrangements are our own. Ode to Joy is shown as it is often taught to beginners.</p>
  <div className="mu-sr" aria-live="polite">{said}</div>
 </div>;
}
