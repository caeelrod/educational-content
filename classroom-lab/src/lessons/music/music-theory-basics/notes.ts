// Pitches are MIDI note numbers: 60 is middle C (C4) and each step of 1 is a half step.
export const MIDDLE_C = 60;
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export type Letter = typeof LETTERS[number];
export type Spelling = 'sharp' | 'flat';

// For each of the 12 pitch classes: the letter it is written on and whether it needs a ♯ or ♭.
const SHARP: [Letter, number][] = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
const FLAT: [Letter, number][] = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]];

export const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
export const octaveOf = (midi: number) => Math.floor(midi / 12) - 1;
export const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);

export function spell(midi: number, s: Spelling = 'sharp') {
 const [letter, acc] = (s === 'sharp' ? SHARP : FLAT)[((midi % 12) + 12) % 12];
 // B♯ / C♭ never come up here, so the octave of the written letter matches the pitch.
 return { letter, acc, octave: octaveOf(midi) };
}

const accSign = (acc: number) => acc > 0 ? '♯' : acc < 0 ? '♭' : '';
const accWord = (acc: number) => acc > 0 ? ' sharp' : acc < 0 ? ' flat' : '';
export const name = (midi: number, s: Spelling = 'sharp') => { const n = spell(midi, s); return `${n.letter}${accSign(n.acc)}`; };
export const fullName = (midi: number, s: Spelling = 'sharp') => `${name(midi, s)}${octaveOf(midi)}`;
export const spoken = (midi: number, s: Spelling = 'sharp') => { const n = spell(midi, s); return `${n.letter}${accWord(n.acc)} ${n.octave}`; };
export const bothNames = (midi: number) => isBlack(midi) ? `${name(midi, 'sharp')} / ${name(midi, 'flat')}` : name(midi);

// Staff step counts lines and spaces up from the bottom line of the treble staff (E4 = 0).
export function staffStep(midi: number, s: Spelling = 'sharp') {
 const n = spell(midi, s);
 return (n.octave - 4) * 7 + LETTERS.indexOf(n.letter) - 2;
}
export const stepY = (step: number) => 40 - step * 5; // staff lines are 10 units apart, top line at y = 0

const ordinal = ['1st', '2nd', '3rd', '4th', '5th'];
export function whereOnStaff(step: number) {
 if (step === -2) return 'on a short ledger line just below the staff';
 if (step === -1) return 'hanging just below the bottom line';
 if (step === 9) return 'sitting just above the top line';
 if (step < -2) return 'below the staff, on ledger lines';
 if (step > 9) return step % 2 === 0 ? 'on a ledger line above the staff' : 'above the staff, between ledger lines';
 return step % 2 === 0 ? `on the ${ordinal[step / 2]} line` : `in the ${ordinal[(step - 1) / 2]} space`;
}
export const onLine = (step: number) => step % 2 === 0;

// Note lengths in beats, for music with a quarter-note beat (like 4/4 time).
export type Value = 'whole' | 'dottedHalf' | 'half' | 'dottedQuarter' | 'quarter' | 'eighth';
export const beatsOf: Record<Value, number> = { whole: 4, dottedHalf: 3, half: 2, dottedQuarter: 1.5, quarter: 1, eighth: 0.5 };
export const valueNames: Record<Value, string> = {
 whole: 'whole note', dottedHalf: 'dotted half note', half: 'half note', dottedQuarter: 'dotted quarter note', quarter: 'quarter note', eighth: 'eighth note'
};
export const valueFor = (beats: number) => (Object.keys(beatsOf) as Value[]).find(v => beatsOf[v] === beats)!;
export const restNames: Partial<Record<Value, string>> = { whole: 'whole rest', half: 'half rest', quarter: 'quarter rest', eighth: 'eighth rest' };

export const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
export const beatsText = (b: number) => b === 0.5 ? 'half a beat' : b === 1.5 ? '1½ beats' : plural(b, 'beat');
