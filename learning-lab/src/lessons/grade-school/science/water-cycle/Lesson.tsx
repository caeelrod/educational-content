import { useState } from 'react';
const steps = [
 {name:'Evaporation', desc:'Energy from the Sun warms liquid water. Some water becomes water vapor, a gas, and rises into the air.', prompt:'Where does the energy for evaporation come from?',
  scene:'The Sun shines on the ocean. Wavy lines show invisible water vapor rising from the ocean surface.'},
 {name:'Condensation', desc:'As moist air cools, water vapor can change into tiny liquid water droplets that form clouds.', prompt:'Why might clouds form when moist air cools?',
  scene:'Moist air rises up the hillside and cools. Tiny droplets gather together to form a cloud.'},
 {name:'Precipitation', desc:'Water falls from clouds as rain, snow, sleet, or hail when droplets or ice particles become large enough.', prompt:'What forms of precipitation have you observed?',
  scene:'Rain falls from the cloud onto the hillside.'},
 {name:'Collection and movement', desc:'Water gathers in streams, lakes, oceans, soil, and groundwater. Water can also move through living things.', prompt:'Where could a raindrop travel next?',
  scene:'Rainwater runs downhill to the ocean as a stream. Some soaks into the ground and becomes groundwater that slowly moves toward the ocean.'}
];

export default function WaterCycle() {
 const [step,setStep] = useState(0);
 const on = (i: number) => `wc-proc${step === i ? ' active' : ''}`;
 const last = step === steps.length - 1;
 return <div className="activity"><h2>Follow a drop of water</h2><p>Use the controls to move through the stages of a simplified water cycle. The highlighted part of the picture shows what happens at each stage.</p>
  <div className="water-art">
   <svg viewBox="0 0 640 320" role="img" aria-labelledby="wc-scene-title">
    <title id="wc-scene-title">{`Stage ${step + 1}, ${steps[step].name}: ${steps[step].scene}`}</title>
    <defs><linearGradient id="wc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd0ef" /><stop offset="1" stopColor="#dff1f7" /></linearGradient></defs>
    <rect width="640" height="320" fill="url(#wc-sky)" />
    <g className="wc-sun"><circle cx="60" cy="55" r="22" />{[0,45,90,135,180,225,270,315].map(a => <line key={a} x1="60" y1="21" x2="60" y2="9" transform={`rotate(${a} 60 55)`} />)}</g>
    <rect className="wc-ocean" x="0" y="220" width="320" height="100" />
    <path className="wc-land" d="M250 320 Q262 236 300 227 C370 216 425 150 510 118 C560 102 600 125 640 140 L640 320 Z" />
    <rect className="wc-groundwater" x="262" y="292" width="378" height="20" />

    <g className={on(0)}>
     <g className="wc-rise">{[100,160,220].map((x,i) => <path key={x} style={{animationDelay:`${i * .5}s`}} d={`M${x} 210 q8 -10 0 -20 q-8 -10 0 -20 q8 -10 0 -20 q-8 -10 0 -20`} />)}</g>
     <text x="160" y="104" textAnchor="middle">Evaporation</text>
    </g>
    <g className={on(1)}>
     <path className="wc-airflow" d="M340 205 C380 185 400 140 420 108" />
     <path className="wc-arrowhead" d="M410 112 L421 104 L424 118" />
     <g className="wc-cloud"><circle cx="400" cy="72" r="22" /><circle cx="428" cy="60" r="28" /><circle cx="458" cy="72" r="22" /><rect x="400" y="72" width="58" height="22" /></g>
     <g className="wc-droplets">{[[410,80],[425,70],[440,82],[452,68],[432,56]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="2.5" style={{animationDelay:`${i * .3}s`}} />)}</g>
     <text x="428" y="24" textAnchor="middle">Condensation</text>
    </g>
    <g className={on(2)}>
     <g className="wc-rain">{[408,422,436,450,464].map((x,i) => <line key={x} x1={x} y1="100" x2={x - 3} y2="112" style={{animationDelay:`${(i % 3) * .25}s`}} />)}</g>
     <text x="478" y="102">Precipitation</text>
    </g>
    <g className={on(3)}>
     <path className="wc-flow wc-runoff" d="M470 138 C430 160 400 190 360 212 C335 224 315 224 292 226" />
     {[540,580,610].map(x => <path key={x} className="wc-flow wc-soak" d={`M${x} ${x === 540 ? 118 : 128} L${x} 284`} />)}
     <path className="wc-flow wc-soak" d="M600 302 L275 302" />
     <text x="330" y="196" textAnchor="end">Runoff</text>
     <text x="470" y="284" textAnchor="middle">Groundwater</text>
    </g>
   </svg>
  </div>
  <div className="step-dots" aria-label="Water cycle stages">{steps.map((s,i)=><button key={s.name} aria-label={s.name} aria-pressed={step===i} className={step===i?'active':''} onClick={()=>setStep(i)}>{i+1}</button>)}</div>
  <div aria-live="polite"><h3>{steps[step].name}</h3><p>{steps[step].desc}</p></div>
  <div className="challenge"><strong>Discuss:</strong> {steps[step].prompt}</div>
  <div className="lesson-nav"><button disabled={step===0} onClick={()=>setStep(step-1)}>← Previous</button><button onClick={()=>setStep((step+1)%steps.length)}>{last ? 'Back to evaporation ↻' : 'Next stage →'}</button></div>
  <p className="note">This is a simplified model, not drawn to scale. The water cycle is continuous, and water does not always follow these stages in a fixed order. Water vapor is invisible; the wavy lines only show where it goes.</p></div>;
}
