import { useEffect, useState, type KeyboardEvent } from 'react';
import Explore from './Explore';
import Rhythm from './Rhythm';
import Songs from './Songs';
import Game from './Game';
import { canPlay, isMuted, setMuted, setVolume, stopAll, usePlayer, useSound } from './audio';

type Mode = 'explore' | 'rhythm' | 'songs' | 'game';
const modes: { id: Mode; label: string }[] = [
 { id: 'explore', label: '🎹 Pitch explorer' },
 { id: 'rhythm', label: '🥁 Rhythm builder' },
 { id: 'songs', label: '🎼 Read a song' },
 { id: 'game', label: '🎯 Name that note' }
];

function SoundBar() {
 const { muted, volume } = useSound();
 const test = usePlayer();
 if (!canPlay) return <div className="mu-soundbar off" role="status">This browser can't make sound here, so everything lights up instead.</div>;
 return <div className="mu-soundbar" role="group" aria-label="Sound">
  <button className={muted ? 'mu-muted' : ''} aria-pressed={muted} onClick={() => setMuted(!muted)} title="Mute (M)">
   {muted ? '🔇 Sound off' : '🔊 Sound on'}
  </button>
  <label className="mu-volume"><span>Volume</span>
   <input type="range" min={0} max={1} step={0.05} value={volume} disabled={muted} aria-valuetext={`${Math.round(volume * 100)}%`}
    onChange={e => setVolume(Number(e.target.value))} />
  </label>
  <button disabled={muted} onClick={() => test.play([60, 64, 67].map((m, i) => ({ t: i * 0.22, dur: 0.5, midi: m })), 0.9)}>Test sound</button>
  <span className="mu-sound-note">{muted ? 'Muted. Notes still light up so you can follow along.' : 'Press M to mute. Headphones help in a busy room.'}</span>
 </div>;
}

export default function MusicTheory() {
 const [mode, setMode] = useState<Mode>('explore');
 useEffect(() => () => stopAll(), []);

 function key(e: KeyboardEvent<HTMLDivElement>) {
  const t = e.target as HTMLElement;
  if (e.key.toLowerCase() !== 'm' || e.ctrlKey || e.metaKey || e.altKey || t.closest('input[type=text], textarea')) return;
  setMuted(!isMuted());
 }

 return <div className="activity mu" onKeyDown={key}>
  <h2>Learn the language of music</h2>
  <p>Music has its own language. Explore how high and low notes work, build rhythms out of long and short sounds, learn to read a real song, and test your eyes and ears.</p>
  <SoundBar />
  <div className="mu-modes" role="group" aria-label="Activity">
   {modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => { stopAll(); setMode(m.id); }}>{m.label}</button>)}
  </div>
  {mode === 'explore' && <Explore />}
  {mode === 'rhythm' && <Rhythm />}
  {mode === 'songs' && <Songs />}
  {mode === 'game' && <Game />}
 </div>;
}
