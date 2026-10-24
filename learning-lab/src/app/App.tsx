import { useState } from 'react';
import { lessons, type Lesson } from '../registry';
import { sections, type Section } from '../sections';
const icon = (s: Lesson['subject']) => s === 'math' ? '◩' : s === 'music' ? '♪' : s === 'english' ? '✎' : '☁';
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
export default function App() {
  const [section, setSection] = useState<Section | null>(null);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [subject, setSubject] = useState<'all' | Lesson['subject']>('all');
  const inSection = section ? lessons.filter(l => l.section === section.id) : [];
  const subjects = [...new Set(inSection.map(l => l.subject))];
  const visible = inSection.filter(l => subject === 'all' || l.subject === subject);
  const home = () => { setSection(null); setSelected(null); setSubject('all'); };
  const open = (s: Section) => { setSection(s); setSelected(null); setSubject('all'); };
  return <div className="shell">
    <header className="topbar"><button className="brand" onClick={home}>✦ Learning Lab</button><span>{section ? `${section.title} · ${subjects.map(cap).join(', ')}` : 'Interactive lessons · Grade school and beyond'}</span></header>
    {selected && section ? <main className="content"><button className="back" onClick={() => setSelected(null)}>← {section.title} lessons</button><div className="eyebrow">{selected.subject.toUpperCase()} · {selected.durationMinutes} MIN · {selected.status.toUpperCase()}</div><h1>{selected.title}</h1><p className="lede">{selected.summary}</p><section className="lesson"><selected.Component /></section><p className="note">{section.reviewNote}</p></main>
    : section ? <main className="content"><button className="back" onClick={home}>← All sections</button><div className="hero"><div className="eyebrow">{section.audience.toUpperCase()}</div><h1>{section.title}</h1><p>{section.summary}</p></div><div className="filters" aria-label="Filter lessons">{(['all', ...subjects] as const).map(s => <button key={s} className={subject === s ? 'selected' : ''} onClick={() => setSubject(s)}>{s === 'all' ? 'All lessons' : cap(s)}</button>)}</div><div className="cards">{visible.map(l=><button key={l.id} className="lesson-card" onClick={() => setSelected(l)}><span className="card-icon">{icon(l.subject)}</span><span className="eyebrow">{l.subject.toUpperCase()} · {l.durationMinutes} MIN</span><strong>{l.title}</strong><span>{l.summary}</span><span className="start">Explore →</span></button>)}</div></main>
    : <main className="content"><div className="hero"><div className="eyebrow">DISCOVER · EXPERIMENT · LEARN</div><h1>Big ideas you can explore.</h1><p>Interactive lessons organized by level. Choose a section to see its lessons.</p></div><h2 className="section-heading">Sections</h2><div className="cards">{sections.map(s => { const count = lessons.filter(l => l.section === s.id).length; return <button key={s.id} className="lesson-card" onClick={() => open(s)}><span className="card-icon">{s.icon}</span><span className="eyebrow">{s.audience.toUpperCase()} · {count} LESSON{count === 1 ? '' : 'S'}</span><strong>{s.title}</strong><span>{s.summary}</span><span className="start">Browse →</span></button>; })}<div className="lesson-card soon-card"><span className="eyebrow">COMING LATER</span><strong>More advanced sections</strong><span>Sections for higher levels will appear here as lessons are written for them.</span></div></div></main>}
    <footer>Made for curious minds · Teacher or subject-expert review recommended before use</footer>
  </div>;
}
