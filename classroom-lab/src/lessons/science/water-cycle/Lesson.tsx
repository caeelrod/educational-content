import { useState } from 'react';
const steps = [
 {name:'Evaporation', desc:'Energy from the Sun warms liquid water. Some water becomes water vapor, a gas, and rises into the air.', prompt:'Where does the energy for evaporation come from?'},
 {name:'Condensation', desc:'As moist air cools, water vapor can change into tiny liquid water droplets that form clouds.', prompt:'Why might clouds form when moist air cools?'},
 {name:'Precipitation', desc:'Water falls from clouds as rain, snow, sleet, or hail when droplets or ice particles become large enough.', prompt:'What forms of precipitation have you observed?'},
 {name:'Collection and movement', desc:'Water gathers in streams, lakes, oceans, soil, and groundwater. Water can also move through living things.', prompt:'Where could a raindrop travel next?'}
];
export default function WaterCycle() {
 const [step,setStep] = useState(0);
 return <div className="activity"><h2>Follow a drop of water</h2><p>Use the controls to move through the stages of a simplified water cycle.</p><div className="water-art" role="img" aria-label="Illustration of the sun, clouds, mountains and a lake"><span className="sun">☀</span><span className="cloud">☁</span><span className="mountain">▲ ▲</span><span className="lake">≈ ≈ ≈ ≈ ≈</span><div className="stage-marker">{['↑ Water vapor','☁ Cloud droplets','↓ Rain or snow','→ Water moves'][step]}</div></div><div className="step-dots" aria-label="Water cycle stages">{steps.map((s,i)=><button key={s.name} aria-label={s.name} aria-pressed={step===i} className={step===i?'active':''} onClick={()=>setStep(i)}>{i+1}</button>)}</div><h3>{steps[step].name}</h3><p>{steps[step].desc}</p><div className="challenge"><strong>Discuss:</strong> {steps[step].prompt}</div><div className="lesson-nav"><button onClick={()=>setStep((step+3)%4)}>← Previous</button><button onClick={()=>setStep((step+1)%4)}>Next stage →</button></div><p className="note">This is a conceptual illustration; the water cycle is continuous and does not always follow these stages in a fixed order.</p></div>;
}
