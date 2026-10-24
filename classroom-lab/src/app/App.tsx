import { useState } from 'react';
import { lessons, type Lesson } from '../registry';
export default function App() {
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [subject, setSubject] = useState<'all' | Lesson['subject']>('all');
  const visible = lessons.filter(l => subject === 'all' || l.subject === subject);
  return <div className="shell">
    <header className="topbar"><button className="brand" onClick={() => setSelected(null)}>✦ Classroom Lab</button><span>Grade 5 · Science, Math & Music</span></header>
    {selected ? <main className="content"><button className="back" onClick={() => setSelected(null)}>← All lessons</button><div className="eyebrow">{selected.subject.toUpperCase()} · {selected.durationMinutes} MIN · {selected.status.toUpperCase()}</div><h1>{selected.title}</h1><p className="lede">{selected.summary}</p><section className="lesson"><selected.Component /></section><p className="note">Teacher note: Demo content. Review accuracy, age appropriateness, and alignment before classroom use.</p></main> : <main className="content"><div className="hero"><div className="eyebrow">DISCOVER · EXPERIMENT · LEARN</div><h1>Big ideas. Little experiments.</h1><p>Choose an activity and explore science, mathematics, or music through hands-on discovery.</p></div><div className="filters" aria-label="Filter lessons">{(['all','science','math','music'] as const).map(s => <button key={s} className={subject === s ? 'selected' : ''} onClick={() => setSubject(s)}>{s === 'all' ? 'All lessons' : s[0].toUpperCase()+s.slice(1)}</button>)}</div><div className="cards">{visible.map(l=><button key={l.id} className="lesson-card" onClick={() => setSelected(l)}><span className="card-icon">{l.subject === 'math' ? '◩' : l.subject === 'music' ? '♪' : '☁'}</span><span className="eyebrow">{l.subject.toUpperCase()} · {l.durationMinutes} MIN</span><strong>{l.title}</strong><span>{l.summary}</span><span className="start">Explore →</span></button>)}</div></main>}
    <footer>Made for curious minds · Teacher-reviewed publication recommended</footer>
  </div>;
}
