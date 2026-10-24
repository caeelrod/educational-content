import type { CSSProperties } from 'react';
import { format, placeNames, powerWithCommas, type Call, type Num } from './decimal';

// A place-value chart showing the other way to see the same move: the decimal point stays put
// between the ones and tenths, and every digit slides into a new place.

function cell(n: Num, place: number): { text: string; zero: boolean } {
 const slot = n.point - 1 - place;
 if (slot >= 0 && slot < n.digits.length) return { text: n.digits[slot], zero: false };
 const lastPlace = n.point - n.digits.length; // place of the last significant digit
 const firstPlace = n.point - 1;
 if (place >= 0 && place < lastPlace) return { text: '0', zero: true };   // whole-number placeholder
 if (place < 0 && place > firstPlace) return { text: '0', zero: true };   // decimal placeholder
 if (place === 0 && firstPlace < 0) return { text: '0', zero: true };     // 0 in the ones place
 return { text: '', zero: false };
}

export default function PlaceChart({ before, after, call }: { before: Num; after: Num; call: Call }) {
 const len = before.digits.length;
 const hi = Math.max(0, before.point - 1, after.point - 1);
 const lo = Math.min(0, before.point - len, after.point - len);
 const places = Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
 const times = call.op === 'times';
 const shift = times ? call.power : -call.power; // columns each digit came from, to the right
 const first = before.digits[0];
 const s = call.power === 1 ? '' : 's';

 return <figure className="dm-chart">
  <div className="dm-chart-scroll">
   <table>
    <caption className="dm-sr">Place-value chart before and after {times ? 'multiplying' : 'dividing'} by {powerWithCommas(call.power)}</caption>
    <thead><tr><th scope="col"><span className="dm-sr">Row</span></th>{places.map(p => <th key={p} scope="col" className={p === 0 ? 'dm-ones' : ''}>{placeNames[p]}</th>)}</tr></thead>
    <tbody>
     {[{ n: before, name: 'Before' }, { n: after, name: 'After' }].map(({ n, name }, row) => <tr key={name}>
      <th scope="row">{name}<small>{format(n)}</small></th>
      {places.map(p => {
       const c = cell(n, p);
       const style = row === 1 && c.text && !c.zero ? { '--from': shift } as CSSProperties : undefined;
       return <td key={`${p}-${format(n)}`} className={`${p === 0 ? 'dm-ones' : ''}${row === 1 && c.text ? (c.zero ? ' dm-pop' : ' dm-slide') : ''}${c.zero ? ' dm-ph' : ''}`} style={style}>{c.text}</td>;
      })}
     </tr>)}
    </tbody>
   </table>
  </div>
  <figcaption>
   The point never really moves. Every digit slides <strong>{call.power} place{s} to the {times ? 'left' : 'right'}</strong>, into a place worth {times ? `${powerWithCommas(call.power)} times as much` : `1/${powerWithCommas(call.power)} as much`}.
   {' '}The {first} went from the <strong>{placeNames[before.point - 1]}</strong> place to the <strong>{placeNames[after.point - 1]}</strong> place.
  </figcaption>
 </figure>;
}
