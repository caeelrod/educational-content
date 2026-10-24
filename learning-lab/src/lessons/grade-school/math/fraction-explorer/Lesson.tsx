import { useState } from 'react';
export default function FractionExplorer() {
 const [parts, setParts] = useState(4);
 const [filled, setFilled] = useState(2);
 const safeFilled = Math.min(parts,filled);
 return <div className="activity"><h2>Build a fraction</h2><p>Change the number of equal parts, then choose how many are shaded.</p><div className="controls"><label>Equal parts: <strong>{parts}</strong><input type="range" min="2" max="12" value={parts} onChange={e=>{const next=Number(e.target.value);setParts(next);setFilled(v=>Math.min(v,next));}} /></label><label>Shaded parts: <strong>{safeFilled}</strong><input type="range" min="0" max={parts} value={safeFilled} onChange={e=>setFilled(Number(e.target.value))}/></label></div><div className="fraction-bar" role="img" aria-label={`${safeFilled} of ${parts} equal parts shaded`}>{Array.from({length:parts},(_,i)=><div key={i} className={i<safeFilled?'filled':''} />)}</div><div className="big-number">{safeFilled}<span>/</span>{parts}</div><p>{safeFilled} out of {parts} equal parts are shaded.</p><div className="challenge"><strong>Think about it:</strong> Can you show one-half in three different ways? What changes and what stays the same?</div></div>;
}
